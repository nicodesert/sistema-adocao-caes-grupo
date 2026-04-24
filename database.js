// database.js
// Pessoa 2 é responsável pelo arquivo.

const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

let db;

const DB_FILE = path.resolve("data/database.sqlite");

async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    const fileBuffer = fs.readFileSync(DB_FILE);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT
    );
  `);
}

function saveDatabase() {
  const data = db.export();
  fs.writeFileSync(DB_FILE, Buffer.from(data));
}

function createUsuario(nome, email) {
  db.run(
    "INSERT INTO usuarios (nome, email) VALUES (?, ?)",
    [nome, email]
  );
  saveDatabase();
}

function getUsuarios() {
  const stmt = db.prepare("SELECT * FROM usuarios");
  const result = [];

  while (stmt.step()) {
    result.push(stmt.getAsObject());
  }

  return result;
}

module.exports = {
  initDatabase,
  createUsuario,
  getUsuarios,
};