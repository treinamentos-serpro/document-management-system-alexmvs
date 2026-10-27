function createDocumentController({ documentService }) {
  return {
    upload: async (req, res, next) => {
      try {
        const document = await documentService.upload({
          file: req.file,
          owner: req.get('X-User-Id').trim(),
        });
        return res.status(201).json({ document });
      } catch (error) {
        return next(error);
      }
    },

    list: async (req, res, next) => {
      try {
        const documents = await documentService.list(req.get('X-User-Id').trim());
        return res.json({ documents });
      } catch (error) {
        return next(error);
      }
    },

    download: async (req, res, next) => {
      try {
        const { document, filePath } = await documentService.getDownload({
          id: req.params.id,
          owner: req.get('X-User-Id').trim(),
        });
        return res.download(filePath, document.originalName, (error) => {
          if (error) {
            next(error);
          }
        });
      } catch (error) {
        return next(error);
      }
    },
  };
}

module.exports = { createDocumentController };