// ============================================
// ROTAS DE CONTATO — Fale Conosco
// ============================================

const express = require('express');
const router  = express.Router();
const { getDb } = require('../database');
const { isAdmin } = require('../middleware/auth');

// POST /api/contact — visitante envia mensagem (público)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nome, e-mail e mensagem são obrigatórios.' });
    }

    const db = getDb();
    await db.prepare(
      'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)'
    ).run(name, email, phone || '', message);

    res.json({ message: 'Mensagem enviada com sucesso!' });
  } catch (err) {
    console.error('[contact/post]', err);
    res.status(500).json({ error: 'Erro ao enviar mensagem. Tente novamente.' });
  }
});

// GET /api/contact — admin lista todas as mensagens
router.get('/', isAdmin, async (req, res) => {
  try {
    const db = getDb();
    const contacts = await db.prepare(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    ).all();
    res.json(contacts);
  } catch (err) {
    console.error('[contact/list]', err);
    res.status(500).json({ error: 'Erro ao buscar mensagens.' });
  }
});

// POST /api/contact/:id/read — admin marca como lida
router.post('/:id/read', isAdmin, async (req, res) => {
  try {
    const db = getDb();
    await db.prepare('UPDATE contacts SET read = 1 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Mensagem marcada como lida.' });
  } catch (err) {
    console.error('[contact/read]', err);
    res.status(500).json({ error: 'Erro ao atualizar mensagem.' });
  }
});

// POST /api/contact/:id/delete — admin exclui mensagem
router.post('/:id/delete', isAdmin, async (req, res) => {
  try {
    const db = getDb();
    await db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
    res.json({ message: 'Mensagem excluída.' });
  } catch (err) {
    console.error('[contact/delete]', err);
    res.status(500).json({ error: 'Erro ao excluir mensagem.' });
  }
});

module.exports = router;
