// ============================================
// ROTAS DO ADMIN — CRUD Cães, Clientes, Adoções, Local
// Pessoas 6 e 7 são responsáveis por este arquivo
// ============================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getDb } = require('../database');
const { isAdmin } = require('../middleware/auth');
const { saveUploadedFile, deleteUploadedFile } = require('../lib/uploads');

// Filtro: aceita apenas imagens
function fileFilter(req, file, cb) {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
}

const memoryStorage = multer.memoryStorage();
const uploadDog = multer({ storage: memoryStorage, fileFilter, limits: { fileSize: 4 * 1024 * 1024 } });
const uploadPlace = multer({ storage: memoryStorage, fileFilter, limits: { fileSize: 4 * 1024 * 1024 } });

// Todas as rotas admin exigem ser admin
router.use(isAdmin);

// ========== DASHBOARD ==========

// GET /api/admin/dashboard — estatísticas
router.get('/dashboard', async (req, res) => {
  const db = getDb();
  const totalDogs = (await db.prepare('SELECT COUNT(*) as count FROM dogs').get()).count;
  const availableDogs = (await db.prepare('SELECT COUNT(*) as count FROM dogs WHERE available = 1').get()).count;
  const totalUsers = (await db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get()).count;
  const pendingAdoptions = (await db.prepare("SELECT COUNT(*) as count FROM adoptions WHERE status = 'pending'").get()).count;
  const approvedAdoptions = (await db.prepare("SELECT COUNT(*) as count FROM adoptions WHERE status = 'approved'").get()).count;
  res.json({ totalDogs, availableDogs, totalUsers, pendingAdoptions, approvedAdoptions });
});

// ========== CRUD DE CÃES ==========

// GET /api/admin/dogs — listar todos os cães
router.get('/dogs', async (req, res) => {
  const db = getDb();
  const dogs = await db.prepare('SELECT * FROM dogs ORDER BY created_at DESC').all();
  res.json(dogs);
});

// GET /api/admin/dogs/:id — obter um cão para edição
router.get('/dogs/:id', async (req, res) => {
  const db = getDb();
  const dog = await db.prepare('SELECT * FROM dogs WHERE id = ?').get(req.params.id);
  if (!dog) return res.status(404).json({ error: 'Cão não encontrado.' });
  res.json(dog);
});

// POST /api/admin/dogs — cadastrar novo cão
router.post('/dogs', uploadDog.single('photo'), async (req, res) => {
  const { name, age, vaccines, condition, description } = req.body;
  if (!name || !age) return res.status(400).json({ error: 'Nome e idade são obrigatórios.' });

  const photo = req.file ? await saveUploadedFile(req.file, 'dogs') : null;
  const db = getDb();
  await db.prepare('INSERT INTO dogs (name,age,vaccines,condition,description,photo) VALUES (?,?,?,?,?,?)')
    .run(name, age, vaccines || '', condition || '', description || '', photo);
  res.json({ message: 'Cão cadastrado!' });
});

// POST /api/admin/dogs/:id — atualizar cão
router.post('/dogs/:id', uploadDog.single('photo'), async (req, res) => {
  const { name, age, vaccines, condition, description, available } = req.body;
  const db = getDb();
  const existingDog = await db.prepare('SELECT * FROM dogs WHERE id = ?').get(req.params.id);
  if (!existingDog) return res.status(404).json({ error: 'Cão não encontrado.' });

  let photo = existingDog.photo;
  if (req.file) {
    if (existingDog.photo) {
      await deleteUploadedFile(existingDog.photo);
    }
    photo = await saveUploadedFile(req.file, 'dogs');
  }

  const isAvailable = String(available) === '1' ? 1 : 0;
  await db.prepare('UPDATE dogs SET name=?,age=?,vaccines=?,condition=?,description=?,photo=?,available=? WHERE id=?')
    .run(name, age, vaccines || '', condition || '', description || '', photo, isAvailable, req.params.id);
  res.json({ message: 'Cão atualizado!' });
});

// POST /api/admin/dogs/:id/delete — remover cão
router.post('/dogs/:id/delete', async (req, res) => {
  const db = getDb();
  const dog = await db.prepare('SELECT * FROM dogs WHERE id = ?').get(req.params.id);
  if (dog && dog.photo) {
    await deleteUploadedFile(dog.photo);
  }
  await db.prepare('DELETE FROM adoptions WHERE dog_id = ?').run(req.params.id);
  await db.prepare('DELETE FROM dogs WHERE id = ?').run(req.params.id);
  res.json({ message: 'Cão removido!' });
});

// ========== CLIENTES ==========

// GET /api/admin/clients — listar clientes
router.get('/clients', async (req, res) => {
  const db = getDb();
  const clients = await db.prepare("SELECT * FROM users WHERE role = 'user' ORDER BY created_at DESC").all();
  res.json(clients);
});

// GET /api/admin/clients/:id — detalhes de um cliente
router.get('/clients/:id', async (req, res) => {
  const db = getDb();
  const client = await db.prepare("SELECT * FROM users WHERE id = ? AND role = 'user'").get(req.params.id);
  if (!client) return res.status(404).json({ error: 'Cliente não encontrado.' });

  const adoptions = await db.prepare(`
    SELECT a.*, d.name as dog_name, d.photo as dog_photo
    FROM adoptions a JOIN dogs d ON a.dog_id = d.id
    WHERE a.user_id = ? ORDER BY a.created_at DESC
  `).all(client.id);

  // Não envia a senha
  delete client.password;
  res.json({ client, adoptions });
});

// POST /api/admin/clients/:id/delete — remover cliente
router.post('/clients/:id/delete', async (req, res) => {
  const db = getDb();
  // Libera cães que estavam aprovados para este cliente
  const approvedAdoptions = await db.prepare("SELECT dog_id FROM adoptions WHERE user_id = ? AND status = 'approved'").all(req.params.id);
  await Promise.all(approvedAdoptions.map(a => db.prepare('UPDATE dogs SET available = 1 WHERE id = ?').run(a.dog_id)));
  await db.prepare('DELETE FROM adoptions WHERE user_id = ?').run(req.params.id);
  await db.prepare("DELETE FROM users WHERE id = ? AND role = 'user'").run(req.params.id);
  res.json({ message: 'Cliente removido!' });
});

// ========== ADOÇÕES ==========

// GET /api/admin/adoptions — listar todas as adoções
router.get('/adoptions', async (req, res) => {
  const db = getDb();
  const adoptions = await db.prepare(`
    SELECT a.id, a.status, a.created_at,
           u.name as user_name, u.email as user_email, u.phone as user_phone, u.id as user_id,
           d.name as dog_name, d.photo as dog_photo, d.id as dog_id
    FROM adoptions a
    JOIN users u ON a.user_id = u.id
    JOIN dogs d ON a.dog_id = d.id
    ORDER BY a.created_at DESC
  `).all();
  res.json(adoptions);
});

// POST /api/admin/adoptions/:id/approve — aprovar adoção
router.post('/adoptions/:id/approve', async (req, res) => {
  const db = getDb();
  const adoption = await db.prepare('SELECT * FROM adoptions WHERE id = ?').get(req.params.id);
  if (!adoption) return res.status(404).json({ error: 'Solicitação não encontrada.' });

  await db.prepare("UPDATE adoptions SET status = 'approved' WHERE id = ?").run(req.params.id);
  await db.prepare('UPDATE dogs SET available = 0 WHERE id = ?').run(adoption.dog_id);

  // Rejeita outras solicitações para o mesmo cão
  await db.prepare("UPDATE adoptions SET status = 'rejected' WHERE dog_id = ? AND id != ? AND status = 'pending'")
    .run(adoption.dog_id, req.params.id);

  res.json({ message: 'Adoção aprovada!' });
});

// POST /api/admin/adoptions/:id/reject — rejeitar adoção
router.post('/adoptions/:id/reject', async (req, res) => {
  const db = getDb();
  await db.prepare("UPDATE adoptions SET status = 'rejected' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Adoção rejeitada.' });
});

// ========== LOCAL ==========

// GET /api/admin/place — obter info do local
router.get('/place', async (req, res) => {
  const db = getDb();
  const place = await db.prepare('SELECT * FROM place_info LIMIT 1').get();
  const photos = await db.prepare('SELECT * FROM place_photos ORDER BY created_at DESC').all();
  res.json({ place, photos });
});

// POST /api/admin/place — atualizar info do local
router.post('/place', async (req, res) => {
  const { name, address, phone, email, description, facebook, instagram, whatsapp } = req.body;
  const db = getDb();
  await db.prepare(`UPDATE place_info SET name=?, address=?, phone=?, email=?, description=?,
    facebook=?, instagram=?, whatsapp=? WHERE id = 1`)
    .run(name, address, phone, email, description, facebook || '', instagram || '', whatsapp || '');
  res.json({ message: 'Informações atualizadas!' });
});

// POST /api/admin/place/photo — adicionar foto do local
router.post('/place/photo', uploadPlace.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Selecione uma foto.' });
  const photo = await saveUploadedFile(req.file, 'place');
  const caption = req.body.caption || '';
  const db = getDb();
  await db.prepare('INSERT INTO place_photos (photo, caption) VALUES (?, ?)').run(photo, caption);
  res.json({ message: 'Foto adicionada!' });
});

// POST /api/admin/place/photo/:id/delete — remover foto do local
router.post('/place/photo/:id/delete', async (req, res) => {
  const db = getDb();
  const photo = await db.prepare('SELECT * FROM place_photos WHERE id = ?').get(req.params.id);
  if (photo) {
    await deleteUploadedFile(photo.photo);
    await db.prepare('DELETE FROM place_photos WHERE id = ?').run(req.params.id);
  }
  res.json({ message: 'Foto removida!' });
});

module.exports = router;
