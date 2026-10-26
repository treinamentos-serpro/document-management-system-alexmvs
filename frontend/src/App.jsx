import { useEffect, useState } from 'react';
import { DocumentList } from './components/DocumentList.jsx';
import { UploadComponent } from './components/UploadComponent.jsx';
import { documentService } from './services/documentService.js';
import './App.css';

const DEFAULT_USER_ID = 'usuario-local';

function getInitialUserId() {
  return window.localStorage.getItem('dms-user-id') || DEFAULT_USER_ID;
}

export default function App() {
  const [userId, setUserId] = useState(getInitialUserId);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    window.localStorage.setItem('dms-user-id', userId);
    let isCurrent = true;

    if (!userId.trim()) {
      setDocuments([]);
      setIsLoading(false);
      return () => {
        isCurrent = false;
      };
    }

    setIsLoading(true);
    setError('');
    documentService.list(userId.trim())
      .then((result) => {
        if (isCurrent) {
          setDocuments(result);
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [userId]);

  async function handleUpload(file) {
    setError('');
    setNotice('');
    try {
      const document = await documentService.upload(userId.trim(), file);
      setDocuments((currentDocuments) => [document, ...currentDocuments]);
      setNotice('Documento enviado.');
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }

  function handleError(message) {
    setError(message);
  }

  return (
    <main className="workspace">
      <header className="masthead">
        <a className="wordmark" href="/" aria-label="DMS, início">
          <span className="wordmark-icon" aria-hidden="true">D</span>
          <span>DMS</span>
        </a>
        <label className="user-control">
          <span>Usuário</span>
          <input
            aria-label="Identificador do usuário"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            maxLength={100}
          />
        </label>
      </header>

      <section className="page-heading" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">ARQUIVO PESSOAL</p>
          <h1 id="page-title">Seus documentos</h1>
        </div>
        <p className="document-count" aria-live="polite">
          {documents.length.toString().padStart(2, '0')} <span>itens</span>
        </p>
      </section>

      <section className="document-workspace" aria-label="Gerenciar documentos">
        <aside className="upload-panel">
          <div className="section-title">
            <span className="section-index">01</span>
            <h2>Adicionar arquivo</h2>
          </div>
          <UploadComponent
            disabled={!userId.trim()}
            onUpload={handleUpload}
          />
          <p className="local-note"><span aria-hidden="true">●</span> Armazenamento local</p>
        </aside>

        <section className="list-panel" aria-labelledby="list-title">
          <div className="section-title list-title">
            <span className="section-index">02</span>
            <h2 id="list-title">Biblioteca</h2>
            {isLoading && <span className="loading-label">Carregando</span>}
          </div>

          {error && <p className="feedback feedback-error" role="alert">{error}</p>}
          {notice && !error && <p className="feedback feedback-success" role="status">{notice}</p>}

          {!userId.trim() ? (
            <p className="empty-state">Informe um identificador de usuário para abrir a biblioteca.</p>
          ) : isLoading ? (
            <p className="empty-state">Buscando documentos...</p>
          ) : (
            <DocumentList
              documents={documents}
              userId={userId.trim()}
              onError={handleError}
            />
          )}
        </section>
      </section>
      <footer className="page-footer">
        <span>DOCUMENT MANAGEMENT SYSTEM</span>
        <span>VERSÃO 1.0</span>
      </footer>
    </main>
  );
}