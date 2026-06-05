// ============================================
// ROTAS DE AUTENTICAÇÃO — Login, Cadastro, Logout
// Pessoa 4 é responsável por este arquivo
// ============================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDb } = require('../database');
const { setAuthCookie, clearAuthCookie } = require('../lib/auth');

// GET /api/auth/me — retorna dados do usuário logado
router.get('/me', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.session && req.session.user) {
    return res.json(req.session.user);
  }
  res.status(401).json({ error: 'Não autenticado' });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }

    const db = getDb();
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Email ou senha inválidos.' });
    }

    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
    setAuthCookie(res, req.session.user);
    res.json({ message: 'Login realizado!', user: req.session.user });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, cpf, address, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !cpf || !address || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'As senhas não coincidem.' });
    }

    const cpfClean = cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      return res.status(400).json({ error: 'CPF inválido.' });
    }

    const db = getDb();
    const existing = await db.prepare('SELECT id FROM users WHERE email = ? OR cpf = ?').get(email, cpfClean);
    if (existing) {
      return res.status(400).json({ error: 'Email ou CPF já cadastrado.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await db.prepare('INSERT INTO users (name,email,phone,cpf,address,password,role) VALUES (?,?,?,?,?,?,?)')
      .run(name, email, phone, cpfClean, address, hashedPassword, 'user');

    res.json({ message: 'Cadastro realizado! Faça login.' });
  } catch (err) {
    console.error('[auth/register]', err);
    res.status(500).json({ error: 'Erro interno. Tente novamente.' });
  }
});

// GET /api/auth/logout
router.get('/logout', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  req.session = { user: null };
  clearAuthCookie(res);
  res.json({ message: 'Logout realizado.' });
});

module.exports = router;
