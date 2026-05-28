// ============================================
// ROTA DO LOCAL — Informações públicas
// Pessoa 5 é responsável por este arquivo
// ============================================

const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

router.get('/', async (req, res) => {
  const db = getDb();
  const place = await db.prepare('SELECT * FROM place_info LIMIT 1').get();
  const photos = await db.prepare('SELECT * FROM place_photos ORDER BY created_at DESC').all();
  res.json({ place, photos });
});

module.exports = router;
