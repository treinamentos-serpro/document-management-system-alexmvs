async function requestJson(url, options) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error?.message || 'Não foi possível concluir a operação.');
  }
  return body;
}

function userHeaders(userId) {
  return { 'X-User-Id': userId };
}

export const documentService = {
  async list(userId) {
    const result = await requestJson('/api/documents', {
      headers: userHeaders(userId),
    });
    return result.documents;
  },

  async upload(userId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const result = await requestJson('/api/upload', {
      method: 'POST',
      headers: userHeaders(userId),
      body: formData,
    });
    return result.document;
  },

  async download(userId, document) {
    const response = await fetch(`/api/documents/${encodeURIComponent(document.id)}/download`, {
      headers: userHeaders(userId),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error?.message || 'Não foi possível baixar o documento.');
    }

    const objectUrl = URL.createObjectURL(await response.blob());
    const link = window.document.createElement('a');
    link.href = objectUrl;
    link.download = document.originalName;
    link.click();
    URL.revokeObjectURL(objectUrl);
  },
};