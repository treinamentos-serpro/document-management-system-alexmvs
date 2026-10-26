const { randomUUID } = require('node:crypto');
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const DocumentRepository = require('../repositories/documentRepository');
const DocumentService = require('../services/documentService');
const DocumentController = require('../controllers/documentController');

const router = express.Router();
const documentRepository = new DocumentRepository();
const documentService = new DocumentService(documentRepository);
const documentController = new DocumentController(documentService);
const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '../../storage'),
    filename: (req, file, callback) => callback(null, randomUUID()),
  }),
});

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.list);
router.get('/documents/:id/download', documentController.download);

module.exports = router;
