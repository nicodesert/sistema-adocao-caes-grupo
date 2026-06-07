// ============================================
// SERVIDOR PRINCIPAL — Sistema de Adoção de Cães
// Pessoa 1 é responsável por este arquivo
// ============================================

const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { attachAuth } = require('./lib/auth');
const { initializeDatabase } = require('./database');

let initializationPromise;

function ensureLocalDirectories() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return;
  if (process.env.POSTGRES_URL || process.env.DATABASE_URL) return;

  ['data', 'public/uploads/dogs', 'public/uploads/place'].forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
  });
}

function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(attachAuth);

  // ── Rotas de API ──────────────────────────────────────────────
  app.use('/api/auth',    require('./routes/auth'));
  app.use('/api/dogs',    require('./routes/dogs'));
  app.use('/api/admin',   require('./routes/admin'));
  app.use('/api/place',   require('./routes/place'));
  app.use('/api/contact', require('./routes/contact')); // ← NOVO

  // ── Rotas limpas — páginas públicas ──────────────────────────
  const pub = (file) => (req, res) =>
    res.sendFile(path.join(__dirname, 'public', file));

  app.get('/',               pub('index.html'));
  app.get('/inicio',         pub('index.html'));
  app.get('/caes',           pub('dogs.html'));
  app.get('/caes/:id',       pub('dog-detail.html'));
  app.get('/local',          pub('place.html'));
  app.get('/login',          pub('login.html'));
  app.get('/cadastro',       pub('register.html'));
  app.get('/minhas-adocoes', pub('my-adoptions.html'));

  // ── Rotas limpas — painel admin ───────────────────────────────
  const adm = (file) => (req, res) =>
    res.sendFile(path.join(__dirname, 'public', 'admin', file));

  app.get('/admin',                   adm('index.html'));
  app.get('/admin/caes',              adm('dogs.html'));
  app.get('/admin/caes/novo',         adm('dog-form.html'));
  app.get('/admin/caes/editar',       adm('dog-form.html'));
  app.get('/admin/clientes',          adm('clients.html'));
  app.get('/admin/clientes/detalhes', adm('client-detail.html'));
  app.get('/admin/adocoes',           adm('adoptions.html'));
  app.get('/admin/local',             adm('place.html'));
  app.get('/admin/mensagens',         adm('messages.html')); // ← NOVO

  return app;
}

async function initializeApp() {
  if (!initializationPromise) {
    ensureLocalDirectories();
    initializationPromise = initializeDatabase();
  }
  await initializationPromise;
}

async function startServer() {
  await initializeApp();

  const app = createApp();
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log('Admin padrão: admin@abrigo.com / admin123');
  });
}

if (require.main === module) {
  startServer().catch(err => {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  });
}

module.exports = { createApp, initializeApp, startServer };
