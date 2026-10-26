const express = require('express');
const path = require('node:path');
const { createDocumentRouter } = require('./routes/document.routes');
const { createInMemoryDocumentRepository } = require('./repositories/document.repository');
const { createLocalFileRepository } = require('./repositories/localFileRepository');
const { createDocumentService } = require('./services/document.service');

const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024;

function createApp({
  storageDir = process.env.STORAGE_DIR || path.resolve(__dirname, '../storage'),
  maxFileSize = Number(process.env.MAX_FILE_SIZE_BYTES) || DEFAULT_MAX_FILE_SIZE,
  documentRepository = createInMemoryDocumentRepository(),
  fileRepository = createLocalFileRepository(storageDir),
} = {}) {
  const app = express();
  const documentService = createDocumentService({ documentRepository, fileRepository });

  app.use(express.json());
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });
  app.use(createDocumentRouter({ documentService, storageDir, maxFileSize }));
  app.use((error, req, res, next) => {
    if (res.headersSent) {
      return next(error);
    }

    if (error.name === 'MulterError' && error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: { code: 'FILE_TOO_LARGE', message: 'O arquivo excede o tamanho máximo permitido.' },
      });
    }

    const statusCode = error.statusCode || 500;
    const code = error.code || 'INTERNAL_ERROR';
    const message = statusCode === 500 ? 'Ocorreu um erro interno.' : error.message;
    return res.status(statusCode).json({ error: { code, message } });
  });

  return app;
}

const app = createApp();
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

app.createApp = createApp;
module.exports = app;
