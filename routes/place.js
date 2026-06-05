// ============================================
// ROTAS DO LOCAL — Info pública + acolhedores
// Pessoa 8 é responsável por este arquivo
// ============================================

const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/place — retorna info do local + fotos
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const place = await db.prepare('SELECT * FROM place_info LIMIT 1').get();
    const photos = await db.prepare('SELECT * FROM place_photos ORDER BY created_at DESC').all();
    res.json({ place, photos });
  } catch (err) {
    console.error('[place/get]', err);
    res.status(500).json({ error: 'Erro ao buscar informações do local.' });
  }
});

// POST /api/place/host — cadastrar novo acolhedor
router.post('/host', async (req, res) => {
  try {
    const { name, email, phone, address, housing, hasYard, experience } = req.body;
    if (!name || !email || !phone || !address) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }
    const db = getDb();
    await db.prepare('INSERT INTO hosts (name,email,phone,address,housing,has_yard,experience) VALUES (?,?,?,?,?,?,?)')
      .run(name, email, phone, address, housing || '', hasYard || '', experience || '');
    res.json({ message: 'Solicitação de acolhimento enviada com sucesso!' });
  } catch (err) {
    console.error('[place/host]', err);
    res.status(500).json({ error: 'Erro ao enviar solicitação.' });
  }
});

module.exports = router;
