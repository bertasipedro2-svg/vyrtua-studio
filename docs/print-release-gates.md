# VYRTUA PRINT — release gates

Development only: vyrtua-print-dev. No production deployment.

- Core schema and RLS: SQL tests passed with simulated identities.
- Draft order policy: requires active product and artwork metadata; SQL test passed.
- Browser interface and HTTP smoke script: committed, not runtime verified.
- CI: committed; execution not confirmed.
- Auth: provision two confirmed test users via official Auth Admin or dashboard; link companies and seed products.
- Verify actual HTTP login, cross-tenant reads/writes, binary storage upload/download and cleanup.
- Reconcile migration timestamps before automated database deploys: original 20261119041000 maps to applied 20261119042617.
- Integrate original visual editor and catalog management; implement authorized status transitions, orphan artwork cleanup, mobile tests and release review.
- Do not promote to main until all gates pass and owner authorizes deployment.
