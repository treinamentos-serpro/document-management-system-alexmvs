const { randomUUID } = require('node:crypto');

class DocumentService {
  constructor(documentRepository) {
    this.documentRepository = documentRepository;
  }

  createDocument(file, owner) {
    const document = {
      id: randomUUID(),
      originalName: file.originalname,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      owner,
      path: file.path,
    };

    this.documentRepository.save(document);
    return this.toPublicDocument(document);
  }

  listDocuments() {
    return this.documentRepository.findAll().map((document) => (
      this.toPublicDocument(document)
    ));
  }

  getDocumentById(id) {
    return this.documentRepository.findById(id);
  }

  toPublicDocument(document) {
    const { path, ...publicDocument } = document;
    return publicDocument;
  }
}

module.exports = DocumentService;
