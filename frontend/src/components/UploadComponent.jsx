import { useRef, useState } from 'react';

export function UploadComponent({ disabled, onUpload }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const formRef = useRef(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!file || disabled || isUploading) {
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(file);
      setFile(null);
      formRef.current?.reset();
    } catch {
      // O formulário mantém o arquivo selecionado para permitir nova tentativa.
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit} ref={formRef}>
      <label className="file-picker">
        <span className="file-picker-mark" aria-hidden="true">+</span>
        <span className="file-picker-copy">
          <strong>{file ? file.name : 'Escolher arquivo'}</strong>
          <small>{file ? `${(file.size / 1024).toFixed(1)} KB` : 'Um arquivo por envio'}</small>
        </span>
        <input
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          disabled={disabled || isUploading}
        />
      </label>
      <button className="primary-button" type="submit" disabled={!file || disabled || isUploading}>
        {isUploading ? 'Enviando...' : 'Enviar documento'}
        <span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}