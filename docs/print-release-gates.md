# VYRTUA PRINT · homologação de desenvolvimento

Abra `print-dev.html` em um servidor local (`python3 -m http.server 4173` na raiz), ou em hospedagem HTTPS exclusiva da branch de desenvolvimento. O painel usa somente o projeto `vyrtua-print-dev`. Entre com a chave publicável DEV e uma conta vinculada a uma empresa. A sessão fica na memória da aba.

## Fluxo do painel

- **Owner:** cadastra e edita produtos, solicita, emite e aprova orçamentos, controla a produção e pode cancelar pedidos até a aprovação.
- **Staff:** consulta catálogo e pedidos da empresa, cria rascunhos, solicita orçamento e avança pedidos aprovados na produção.
- **Personalização:** escolha um produto ativo e abra o editor visual. A versão do editor no painel envia o arquivo original e as medidas. O editor independente preserva o fluxo de sacola local.
- **Dashboard:** mostra pedidos em aberto, produção, orçamentos aguardando aprovação e valor dos pedidos concluídos. Este último é baseado no orçamento aprovado.

## Evidências

- 14 testes locais Node passaram, incluindo as verificações do catálogo existente.
- Teste transacional no PostgreSQL dev confirmou isolamento entre duas empresas, autorização de owner e staff, transições e totais. As identidades SQL usadas em teste foram revertidas. Elas não são contas Auth.
- A Data API devolvia HTTP 406 (`PGRST106`) para `print`. Após a migração `20261119044748`, a mesma consulta anônima devolveu HTTP 401 (`42501`), como esperado. O bucket `print-artworks` tem `public=false`.
- O histórico remoto e os nomes dos arquivos de migração agora usam as mesmas versões. A migração do ciclo de pedidos é `20261119044409`.
- O [GitHub Actions](https://github.com/bertasipedro2-svg/vyrtua-studio/actions/runs/44461763694) confirmou os 14 testes Node e o cenário WebKit com perfil de iPhone 13, incluindo catálogo, editor, bytes do PNG recebidos por um servidor HTTP local e ciclo do pedido com respostas simuladas. A etapa HTTP autenticada ficou bloqueada pelos segredos ausentes.

## Homologação pendente

1. No painel Auth do Supabase dev, crie duas contas fictícias confirmadas. Vincule-as a empresas distintas como owner e cadastre um produto ativo em cada empresa. Use o painel do GitHub para configurar os segredos `PRINT_DEV_PUBLISHABLE_KEY`, `PRINT_DEV_TEST_A_EMAIL`, `PRINT_DEV_TEST_A_PASSWORD`, `PRINT_DEV_TEST_B_EMAIL` e `PRINT_DEV_TEST_B_PASSWORD`.
2. Execute o workflow no ref `development/vyrtua-print-saas`. O teste HTTP verifica login e leitura do próprio catálogo, mais isolamento entre empresas.
3. Com as duas contas, valide upload e download binário, permissões de alteração e o ciclo completo do pedido pelo painel. Faça o percurso também no Safari de um iPhone. Registre a execução e os resultados.
4. Defina a remoção de estampas órfãs usando a API de Storage. Uma interrupção entre upload e gravação do pedido pode deixar um arquivo privado sem vínculo. A exclusão direta de metadados SQL não apaga o binário.

Este procedimento usa exclusivamente a branch e o Supabase de desenvolvimento.
