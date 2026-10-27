const crypto = require('node:crypto');

class DocumentError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.name = 'DocumentError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function createDocumentMetadata(file, owner) {
  return {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    mimeType: file.mimetype || null,
    storageName: file.filename,
  };
}

function toPublicDocument({ storageName, ...document }) {
  return document;
}

function createDocumentService({ documentRepository, fileRepository }) {
  return {
    async upload({ file, owner }) {
      if (!file) {
        throw new DocumentError(400, 'FILE_REQUIRED', 'Selecione um arquivo para enviar.');
      }

      const document = createDocumentMetadata(file, owner);

      try {
        await documentRepository.save(document);
      } catch (error) {
        await fileRepository.remove(file.filename);
        throw error;
      }

      return toPublicDocument(document);
    },

    async list(owner) {
      return (await documentRepository.findByOwner(owner)).map(toPublicDocument);
    },

    async getDownload({ id, owner }) {
      const document = await documentRepository.findById(id);
      if (!document || document.owner !== owner || !(await fileRepository.exists(document.storageName))) {
        throw new DocumentError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
      }

      return { document, filePath: fileRepository.getPath(document.storageName) };
    },
  };
}

module.exports = { createDocumentService, DocumentError };