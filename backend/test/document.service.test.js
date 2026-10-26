const { test } = require('node:test');
const assert = require('node:assert/strict');
const DocumentRepository = require('../src/repositories/documentRepository');
const DocumentService = require('../src/services/documentService');

test('o serviço cria e lista metadados sem expor o caminho local', () => {
  const service = new DocumentService(new DocumentRepository());
  const file = {
    originalname: 'relatorio.pdf',
    size: 42,
    path: '/storage/generated-id',
  };

  const createdDocument = service.createDocument(file, 'user-1');

  assert.equal(createdDocument.originalName, 'relatorio.pdf');
  assert.equal(createdDocument.size, 42);
  assert.equal(createdDocument.owner, 'user-1');
  assert.equal(typeof createdDocument.id, 'string');
  assert.equal(Number.isNaN(Date.parse(createdDocument.uploadedAt)), false);
  assert.equal(Object.hasOwn(createdDocument, 'path'), false);
  assert.deepEqual(service.listDocuments(), [createdDocument]);
});

test('o serviço busca um documento pelo identificador sem duplicar a persistência', () => {
  const service = new DocumentService(new DocumentRepository());
  const createdDocument = service.createDocument({
    originalname: 'relatorio.pdf',
    size: 42,
    path: '/storage/generated-id',
  }, 'user-1');

  assert.equal(service.getDocumentById(createdDocument.id).path, '/storage/generated-id');
  assert.equal(service.getDocumentById('inexistente'), null);
});
