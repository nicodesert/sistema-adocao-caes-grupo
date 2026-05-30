// ============================================
// ROTAS DOS CÃES — Listagem e Adoção (usuário)
// Pessoa 5 é responsável por este arquivo
// ============================================

const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { isAuthenticated } = require('../middleware/auth');

// GET /api/dogs — lista cães disponíveis (público)
router.get('/', async (req, res) => {
  const db = getDb();
  const dogs = await db.prepare('SELECT * FROM dogs WHERE available = 1 ORDER BY created_at DESC').all();
  res.json(dogs);
});

// GET /api/dogs/my-adoptions — minhas adoções (precisa estar logado)
// IMPORTANTE: esta rota vem ANTES de /:id para não confundir "my-adoptions" com um id
router.get('/my-adoptions', isAuthenticated, async (req, res) => {
  const db = getDb();
  const adoptions = await db.prepare(`
    SELECT a.id as adoption_id, a.status, a.created_at as adoption_date,
           d.id as dog_id, d.name, d.age, d.photo, d.condition
    FROM adoptions a JOIN dogs d ON a.dog_id = d.id
    WHERE a.user_id = ? ORDER BY a.created_at DESC
  `).all(req.session.user.id);
  res.json(adoptions);
});

// GET /api/dogs/:id — detalhes de um cão (público)
router.get('/:id', async (req, res) => {
  const db = getDb();
  const dog = await db.prepare('SELECT * FROM dogs WHERE id = ?').get(req.params.id);
  if (!dog) return res.status(404).json({ error: 'Cão não encontrado.' });
  res.json(dog);
});

// POST /api/dogs/:id/adopt — solicitar adoção (precisa estar logado)
router.post('/:id/adopt', isAuthenticated, async (req, res) => {
  const dogId = req.params.id;
  const userId = req.session.user.id;
  const db = getDb();

  const dog = await db.prepare('SELECT * FROM dogs WHERE id = ? AND available = 1').get(dogId);
  if (!dog) return res.status(400).json({ error: 'Cão não disponível.' });

  const existing = await db.prepare('SELECT id FROM adoptions WHERE user_id = ? AND dog_id = ?').get(userId, dogId);
  if (existing) return res.status(400).json({ error: 'Você já solicitou este cão.' });

  await db.prepare('INSERT INTO adoptions (user_id, dog_id, status) VALUES (?, ?, ?)').run(userId, dogId, 'pending');
  res.json({ message: 'Solicitação de adoção enviada!' });
});

// POST /api/dogs/cancel-adoption/:id — cancelar adoção
router.post('/cancel-adoption/:id', isAuthenticated, async (req, res) => {
  const db = getDb();
  const adoption = await db.prepare('SELECT * FROM adoptions WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.session.user.id);

  if (!adoption) return res.status(404).json({ error: 'Solicitação não encontrada.' });

  if (adoption.status === 'approved') {
    await db.prepare('UPDATE dogs SET available = 1 WHERE id = ?').run(adoption.dog_id);
  }
  await db.prepare('DELETE FROM adoptions WHERE id = ?').run(req.params.id);
  res.json({ message: 'Adoção cancelada.' });
});

module.exports = router;
