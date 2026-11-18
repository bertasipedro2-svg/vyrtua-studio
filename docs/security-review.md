# Revisão de segurança — fase 1

Escopo: catálogo, sacola, renderizadores e CI. Revisão estática, não pentest.

- Catálogo: rejeita estrutura inválida, IDs duplicados e categorias desconhecidas. Validação de variantes, imagens e editor ainda precisa ser unificada.
- Sacola: descarta registros nulos, preços negativos ou excessivos e quantidades inválidas; limita listas locais a 100 itens e miniaturas a 1 MB textual. Dados locais continuam manipuláveis: não usar como autoridade de preço ou pedido.
- WhatsApp: somente consulta, sem confirmação de venda. Não guardar dados pessoais ou segredos no repositório público.
- Administração: editor público de rascunhos não oferece autenticação. Antes de vendas, implementar backend, autorização, validação de preços/estoque e política de privacidade.
- Dependências externas: Three.js e model-viewer carregados por CDN; avaliar hospedagem local, integridade e política CSP antes de produção.
- WebGL: máximo de dois renderizadores ativos; testar recuperação, rolagem rápida e dispositivos reais. Simulação WebKit não substitui Safari físico.
- CI: testes Playwright com dados fictícios interceptados no navegador. Não acessam pagamentos nem enviam mensagens. Resultados ainda não confirmados.
- Não houve auditoria de histórico inteiro, varredura de segredos, teste intrusivo ou validação de backend inexistente.
