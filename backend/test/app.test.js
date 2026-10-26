const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const app = require('../src/app');

async function startApp(options = {}) {
  const storageDir = await fs.mkdtemp(path.join(os.tmpdir(), 'dms-test-'));
  const server = app.createApp({ storageDir, ...options }).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: async () => {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await fs.rm(storageDir, { recursive: true, force: true });
    },
  };
}

test('o app backend é exportado como uma aplicação Express', () => {
  assert.strictEqual(typeof app, 'function');
});

test('upload, listagem e download respeitam o proprietário', async () => {
  const server = await startApp();

  try {
    const form = new FormData();
    form.append('file', new Blob(['documento local'], { type: 'text/plain' }), 'relatorio.txt');
    const uploadResponse = await fetch(`${server.baseUrl}/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'usuario-a' },
      body: form,
    });

    assert.strictEqual(uploadResponse.status, 201);
    const { document } = await uploadResponse.json();
    assert.strictEqual(document.originalName, 'relatorio.txt');
    assert.strictEqual(document.owner, 'usuario-a');
    assert.strictEqual(document.size, 15);
    assert.strictEqual(Object.hasOwn(document, 'storageName'), false);

    const listResponse = await fetch(`${server.baseUrl}/documents`, {
      headers: { 'X-User-Id': 'usuario-a' },
    });
    assert.deepStrictEqual((await listResponse.json()).documents.map(({ id }) => id), [document.id]);

    const otherUserResponse = await fetch(`${server.baseUrl}/documents`, {
      headers: { 'X-User-Id': 'usuario-b' },
    });
    assert.deepStrictEqual((await otherUserResponse.json()).documents, []);

    const forbiddenDownload = await fetch(`${server.baseUrl}/documents/${document.id}/download`, {
      headers: { 'X-User-Id': 'usuario-b' },
    });
    assert.strictEqual(forbiddenDownload.status, 404);

    const downloadResponse = await fetch(`${server.baseUrl}/documents/${document.id}/download`, {
      headers: { 'X-User-Id': 'usuario-a' },
    });
    assert.strictEqual(downloadResponse.status, 200);
    assert.match(downloadResponse.headers.get('content-disposition'), /relatorio\.txt/);
    assert.strictEqual(await downloadResponse.text(), 'documento local');
  } finally {
    await server.close();
  }
});

test('upload exige usuário e rejeita arquivos acima do limite', async () => {
  const server = await startApp({ maxFileSize: 4 });

  try {
    const missingOwnerForm = new FormData();
    missingOwnerForm.append('file', new Blob(['ok']), 'arquivo.txt');
    const missingOwnerResponse = await fetch(`${server.baseUrl}/upload`, {
      method: 'POST',
      body: missingOwnerForm,
    });
    assert.strictEqual(missingOwnerResponse.status, 400);

    const largeFileForm = new FormData();
    largeFileForm.append('file', new Blob(['grande']), 'arquivo.txt');
    const largeFileResponse = await fetch(`${server.baseUrl}/upload`, {
      method: 'POST',
      headers: { 'X-User-Id': 'usuario-a' },
      body: largeFileForm,
    });
    assert.strictEqual(largeFileResponse.status, 413);
    assert.strictEqual((await largeFileResponse.json()).error.code, 'FILE_TOO_LARGE');
  } finally {
    await server.close();
  }
});
