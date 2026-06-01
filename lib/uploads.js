const fs = require('fs');
const path = require('path');

let blobSdk = null;

function getBlobSdk() {
  if (!blobSdk) {
    blobSdk = require('@vercel/blob');
  }
  return blobSdk;
}

function isBlobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function sanitizeFileName(fileName) {
  return (fileName || 'file')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-');
}

async function saveUploadedFile(file, folder) {
  if (!file) return null;

  const safeName = `${Date.now()}-${sanitizeFileName(file.originalname)}`;

  if (isBlobEnabled()) {
    const { put } = getBlobSdk();
    const controller = new AbortController();
    // 8s < Vercel Hobby 10s limit, garantindo resposta antes da função ser morta
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const blob = await put(`uploads/${folder}/${safeName}`, file.buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: false,
        contentType: file.mimetype,
        abortSignal: controller.signal
      });
      return blob.url;
    } finally {
      clearTimeout(timeout);
    }
  }

  try {
    const targetDir = path.join(__dirname, '..', 'public', 'uploads', folder);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, safeName), file.buffer);
    return `/uploads/${folder}/${safeName}`;
  } catch (err) {
    // Filesystem read-only (ex: Vercel sem Blob configurado) — ignora a foto
    console.warn('Não foi possível salvar a foto no sistema de arquivos:', err.message);
    return null;
  }
}

async function deleteUploadedFile(filePathOrUrl) {
  if (!filePathOrUrl) return;

  if (/^https?:\/\//i.test(filePathOrUrl) && isBlobEnabled()) {
    const { del } = getBlobSdk();
    await del(filePathOrUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return;
  }

  if (filePathOrUrl.startsWith('/')) {
    const localPath = path.join(__dirname, '..', 'public', filePathOrUrl.replace(/^\/+/, ''));
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }
}

module.exports = {
  saveUploadedFile,
  deleteUploadedFile,
  isBlobEnabled
};