import assert from 'node:assert/strict';
import { test } from 'node:test';
import { documentService } from '../src/services/documentService.js';

test('lista documentos via /api com o identificador do usuário', async (t) => {
  const documents = [{ id: '1', originalName: 'relatorio.txt' }];
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ documents }));

  assert.deepEqual(await documentService.list('usuario-a'), documents);
  assert.deepEqual(fetchMock.mock.calls[0].arguments, [
    '/api/documents',
    { headers: { 'X-User-Id': 'usuario-a' } },
  ]);
});

test('envia o arquivo como multipart sem sobrescrever o Content-Type', async (t) => {
  const document = { id: '1', originalName: 'relatorio.txt' };
  const file = new File(['conteudo'], document.originalName, { type: 'text/plain' });
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => Response.json({ document }, { status: 201 }));

  assert.deepEqual(await documentService.upload('usuario-a', file), document);
  const [url, options] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, '/api/upload');
  assert.equal(options.method, 'POST');
  assert.deepEqual(options.headers, { 'X-User-Id': 'usuario-a' });
  assert.ok(options.body instanceof FormData);
  assert.equal(options.body.get('file').name, file.name);
  assert.equal(await options.body.get('file').text(), 'conteudo');
});

test('propaga a mensagem de erro do backend nas três operações', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({
    error: { message: 'Usuário inválido.' },
  }, { status: 400 }));

  await assert.rejects(documentService.list(''), /Usuário inválido\./);
  await assert.rejects(documentService.upload('', new File(['x'], 'x.txt')), /Usuário inválido\./);
  await assert.rejects(documentService.download('', { id: '1' }), /Usuário inválido\./);
});

test('exibe erro explícito quando o proxy responde com erro sem JSON', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('Bad Gateway', { status: 502 }));

  await assert.rejects(documentService.list('usuario-a'), /Não foi possível concluir a operação\./);
  await assert.rejects(documentService.download('usuario-a', { id: '1' }), /Não foi possível baixar o documento\./);
});

test('não transforma respostas de sucesso inválidas em resultados vazios', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('not JSON'));

  await assert.rejects(documentService.list('usuario-a'), SyntaxError);
});

test('propaga falhas de rede', async (t) => {
  const error = new TypeError('Falha de conexão.');
  t.mock.method(globalThis, 'fetch', async () => { throw error; });

  await assert.rejects(documentService.list('usuario-a'), error);
});

test('baixa o conteúdo original e libera os recursos do navegador', async (t) => {
  const blob = new Blob(['conteudo original']);
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response(blob));
  const createUrl = t.mock.method(URL, 'createObjectURL', () => 'blob:documento');
  const revokeUrl = t.mock.method(URL, 'revokeObjectURL', () => {});
  const link = { click: t.mock.fn(), remove: t.mock.fn() };
  const browserDocument = {
    createElement: t.mock.fn(() => link),
    body: { append: t.mock.fn() },
  };
  globalThis.window = { document: browserDocument };
  t.after(() => { delete globalThis.window; });

  await documentService.download('usuario-a', { id: 'id/1', originalName: 'relatorio.txt' });

  assert.deepEqual(fetchMock.mock.calls[0].arguments, [
    '/api/documents/id%2F1/download',
    { headers: { 'X-User-Id': 'usuario-a' } },
  ]);
  assert.equal(await createUrl.mock.calls[0].arguments[0].text(), 'conteudo original');
  assert.equal(browserDocument.createElement.mock.calls[0].arguments[0], 'a');
  assert.equal(browserDocument.body.append.mock.calls[0].arguments[0], link);
  assert.equal(link.href, 'blob:documento');
  assert.equal(link.download, 'relatorio.txt');
  assert.equal(link.click.mock.callCount(), 1);
  assert.equal(link.remove.mock.callCount(), 1);
  assert.deepEqual(revokeUrl.mock.calls[0].arguments, ['blob:documento']);
});
