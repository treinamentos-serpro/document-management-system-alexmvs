class DocumentController {
  constructor(documentService) {
    this.documentService = documentService;
  }

  upload = (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Envie um arquivo.' });
    }

    const document = this.documentService.createDocument(
      req.file,
      req.get('x-user-id') || 'anonymous',
    );
    return res.status(201).json(document);
  };

  list = (req, res) => {
    res.json(this.documentService.listDocuments());
  };

  download = (req, res, next) => {
    const document = this.documentService.getDocumentById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Documento não encontrado.' });
    }

    return res.download(document.path, document.originalName, (error) => {
      if (error) next(error);
    });
  };
}

module.exports = DocumentController;
