const crypto = require('node:crypto');
const fs = require('node:fs');
const multer = require('multer');
const express = require('express');
const { createDocumentController } = require('../controllers/documentController');

function requireOwner(req, res, next) {
  if (!req.get('X-User-Id')?.trim()) {
    return res.status(400).json({
      error: { code: 'USER_ID_REQUIRED', message: 'Informe o usuário no cabeçalho X-User-Id.' },
    });
  }
  return next();
}

function createDocumentRouter({ documentService, storageDir, maxFileSize }) {
  fs.mkdirSync(storageDir, { recursive: true });

  const upload = multer({
    storage: multer.diskStorage({
      destination: storageDir,
      filename: (req, file, callback) => callback(null, crypto.randomUUID()),
    }),
    limits: { fileSize: maxFileSize },
  });
  const controller = createDocumentController({ documentService });
  const router = express.Router();

  router.post('/upload', requireOwner, upload.single('file'), controller.upload);
  router.get('/documents', requireOwner, controller.list);
  router.get('/documents/:id/download', requireOwner, controller.download);

  return router;
}

module.exports = { createDocumentRouter };