function createInMemoryDocumentRepository() {
  const documents = new Map();

  return {
    async save(document) {
      documents.set(document.id, { ...document });
      return { ...document };
    },

    async findByOwner(owner) {
      return [...documents.values()]
        .filter((document) => document.owner === owner)
        .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt))
        .map((document) => ({ ...document }));
    },

    async findById(id) {
      const document = documents.get(id);
      return document ? { ...document } : null;
    },
  };
}

module.exports = { createInMemoryDocumentRepository };