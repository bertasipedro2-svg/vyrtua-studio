# VYRTUA STUDIO — Future Commerce

Loja virtual de moda, estampas e personalização. Desenvolvimento mobile-first, com prioridade para ferramentas gratuitas e código editável.

## Estado atual — protótipo

O arquivo `index.html` contém:
- Home futurista responsiva, introdução com opção de pular e navegação por âncoras.
- Catálogo de **produtos fictícios de demonstração**, sem preços reais.
- Filtros por categoria.
- Creative Lab com **prévia ilustrativa 2D**, seleção de cor, arte, tamanho e quantidade.
- Sacola demonstrativa com persistência local no navegador, edição por remoção e limpeza.
- Solicitação de **orçamento** por WhatsApp, sem criar pedido ou cobrança.

**Não é um e-commerce apto a receber pagamentos.** Não há backend, autenticação, estoque, cálculo de frete, pedidos persistidos em servidor, integração de PIX/cartão ou confirmação automática. Não inserir dados reais de clientes no código.

## Visualizar

Abra `index.html` em um navegador ou publique a branch `main`, pasta `/(root)`, em **Settings → Pages**. Endereço esperado após a publicação: https://bertasipedro2-svg.github.io/vyrtua-studio/

Se houver 404, verifique o status da implantação em **Actions** e a mensagem de publicação em **Settings → Pages**. O arquivo estar salvo no GitHub não garante que o site esteja publicado.

## Plano de desenvolvimento

1. **Identidade e catálogo:** cadastrar fotos próprias, nomes, preços e variações reais; separar CSS/JS e dados.
2. **Personalizador:** prévia 2D com posicionamento e upload de arte; posteriormente modelos 3D licenciados e otimizados.
3. **Backend e pedidos:** banco de dados, validação no servidor, controle de acesso, armazenamento seguro e regras de produção.
4. **Checkout:** dados de entrega, cotação real de frete e integração de pagamentos com gateway. Confirmar pagamento exclusivamente por webhook verificado.
5. **Administração:** autenticação, produtos, kits, pedidos, rastreamento e relatórios.
6. **Qualidade:** testes mobile, acessibilidade, desempenho, segurança, privacidade e publicação.

## Segurança

- Nunca colocar chaves privadas, tokens de gateway, senhas ou dados pessoais no repositório.
- Nunca confiar em preços ou estados de pagamento enviados pelo navegador.
- Um link de WhatsApp não substitui armazenamento confiável de pedidos.
- A implementação de pagamentos poderá envolver taxas e requisitos do provedor.

## Contato

WhatsApp comercial: https://wa.me/5511934515159
