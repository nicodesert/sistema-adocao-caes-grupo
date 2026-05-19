const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDb } = require('../database'); 

router.post('/register', (req, res) => {
    const { name, email, phone, cpf, address, password, confirmPassword } = req.body;
    const db = getDb();

    if (!name || !email || !password || password !== confirmPassword) {
        return res.status(400).json({ error: 'Dados inválidos ou senhas diferentes.' });
    }

    try {
        const hash = bcrypt.hashSync(password, 10);
        db.prepare(`INSERT INTO users (name, email, phone, cpf, address, password, role) VALUES (?, ?, ?, ?, ?, ?, 'user')`)
          .run(name, email, phone, cpf.replace(/\D/g, ''), address, hash);
        res.status(201).json({ message: 'Usuário criado com sucesso!' });
    } catch (err) {
        res.status(409).json({ error: 'E-mail ou CPF já cadastrado.' });
    }
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = { id: user.id, name: user.name, role: user.role };
        return res.json({ message: 'Login realizado!', user: req.session.user });
    }
    res.status(401).json({ error: 'E-mail ou senha incorretos.' });
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Sessão encerrada.' });
});

module.exports = router;