// ============================================
// BANCO DE DADOS — SQLite com sql.js
// Pessoa 2 é responsável por este arquivo
// ============================================

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'data', 'database.sqlite');
let db;
let dbMode = 'sqlite';

let pgPool = null;

function getPool() {
  if (!pgPool) {
    const { Pool } = require('pg');
    pgPool = new Pool({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pgPool;
}

function isPostgresEnabled() {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

function normalizeValue(value) {
  if (typeof value === 'string' && /^-?\d+$/.test(value)) {
    return Number(value);
  }
  return value;
}

function normalizeRow(row) {
  if (!row) return row;
  const normalized = {};
  Object.entries(row).forEach(([key, value]) => {
    normalized[key] = normalizeValue(value);
  });
  return normalized;
}

function convertParams(sqlText) {
  let index = 0;
  return sqlText.replace(/\?/g, () => `$${++index}`);
}

function wrapPostgres() {
  const pool = getPool();

  return {
    raw: pool,
    async exec(sqlText) {
      await pool.query(sqlText);
    },
    prepare(sqlText) {
      const converted = convertParams(sqlText);
      return {
        async run(...params) {
          return pool.query(converted, params);
        },
        async get(...params) {
          const result = await pool.query(converted, params);
          return normalizeRow(result.rows[0]);
        },
        async all(...params) {
          const result = await pool.query(converted, params);
          return result.rows.map(normalizeRow);
        }
      };
    }
  };
}

// Wrapper — facilita consultas ao banco
// db.prepare('SQL').get(params) → retorna UMA linha
// db.prepare('SQL').all(params) → retorna TODAS as linhas
// db.prepare('SQL').run(params) → executa INSERT, UPDATE, DELETE
function wrapDb(rawDb) {
  return {
    raw: rawDb,
    async exec(sql) {
      rawDb.run(sql);
    },
    prepare(sql) {
      return {
        async run(...params) {
          rawDb.run(sql, params);
          save();
        },
        async get(...params) {
          const stmt = rawDb.prepare(sql);
          stmt.bind(params);
          if (stmt.step()) {
            const cols = stmt.getColumnNames();
            const vals = stmt.get();
            stmt.free();
            const obj = {};
            cols.forEach((c, i) => obj[c] = vals[i]);
            return obj;
          }
          stmt.free();
          return undefined;
        },
        async all(...params) {
          const results = [];
          const stmt = rawDb.prepare(sql);
          stmt.bind(params);
          while (stmt.step()) {
            const cols = stmt.getColumnNames();
            const vals = stmt.get();
            const obj = {};
            cols.forEach((c, i) => obj[c] = vals[i]);
            results.push(obj);
          }
          stmt.free();
          return results;
        }
      };
    }
  };
}

// Salva o banco no disco após cada alteração
function save() {
  if (db && dbMode === 'sqlite') {
    const data = db.raw.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

async function initializePostgresDatabase() {
  db = wrapPostgres();

  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS dogs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age TEXT NOT NULL,
    vaccines TEXT,
    condition TEXT,
    description TEXT,
    photo TEXT,
    available INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS adoptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dog_id INTEGER NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS place_info (
    id INTEGER PRIMARY KEY,
    name TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    description TEXT,
    facebook TEXT,
    instagram TEXT,
    whatsapp TEXT
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS place_photos (
    id SERIAL PRIMARY KEY,
    photo TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS hosts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    housing TEXT,
    has_yard TEXT,
    experience TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  const adminExists = await db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    await db.prepare('INSERT INTO users (name,email,phone,cpf,address,password,role) VALUES (?,?,?,?,?,?,?)')
      .run('Administrador', 'admin@abrigo.com', '(00)00000-0000', '00000000000', 'Endereço do Abrigo', hash, 'admin');
  }

  const placeExists = await db.prepare('SELECT id FROM place_info WHERE id = 1').get();
  if (!placeExists) {
    await db.prepare('INSERT INTO place_info (id, name,address,phone,email,description,facebook,instagram,whatsapp) VALUES (?,?,?,?,?,?,?,?,?)')
      .run(1, 'Abrigo Patinhas Felizes', 'Rua Exemplo, 123', '(00)00000-0000', 'contato@abrigo.com',
        'Nosso abrigo cuida de cães abandonados com muito amor.', '', '', '');
  }

  return db;
}

async function initializeDatabase() {
  if (isPostgresEnabled()) {
    dbMode = 'postgres';
    return initializePostgresDatabase();
  }

  dbMode = 'sqlite';
  const SQL = await initSqlJs();

  // Carrega banco existente ou cria um novo
  if (fs.existsSync(dbPath)) {
    db = wrapDb(new SQL.Database(fs.readFileSync(dbPath)));
  } else {
    db = wrapDb(new SQL.Database());
  }

  // Tabela de usuários (clientes e admin)
  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    cpf TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de cães
  await db.exec(`CREATE TABLE IF NOT EXISTS dogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age TEXT NOT NULL,
    vaccines TEXT,
    condition TEXT,
    description TEXT,
    photo TEXT,
    available INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de adoções (liga usuário a cão)
  await db.exec(`CREATE TABLE IF NOT EXISTS adoptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    dog_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (dog_id) REFERENCES dogs(id)
  )`);

  // Tabela de informações do local
  await db.exec(`CREATE TABLE IF NOT EXISTS place_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT, address TEXT, phone TEXT, email TEXT,
    description TEXT, facebook TEXT, instagram TEXT, whatsapp TEXT
  )`);

  // Tabela de fotos do local
  await db.exec(`CREATE TABLE IF NOT EXISTS place_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo TEXT NOT NULL, caption TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de acolhedores
  await db.exec(`CREATE TABLE IF NOT EXISTS hosts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    housing TEXT,
    has_yard TEXT,
    experience TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  const adminExists = await db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    await db.prepare('INSERT INTO users (name,email,phone,cpf,address,password,role) VALUES (?,?,?,?,?,?,?)')
      .run('Administrador', 'admin@abrigo.com', '(00)00000-0000', '00000000000', 'Endereço do Abrigo', hash, 'admin');
  }

  // Cria dados iniciais do local
  const placeExists = await db.prepare('SELECT id FROM place_info WHERE id = 1').get();
  if (!placeExists) {
    await db.prepare('INSERT INTO place_info (name,address,phone,email,description,facebook,instagram,whatsapp) VALUES (?,?,?,?,?,?,?,?)')
      .run('Abrigo Patinhas Felizes', 'Rua Exemplo, 123', '(00)00000-0000', 'contato@abrigo.com',
        'Nosso abrigo cuida de cães abandonados com muito amor.', '', '', '');
  }

  save();
  return db;
}

function getDb() { return db; }

module.exports = { initializeDatabase, getDb };
