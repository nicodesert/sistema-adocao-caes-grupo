const { createApp, initializeApp } = require('../server');

const app = createApp();

module.exports = async (req, res) => {
  try {
    await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error('=== ERRO AO INICIALIZAR ===');
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    console.error('POSTGRES_URL definida:', Boolean(process.env.POSTGRES_URL));
    console.error('DATABASE_URL definida:', Boolean(process.env.DATABASE_URL));
    console.error('BLOB_READ_WRITE_TOKEN definida:', Boolean(process.env.BLOB_READ_WRITE_TOKEN));
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message }));
  }
};