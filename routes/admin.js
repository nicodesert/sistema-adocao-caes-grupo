// routes/admin.js
//
// Responsabilidade:
//   P6 (placeholders)  → Dashboard e Gerenciamento de Cães
//   P7 (implementado)  → Gerenciamento de Clientes, Adoções e Local
//

'use strict';

const express        = require('express');
const multer         = require('multer');
const path           = require('path');
const fs             = require('fs');
const { isAdmin }    = require('../middleware/auth');
const { getDb }      = require('../database'); // Utilizando a função singleton do grupo
const { saveUploadedFile } = require('../lib/uploads');

const router = express.Router();

// Multer: armazena o arquivo em memória antes de delegar ao saveUploadedFile
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 4 * 1024 * 1024 } });

// Protege TODAS as rotas deste router com o middleware de Admin
router.use(isAdmin);

// ═════════════════════════════════════════════════════════════════════════════
// P6 – Placeholders (implementação a cargo do outro membro da equipe)
// ═════════════════════════════════════════════════════════════════════════════

// GET  /admin/dashboard         → Estatísticas gerais (total de cães, adoções, clientes)
// GET  /admin/dogs              → Listar todos os cães
// POST /admin/dogs              → Cadastrar novo cão
// GET  /admin/dogs/:id          → Detalhes de um cão
// POST /admin/dogs/:id          → Editar dados de um cão
// POST /admin/dogs/:id/delete   → Excluir um cão

// ═════════════════════════════════════════════════════════════════════════════
// P7 – Gerenciamento de Clientes
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /admin/clients
 * Lista todos os usuários com role = 'user'.
 */
router.get('/clients', (req, res) => {
  try {
    const db = getDb();
    const clients = db.prepare("SELECT * FROM users WHERE role = ?").all('user');

    // Remove a senha de todos os objetos antes de enviar ao frontend
    clients.forEach(client => delete client.password);

    return res.json(clients);
  } catch (err) {
    console.error('[GET /clients]', err);
    return res.status(500).json({ error: 'Erro ao listar clientes.' });
  }
});

/**
 * GET /admin/clients/:id
 * Retorna os dados do cliente (sem senha) e todas as suas adoções com infos do cão.
 */
router.get('/clients/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const client = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'user'").get(id);
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    delete client.password;

    const adoptions = db.prepare(`
      SELECT
        a.id          AS adoption_id,
        a.status,
        a.created_at,
        d.id          AS dog_id,
        d.name        AS dog_name,
        d.age         AS dog_age,
        d.vaccines    AS dog_vaccines,
        d.condition   AS dog_condition
      FROM adoptions a
      JOIN dogs d ON a.dog_id = d.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `).all(id);

    return res.json({ client, adoptions });
  } catch (err) {
    console.error('[GET /clients/:id]', err);
    return res.status(500).json({ error: 'Erro ao buscar detalhes do cliente.' });
  }
});

/**
 * POST /admin/clients/:id/delete
 * Remove um cliente e trata as regras de negócio das adoções vigentes.
 */
router.post('/clients/:id/delete', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const client = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'user'").get(id);
    if (!client) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    // Regra: Localizar adoções 'approved' para tornar os cães disponíveis (= 1) novamente
    const approvedAdoptions = db.prepare("SELECT dog_id FROM adoptions WHERE user_id = ? AND status = 'approved'").all(id);

    for (const adoption of approvedAdoptions) {
      db.prepare("UPDATE dogs SET available = 1 WHERE id = ?").run(adoption.dog_id);
    }

    // Remover todas as adoções vinculadas a esse usuário
    db.prepare("DELETE FROM adoptions WHERE user_id = ?").run(id);

    // Remover o usuário
    db.prepare("DELETE FROM users WHERE id = ?").run(id);

    return res.json({ message: 'Cliente excluído com sucesso e cães liberados.' });
  } catch (err) {
    console.error('[POST /clients/:id/delete]', err);
    return res.status(500).json({ error: 'Erro ao excluir cliente.' });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// P7 – Gerenciamento de Adoções
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /admin/adoptions
 * Lista todas as adoções do sistema (JOIN Triplo)
 */
router.get('/adoptions', (req, res) => {
  try {
    const db = getDb();
    const adoptions = db.prepare(`
      SELECT
        a.id            AS adoption_id,
        a.status,
        a.created_at,
        u.id            AS client_id,
        u.name          AS client_name,
        u.email         AS client_email,
        u.phone         AS client_phone,
        d.id            AS dog_id,
        d.name          AS dog_name,
        d.photo         AS dog_photo
      FROM adoptions a
      JOIN users u ON a.user_id = u.id
      JOIN dogs  d ON a.dog_id  = d.id
      ORDER BY a.created_at DESC
    `).all();

    return res.json(adoptions);
  } catch (err) {
    console.error('[GET /adoptions]', err);
    return res.status(500).json({ error: 'Erro ao listar adoções.' });
  }
});

/**
 * POST /admin/adoptions/:id/approve
 * Aprova adoção, indisponibiliza o cão e rejeita concorrência pendente automaticamente.
 */
router.post('/adoptions/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const adoption = db.prepare("SELECT * FROM adoptions WHERE id = ?").get(id);
    if (!adoption) {
      return res.status(404).json({ error: 'Adoção não encontrada.' });
    }
    if (adoption.status !== 'pending') {
      return res.status(400).json({ error: `Esta adoção já está '${adoption.status}'.` });
    }

    // 1. Aprova a adoção atual
    db.prepare("UPDATE adoptions SET status = 'approved' WHERE id = ?").run(id);

    // 2. Marca o cão como adotado (available = 0)
    db.prepare("UPDATE dogs SET available = 0 WHERE id = ?").run(adoption.dog_id);

    // 3. Rejeita automaticamente requisições concorrentes para o mesmo cão
    db.prepare(`
      UPDATE adoptions
      SET status = 'rejected'
      WHERE dog_id = ? AND id != ? AND status = 'pending'
    `).run(adoption.dog_id, id);

    return res.json({ message: 'Adoção aprovada e pedidos concorrentes rejeitados.' });
  } catch (err) {
    console.error('[POST /adoptions/:id/approve]', err);
    return res.status(500).json({ error: 'Erro ao aprovar adoção.' });
  }
});

/**
 * POST /admin/adoptions/:id/reject
 * Rejeita uma solicitação pendente.
 */
router.post('/admin/adoptions/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const adoption = db.prepare("SELECT * FROM adoptions WHERE id = ?").get(id);
    if (!adoption) {
      return res.status(404).json({ error: 'Adoção não encontrada.' });
    }
    if (adoption.status !== 'pending') {
      return res.status(400).json({ error: 'Apenas adoções pendentes podem ser rejeitadas.' });
    }

    db.prepare("UPDATE adoptions SET status = 'rejected' WHERE id = ?").run(id);

    return res.json({ message: 'Adoção rejeitada com sucesso.' });
  } catch (err) {
    console.error('[POST /admin/adoptions/:id/reject]', err);
    return res.status(500).json({ error: 'Erro ao rejeitar adoção.' });
  }
});

// ═════════════════════════════════════════════════════════════════════════════
// P7 – Gerenciamento do Local
// ═════════════════════════════════════════════════════════════════════════════

/**
 * GET /admin/place
 * Retorna dados institucionais e fotos do abrigo.
 */
router.get('/place', (req, res) => {
  try {
    const db = getDb();
    const info = db.prepare("SELECT * FROM place_info LIMIT 1").get();
    const photos = db.prepare("SELECT * FROM place_photos ORDER BY id DESC").all();

    return res.json({ place: info ?? {}, photos });
  } catch (err) {
    console.error('[GET /place]', err);
    return res.status(500).json({ error: 'Erro ao buscar dados do local.' });
  }
});

/**
 * POST /admin/place
 * Atualiza ou insere (Upsert) informações do abrigo.
 */
router.post('/place', (req, res) => {
  try {
    const { name, address, description, phone, email, facebook, instagram, whatsapp } = req.body;
    const db = getDb();

    const existing = db.prepare("SELECT id FROM place_info LIMIT 1").get();

    if (existing) {
      db.prepare(`
        UPDATE place_info
        SET name = ?, address = ?, description = ?, phone = ?, email = ?, facebook = ?, instagram = ?, whatsapp = ?
        WHERE id = ?
      `).run(name, address, description, phone, email, facebook, instagram, whatsapp, existing.id);
    } else {
      db.prepare(`
        INSERT INTO place_info (name, address, description, phone, email, facebook, instagram, whatsapp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, address, description, phone, email, facebook, instagram, whatsapp);
    }

    return res.json({ message: 'Informações do local atualizadas com sucesso.' });
  } catch (err) {
    console.error('[POST /place]', err);
    return res.status(500).json({ error: 'Erro ao atualizar informações do local.' });
  }
});

/**
 * POST /admin/place/photo
 * Upload centralizado de foto usando a biblioteca do sistema (compatível local/Vercel Blob)
 */
router.post('/place/photo', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const { caption } = req.body;

    // Salva o upload usando a infraestrutura unificada (P1/lib)
    const filename = await saveUploadedFile(req.file, 'place');

    const db = getDb();
    db.prepare("INSERT INTO place_photos (photo, caption) VALUES (?, ?)").run(filename, caption ?? '');

    return res.status(201).json({ message: 'Foto adicionada com sucesso!', photo: filename });
  } catch (err) {
    console.error('[POST /place/photo]', err);
    return res.status(500).json({ error: 'Erro ao fazer upload da foto.' });
  }
});

/**
 * POST /admin/place/photo/:id/delete
 * Remove registro do banco e faz limpeza segura no disco local se aplicável.
 */
router.post('/place/photo/:id/delete', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();

    const photoRow = db.prepare("SELECT * FROM place_photos WHERE id = ?").get(id);
    if (!photoRow) {
      return res.status(404).json({ error: 'Foto não encontrada.' });
    }

    // 1. Deleta do banco primeiro
    db.prepare("DELETE FROM place_photos WHERE id = ?").run(id);

    // 2. Limpeza física opcional local (ignora falhas silenciosamente no Vercel Blob)
    const filePath = path.join(__dirname, '..', 'public', 'uploads', 'place', photoRow.photo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return res.json({ message: 'Foto removida com sucesso.' });
  } catch (err) {
    console.error('[POST /place/photo/:id/delete]', err);
    return res.status(500).json({ error: 'Erro ao remover foto.' });
  }
});

module.exports = router;