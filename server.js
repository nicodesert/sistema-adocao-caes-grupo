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
  // No Vercel (Postgres ou Blob habilitado) o filesystem é somente leitura — não criar pastas
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

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/dogs', require('./routes/dogs'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/place', require('./routes/place'));

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

module.exports = {
  createApp,
  initializeApp,
  startServer
};
