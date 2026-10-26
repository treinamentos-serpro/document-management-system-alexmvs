# Document Management System com GitHub Copilot

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey alexmvs!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/treinamentos-serpro/document-management-system-alexmvs/issues/1)

---

## Executar a aplicação

Com Node.js 24 ou superior, instale as dependências e inicie cada serviço em
um terminal separado:

```sh
cd backend
npm ci
npm start
```

```sh
cd frontend
npm ci
npm run dev
```

Abra `http://localhost:5173`. Informe o identificador do usuário, selecione um
arquivo e clique em **Enviar documento**. A biblioteca é atualizada após o envio;
o botão de download ao lado de cada documento baixa o arquivo original.

O cliente em `frontend/src/services/documentService.js` utiliza `fetch` com o
prefixo `/api`. O proxy do Vite encaminha essas chamadas ao backend em
`http://localhost:3000`, removendo o prefixo. As três operações enviam o
cabeçalho `X-User-Id`. Esse identificador separa bibliotecas, mas não substitui
autenticação. Os arquivos ficam no armazenamento local e os metadados em memória
são perdidos ao reiniciar o backend.

Para validar o frontend, execute `npm test` e `npm run build` em `frontend`.
Para validar o backend, execute `npm test` em `backend`.

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)
