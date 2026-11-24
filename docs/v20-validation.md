# V20 — validation gates

2026-11-24: Chromium executable available in test environment. Actual curl requests to cdn.jsdelivr.net (Three.js 0.170.0) and raw.githubusercontent.com (original tee.glb) both failed with curl exit 6, DNS resolution. This is a limitation of the test environment, not proof that the public endpoints are down. No browser rendering pass claimed.

## Before approval
- Verify Pages source and deployment SHA in repository settings; compare public HTML BUILD marker with approved commit. Do not change Pages settings from a preview branch.
- Serve branch locally via HTTP, open showroom-floating-tee.html and manequins-3d.html in Chromium and Safari. Inspect console and network; confirm GLB loads and WebGL renders. Test touch, UV placement, layers, colors, quote/cart, PNG export, and context recovery. Record screenshots and errors.
- Verify original GLB and texture licensing before vendoring; preserve source attribution. Pin dependencies and record checksums.
- Unified Three.js editor and photorealistic cloth assets remain pending. Do not merge until rendering is validated and owner approves.
