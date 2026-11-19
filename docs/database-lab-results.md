# Database Lab — 2026-11-19

Applied existing migration `20261119041000_print_core.sql` to development project only. Hosted migration history version `20261119042617`, name `print_core`; reconcile version before automated CLI deployment.

Verified four print tables with RLS enabled. Transactional SQL tests using temporary auth.users identities and authenticated role/JWT sub simulation passed: A/B catalog isolation, cross-company insert denial, own draft order creation, cross-company order read denial. Separate transactional storage metadata tests passed own insert/read and cross-company insert/read denial. Both tests rolled back. Private bucket print-artworks: 10 MiB, PNG/JPEG/WebP. Security advisors returned no lints.

Not verified: actual Auth login/token issuance, HTTP Data API exposure for custom print schema, binary upload/download, frontend, order lifecycle. Membership provisioning is privileged; draft artwork paths do not prove file existence. Do not publish or use production until these gates are resolved. No paid resources authorized.
