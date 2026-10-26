---
name: commit
description: "Cria commits Git automaticamente usando as descrições do Copilot sobre as alterações realizadas."
agent: agent
---

Faça o commit das alterações da tarefa atual, usando as descrições e o resumo
do Copilot nesta conversa como base para a mensagem.

## Procedimento

1. Inspecione `git status --short`, `git diff` e `git diff --cached`, sempre sem
   pager. Leia também os arquivos novos relevantes, pois não aparecem no diff.
2. Identifique os arquivos e trechos pertencentes à tarefa atual. Não inclua
   alterações de outras tarefas, credenciais, segredos, arquivos temporários ou
   artefatos de build. Se houver alterações já staged alheias à tarefa ou não for
   possível separar o escopo com segurança, pare e peça orientação sem modificar
   o índice.
3. Confira os resultados das validações da tarefa. Execute apenas as verificações
   pertinentes que ainda não tenham sido executadas para a versão atual das
   alterações. Se falharem, informe o problema e não faça o commit. Para mudanças
   exclusivamente documentais, não execute testes, salvo se houver testes de
   documentação configurados.
4. Gere uma mensagem em português, com título curto no imperativo e, se
   necessário, um corpo descrevendo as principais mudanças e validações.
   Use as descrições do Copilot como ponto de partida, mas confirme cada afirmação
   no diff. Não copie promessas, etapas pendentes ou afirmações sem evidência.
   Se não houver descrição disponível na conversa, gere a descrição a partir das
   alterações reais. Siga as convenções de commit do repositório.
5. Adicione ao stage somente os caminhos explicitamente identificados como parte
   da tarefa, usando `git add -- <caminhos>`. Não use `git add .` ou `git add -A`.
   Se um arquivo misturar alterações da tarefa com mudanças alheias, peça
   orientação antes de adicioná-lo.
6. Revise `git diff --cached --check` e `git diff --cached` para confirmar o
   conteúdo exato. Se não houver alterações para commitar, informe isso e encerre.
7. Execute `git commit` de forma não interativa, sem solicitar confirmação extra
   quando o escopo estiver claro. Inclua ao final da mensagem:

   ```text
   Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
   ```

8. Confirme o resultado com `git log -1 --format=fuller` e `git status --short`.
   Informe o hash, a mensagem usada, as validações e eventuais alterações restantes.

## Limites

- Este prompt autoriza criar commits apenas quando for invocado; não instala
  hooks nem executa commits continuamente em segundo plano.
- Não faça push, amend, reset, checkout, limpeza de arquivos ou reescrita do
  histórico. Não altere a configuração ou a identidade do Git.
- Não ignore hooks ou validações com `--no-verify`.
- Se o Git, um hook ou uma validação falhar, apresente o erro e pare sem declarar
  sucesso.
