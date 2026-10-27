import { useState } from 'react';
import { documentService } from '../services/documentService.js';

export function DownloadButton({ document, userId, onError }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await documentService.download(userId, document);
    } catch (error) {
      onError(error.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <button
      className="download-button"
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      aria-label={`Baixar ${document.originalName}`}
      title="Baixar documento"
    >
      {isDownloading ? '...' : '↓'}
    </button>
  );
}