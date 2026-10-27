const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDocumentService } = require('../src/services/document.service');

test('upload and list return public documents without storage names', async () => {
  const storedDocuments = [];
  const documentRepository = {
    async save(document) {
      storedDocuments.push(document);
    },
    async findByOwner() {
      return storedDocuments;
    },
  };
  const service = createDocumentService({
    documentRepository,
    fileRepository: { async remove() {} },
  });
  const file = {
    originalname: 'relatorio.txt',
    size: 4,
    mimetype: 'text/plain',
    filename: 'stored-file',
  };

  const uploadedDocument = await service.upload({ file, owner: 'usuario-a' });
  const listedDocuments = await service.list('usuario-a');

  assert.strictEqual(Object.hasOwn(uploadedDocument, 'storageName'), false);
  assert.strictEqual(Object.hasOwn(listedDocuments[0], 'storageName'), false);
  assert.strictEqual(storedDocuments[0].storageName, 'stored-file');
});

test('upload removes the stored file when saving document metadata fails', async () => {
  const saveError = new Error('Falha ao salvar metadados.');
  const removedFiles = [];
  const service = createDocumentService({
    documentRepository: {
      async save() {
        throw saveError;
      },
    },
    fileRepository: {
      async remove(storageName) {
        removedFiles.push(storageName);
      },
    },
  });

  await assert.rejects(
    service.upload({
      file: { originalname: 'relatorio.txt', size: 4, filename: 'stored-file' },
      owner: 'usuario-a',
    }),
    saveError,
  );
  assert.deepStrictEqual(removedFiles, ['stored-file']);
});
