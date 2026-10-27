import { DownloadButton } from './DownloadButton.jsx';

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentList({ documents, userId, onError }) {
  if (documents.length === 0) {
    return <p className="empty-state">Nenhum documento por aqui.</p>;
  }

  return (
    <ul className="document-list">
      {documents.map((document, index) => (
        <li className="document-row" key={document.id}>
          <span className="file-type" aria-hidden="true">{document.originalName.split('.').pop().slice(0, 4)}</span>
          <div className="document-info">
            <strong title={document.originalName}>{document.originalName}</strong>
            <span>{formatDate(document.uploadedAt)} <i>·</i> {formatSize(document.size)}</span>
          </div>
          <span className="row-number">{String(index + 1).padStart(2, '0')}</span>
          <DownloadButton document={document} userId={userId} onError={onError} />
        </li>
      ))}
    </ul>
  );
}