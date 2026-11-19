# Testes de aceitação — fase 1

Executar em ambiente de prévia da branch, nunca substituir main para testar.

- Safari iPhone: abrir home, catálogo, manequins e sacola; verificar ausência de tela branca e links quebrados.
- Rolar até cada manequim; verificar inicialização, rotação, zoom e troca de roupa.
- Alterar cor do primeiro e verificar que os demais mantêm suas cores.
- Alternar roupa repetidamente e observar travamentos ou perda de contexto WebGL.
- Importar catálogo fictício com variantes, duas imagens e notas; editar nome, exportar e comparar campos preservados.
- Testar catálogo vazio e produto fictício sem publicar dados reais.
- Testar sacola e WhatsApp sem enviar pedido real.
- Rodar `node --test tests/smoke.cjs` na raiz.

Não há resultado de execução mobile confirmado. Testes de marcadores são estáticos, não substituem testes de navegador. O carregamento tardio não limita o número total de contextos WebGL após rolagem. Para reverter, usar revert dos commits na branch de desenvolvimento; não alterar main.
