# V2.2 — validação e licenças

Protótipo isolado em `studio-v2.html`. Não publicar sem homologação.

## Assets

Nenhum GLB ou HDRI de terceiros é distribuído nesta versão. A camiseta procedural é a opção padrão. O importador GLB local exige declaração de direitos, que não equivale à verificação de licença. Antes de incorporar um asset comercial, registrar autor, URL original, licença e versão, atribuição e permissões de modificação/redistribuição. Aplicar o mesmo processo ao HDRI e texturas. GLB importado é somente prévia; não suporta estampas nesta versão. Arquivos com dependências externas são recusados.

## Roteiro de homologação (pendente de execução)

- Servir a branch localmente via HTTP, abrir studio-v2.html em Chrome e Safari/iPhone; verificar console e carregamento CDN.
- Conferir frente, costas, rotação, zoom, redução de movimento, resize e perda de contexto WebGL.
- Aplicar PNG transparente distinto em cada lado; conferir escala, posição e cor após girar.
- Importar GLB autorizado autocontido; verificar normalização, retorno ao modelo procedural, rejeição de arquivo inválido e de URI externa.
- Importar HDR autorizado; verificar iluminação, troca e restauração, erro de arquivo inválido.
- Exportar PNG transparente e escuro; abrir arquivo, conferir dimensões, alfa, ausência de UI e correspondência à vista.
- Medir FPS e memória em celular real, repetir importações e exportações. Não considerar produção aprovada até passar.

Materiais usam MeshStandardMaterial, relevo procedural e iluminação ambiental opcional; não são texturas fotográficas medidas. A exportação usa resolução do canvas atual. Nenhuma venda ou pagamento é confirmado pelo protótipo.
