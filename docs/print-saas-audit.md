# VYRTUA PRINT — initial audit

Base: development/fase-1-profissional. Preserve existing application. Public repo: never store customer artwork, credentials or personal data here.

Inspected README, main index, branch catalog JSON, catalog and editor, floating tee showroom, mannequins page and script, cart. Catalog has nine categories and zero products. Local drafts and WhatsApp consultation are not persisted orders. Showroom uses external model and reduced artwork preview (480px); keep private original separately and verify commercial model licensing. Existing visualizations are not production proofs.

MVP: tenant membership and server-enforced isolation; per-tenant products/variants and prices in cents; private original artwork and preview; immutable quote snapshots; order lifecycle draft/requested/quoted/approved/in_production/ready/completed/cancelled; manual PIX subscription verification by authorized platform admin only. Tenant ID from verified membership, never trust client supplied roles/prices. RLS and storage policies must be tested with two tenants and anonymous access before release. No real customer uploads until security tests pass.

No deployment, main modifications, Lovable or paid resources authorized. Initial inspection partial, browser and existing tests not executed yet.
