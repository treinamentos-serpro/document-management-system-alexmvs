const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const app = require('../src/app');

// Teste de fumaça: garante que o app Express foi exportado.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('a API permite enviar, listar e baixar documentos', async () => {
  const storage = path.resolve(__dirname, '../storage');
  const filesBeforeUpload = new Set(await fs.readdir(storage));
  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}/api`;
    const form = new FormData();
    form.append('file', new Blob(['conteúdo do documento']), 'documento.txt');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: form,
    });
    assert.equal(uploadResponse.status, 201);
    const document = await uploadResponse.json();
    assert.equal(document.originalName, 'documento.txt');
    assert.equal(Object.hasOwn(document, 'path'), false);

    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.equal((await listResponse.json()).some(({ id }) => id === document.id), true);

    const downloadResponse = await fetch(
      `${baseUrl}/documents/${document.id}/download`,
    );
    assert.equal(await downloadResponse.text(), 'conteúdo do documento');

    const missingResponse = await fetch(`${baseUrl}/documents/missing/download`);
    assert.equal(missingResponse.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    for (const filename of await fs.readdir(storage)) {
      if (!filesBeforeUpload.has(filename)) {
        await fs.unlink(path.join(storage, filename));
      }
    }
  }
});
