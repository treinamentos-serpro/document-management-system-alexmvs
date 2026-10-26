async function request(path, options, errorMessage = 'Não foi possível concluir a operação.') {
  const response = await fetch(`/api${path}`, options);
  if (!response.ok) {
    let body;
    try {
      body = await response.json();
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error;
      }
      throw new Error(errorMessage);
    }
    throw new Error(body?.error?.message || errorMessage);
  }
  return response;
}

async function requestJson(path, options) {
  const response = await request(path, options);
  return response.json();
}

function userHeaders(userId) {
  return { 'X-User-Id': userId };
}

export const documentService = {
  async list(userId) {
    const result = await requestJson('/documents', {
      headers: userHeaders(userId),
    });
    return result.documents;
  },

  async upload(userId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const result = await requestJson('/upload', {
      method: 'POST',
      headers: userHeaders(userId),
      body: formData,
    });
    return result.document;
  },

  async download(userId, document) {
    const response = await request(`/documents/${encodeURIComponent(document.id)}/download`, {
      headers: userHeaders(userId),
    }, 'Não foi possível baixar o documento.');

    const objectUrl = URL.createObjectURL(await response.blob());
    const link = window.document.createElement('a');
    link.href = objectUrl;
    link.download = document.originalName;
    try {
      window.document.body.append(link);
      link.click();
    } finally {
      link.remove();
      URL.revokeObjectURL(objectUrl);
    }
  },
};