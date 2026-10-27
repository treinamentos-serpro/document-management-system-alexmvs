# Especificação - Document Management System

## 1. Objetivo

Permitir que usuários enviem, listem e baixem seus documentos, armazenados localmente pela aplicação.

## 2. Escopo

### Dentro do escopo

- Envio de um documento por requisição.
- Listagem dos documentos associados ao usuário.
- Download pelo identificador do documento.
- Associação de metadados a um identificador de usuário.
- Interface web para upload, listagem e download.

### Fora do escopo

- Armazenamento externo ou em nuvem.
- Versionamento, edição ou exclusão de documentos.
- Cadastro, autenticação e administração de usuários.
- Persistência durável dos metadados.
- Busca avançada, compartilhamento e permissões configuráveis.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar um arquivo em `multipart/form-data`, no campo `file`. |
| RF-02 | O sistema deve exigir o identificador do usuário no cabeçalho `X-User-Id`. |
| RF-03 | O sistema deve associar o documento ao usuário que realizou o envio. |
| RF-04 | O sistema deve gerar um identificador único e um nome interno seguro para o arquivo. |
| RF-05 | O sistema deve listar somente os documentos associados ao usuário informado. |
| RF-06 | A listagem deve apresentar os documentos mais recentes primeiro. |
| RF-07 | O sistema deve permitir o download por identificador somente para o usuário associado. |
| RF-08 | A interface deve permitir selecionar e enviar um arquivo, exibir a listagem e iniciar downloads. |
| RF-09 | A interface deve apresentar estados de carregamento, sucesso e erro. |
| RF-10 | O backend deve disponibilizar `GET /health` para verificação de saúde. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Arquivos gravados no filesystem local usando Multer `diskStorage`, em `backend/storage` por padrão. |
| RNF-02 | Metadados mantidos em memória nesta fase. |
| RNF-03 | Diretório, limite do arquivo e porta configuráveis por `STORAGE_DIR`, `MAX_FILE_SIZE_BYTES` e `PORT`. |
| RNF-04 | O limite padrão de upload é 10 MiB. |
| RNF-05 | O nome original não deve ser usado como caminho no filesystem. |
| RNF-06 | O frontend consome a API via `fetch` e prefixo `/api`; o proxy de desenvolvimento remove esse prefixo. |
| RNF-07 | Backend organizado em `routes -> controllers -> services -> repositories`, sem dependência de camadas externas nas internas. |
| RNF-08 | Erros de entrada e filesystem devem produzir respostas controladas, sem caminhos internos ou stack traces. |

## 5. Modelo de dados

Metadados mantidos em memória por documento:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string | Identificador único UUID. |
| `originalName` | string | Nome original enviado pelo usuário. |
| `size` | number | Tamanho em bytes. |
| `uploadedAt` | string | Data/hora do upload em ISO 8601. |
| `owner` | string | Identificador associado via `X-User-Id`. |
| `mimeType` | string ou null | Tipo MIME informado pelo cliente. |
| `storageName` | string | Nome interno gerado para localizar o arquivo; não é exposto pela API. |

## 6. Contratos de API

As rotas do backend não usam `/api`. O frontend chama `/api/upload`, `/api/documents` e `/api/documents/:id/download` por meio do proxy do Vite.

### `POST /upload`

- Cabeçalho obrigatório: `X-User-Id`.
- Entrada: `multipart/form-data`, campo `file`.
- Sucesso: `201 Created`, JSON `{ "document": { "id", "originalName", "size", "uploadedAt", "owner", "mimeType" } }`.
- Erros: `400` para usuário ou arquivo ausente; `413` para arquivo acima do limite; `500` para falha inesperada.
- Se o registro dos metadados falhar, o serviço tenta remover o arquivo gravado.

### `GET /documents`

- Cabeçalho obrigatório: `X-User-Id`.
- Sucesso: `200 OK`, JSON `{ "documents": [...] }`; lista vazia retorna `documents: []`.
- Retorna somente documentos do usuário e não inclui `storageName`.

### `GET /documents/:id/download`

- Cabeçalho obrigatório: `X-User-Id`.
- Sucesso: `200 OK`, conteúdo binário e `Content-Disposition: attachment` com o nome original.
- Erros: `404` se o documento não existir, não pertencer ao usuário ou o arquivo não estiver disponível.

### Formato de erro

JSON `{ "error": { "code": "CODIGO", "message": "Descrição" } }`. Respostas de erro não expõem stack trace ou caminho local.

## 7. Decisões arquiteturais e riscos

- Rotas delegam aos controllers; controllers tratam HTTP e validação básica; services concentram regras de negócio; repositories gerenciam metadados e arquivos locais.
- Multer usa `diskStorage` e nome interno gerado pela aplicação. O nome original é apenas metadado.
- `X-User-Id` identifica o proprietário, mas não é uma credencial. Sem autenticação, pode ser falsificado; o isolamento atual não é um controle de acesso seguro.
- Os metadados são perdidos ao reiniciar o processo. Arquivos no disco podem permanecer órfãos após reinício; recuperação e limpeza não fazem parte desta versão.
- Tipos de arquivo não são restringidos nesta fase; o tamanho é limitado a 10 MiB por padrão.

## 8. Plano de execução

1. Validar requisitos, identidade de usuário, limite de upload e contratos. **Concluído:** decisões registradas nesta especificação.
2. Implementar backend por camadas e armazenamento local. **Concluído:** rotas, controllers, services, repositories e testes HTTP.
3. Implementar interface web. **Concluído:** upload, listagem, download e apresentação de estados.
4. Integrar e validar os fluxos. **Concluído:** testes do backend e build de produção do frontend.