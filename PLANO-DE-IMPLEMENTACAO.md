# VYRTUA STUDIO — Arquitetura e implementação

## Estado verificado no repositório (18/11/2026)
- `index.html`: home experimental, intro, navegação e demonstrações.
- `catalogo.html`: catálogo público filtrável alimentado por `data/catalog.json`.
- `produto.html`: detalhes de um produto publicado via `?id=...`, variações, quantidade, contato WhatsApp e sacola local de demonstração.
- `editor-catalogo.html`: editor local sem autenticação de servidor; NÃO é painel administrativo seguro.
- `showroom-3d.html`, `showroom-real-3d.html`, `showroom-floating-tee.html`: experiências 3D ilustrativas e dependentes de compatibilidade e recursos externos.
- `data/catalog.json`: categorias definidas, nenhum produto real publicado.

## Mapa de rotas
| Rota | Situação |
| --- | --- |
| / | Home demonstrativa existente |
| /catalogo.html | Catálogo público existente |
| /produto.html?id=ID | Detalhes implementados, aguardando produtos reais |
| /creative-lab.html | Planejada |
| /personalizar.html | Planejada |
| /carrinho.html | Planejada |
| /checkout.html | Planejada, não aceitar dados pessoais antes do backend |
| /pedido.html | Planejada |
| /admin/ | Planejada, requer autenticação no servidor |

## Stack e fronteiras de confiança
- Fase inicial: HTML, CSS e JavaScript no GitHub Pages, GitHub como versionamento, JSON apenas para dados públicos.
- Backend futuro: PostgreSQL/Supabase com RLS, políticas de autorização, armazenamento privado e funções seguras. Verificar limites e custos do plano antes de ativar.
- Checkout e pagamento: criação de pedido e cálculo final no servidor, gateway com checkout hospedado/tokenização; confirmação exclusivamente por webhook validado e idempotente. Nenhuma chave privada no JavaScript público.
- Frete: cotação via integração segura ou confirmação manual pelo administrador; nunca simular valores.
- Administração: autenticação, autorização por papel, logs e políticas de acesso; não confiar em localStorage para dados sensíveis.
- WhatsApp: canal de contato; mensagem aberta não é pedido pago nem pedido salvo no servidor.

## Modelo de dados proposto
- products(id, slug, name, description, published, category_id)
- product_variants(id, product_id, sku, size, color, price_cents, stock)
- designs(id, name, category, asset_path, rights_status)
- carts e cart_items (opcional, conforme necessidade de sessão)
- orders(id, order_number, status, payment_status, total_cents, shipping_cents, customer_id ou guest)
- order_items(id, order_id, variant_id, quantity, unit_price_cents, customization_snapshot)
- customization_assets(id, order_item_id, storage_path, mime_type, rights_ack)
- shipping_addresses, shipments, payment_events, admin_audit_log
- Segredos, dados de endereço e arquivos de clientes nunca devem ser publicados no repositório.

## Plano de execução
1. Consolidar a identidade visual, navegação e páginas de catálogo e produto.
2. Adicionar Creative Lab e personalização 2D confiável; usar 3D apenas quando o modelo e a posição de impressão forem calibrados.
3. Implementar sacola única e persistência local não sensível; criar backend e checkout validado.
4. Integrar PIX/cartão e webhooks de confirmação segura; registrar pedidos no banco e notificar o administrador.
5. Criar painel administrativo com autenticação real, RLS e gestão de produtos, estampas, kits, pedidos e entregas.
6. Testar acessibilidade, iPhone/Android, erros de rede, pedidos duplicados, webhook, privacidade e publicação.

## Teste manual no iPhone — fase 1
1. Abrir https://bertasipedro2-svg.github.io/vyrtua-studio/catalogo.html
2. Verificar se as nove categorias aparecem. Sem produtos publicados, a mensagem de coleção em preparação é o comportamento esperado.
3. Abrir https://bertasipedro2-svg.github.io/vyrtua-studio/produto.html sem parâmetro: deve solicitar a seleção de um produto.
4. Abrir `produto.html?id=inexistente`: deve exibir produto indisponível.
5. Quando um produto real estiver publicado no JSON, abrir o cartão no catálogo e validar nome, foto, variações, preço e link do WhatsApp.
6. Testar sacola local somente após cadastrar produto com preço e variações válidos. Ainda não há checkout.
7. Caso a página mostre 404 logo após um commit, conferir Actions / Pages e aguardar publicação; usar query string para evitar cache.

## Limitações e segurança
A implementação atual NÃO processa pagamentos, NÃO confirma estoque, NÃO armazena pedidos em servidor, NÃO calcula frete real e NÃO contém administração segura. A sacola local não é uma fonte confiável para preço, estoque ou pedido. Não coletar endereço ou dados pessoais em páginas estáticas sem backend e política de privacidade apropriada.
