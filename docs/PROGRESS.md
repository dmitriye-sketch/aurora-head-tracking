# Aurora implementation checkpoint

Scope: attached Photo 2.jpg, automatically animated 2.5D on entry, optional user-enabled local head tracking, public GitHub Pages deployment explicitly requested in attached task. No stock replacement. Naming/public repository selected by owner; store reservation/native signing N/A to this web-only product.

Storage: /Volumes/vader (UUID EB3B1436-A261-4EBE-8220-6F046337F883), canonical /Volumes/vader/Codex/aurora-head-tracking.

Architecture: main.ts composes AppController, static image fallback and lazy PhotoDepthScene. AppController owns modes/input/lifecycle. scene/SceneAdapter isolates renderer replacement. tracking/HeadTracker owns camera/model lifecycle; tracking/math owns translation and smoothing. No backend, account or persistent biometric storage.

Visual contract: preserve entire portrait photo with contain geometry, correct sRGB and no retouching. Quiet dark surroundings; original photograph dominates. Mobile controls follow photo, hide/show available. Auto runs without touch; reduced-motion preference pauses passive motion until explicit Auto selection. Head tracking requires Safari permission by click. Small continuous warp is 2.5D, not reconstructed geometry or Gaussian splatting. Original photo is the concrete reference; unrelated Pinterest art is unnecessary.

QWEN_DECISION: no_suitable_task for implementation block: current work is lifecycle-sensitive camera logic, renderer integration and final acceptance; deterministic tools cover extraction and verification. No useful bounded 4B text drafting task yet.

Routing: Jev returned low-confidence/no suggested model for isolated renderer task. Available gpt-6.1-terra/medium used for that module under local matrix; no savings claim.

Verification pending: unit/build, browser viewport/image/Auto/Touch/permission/lifecycle, security scanners + independent review, deployment and live asset checks. Physical iPhone camera/FPS are not tested.

## Verified candidate 995f42f

- Original image SHA256 equals attachment: 79ea3a6d3313b7a5d0cb51aef3213cf7453a10cd591d71d6d1b83dde02e4b479.
- `npm test`: 7/7 pass. `npm run build`: TypeScript and Vite pass. `npm audit`: 0 known vulnerabilities. Large Three chunk warning (~531 kB raw /132 kB gzip) retained; lazy loaded separately from static image.
- `npm run coverage`: V8 data for pure math/depth, 13/13 and 4/4 hit ranges; not an 80% whole-app coverage certificate. Camera/browser state tests supplement numerical unit checks.
- Playwright interactive pass: original decoded at854×1280, actual canvas, automatic offset changes without input, Touch/keyboard, reset, hide/show, 390×844,1440×900 and844×390 no horizontal overflow. Exact saved screenshots inspected in mobile, desktop and landscape. Entire original composition visible; no replacement imagery, color adjustment or stretching. Photo border originates in original asset. Mobile controls follow photo rather than covering landscape.
- Visual gate: brief/reference composition PASS; real image at product scale PASS; typography/control finish PASS; image technical truth PASS. Agent-inspected implementation candidate, not owner-approved or physically iPhone-verified. Photo retains captured natural water/grass/forest/sky surfaces; no generated materials or PBR assets introduced.
- Security reviewer (Astra/high) found low correctness defect: stop retained face-loss state, causing second no-face start status to stall. Prevention: reset session state on stop; test restart with no face. Corrected in995f42f; independent behavioral repro passes. Gitleaks8.30.1 tree/history and Semgrep1.179.0 baseline +three focused web rules returned0 findings. Security publication gate PASS for candidate; opaque third-party runtime limitations retained in SECURITY.md.
- Browser fake-camera full-model test initially reproduced repeat-start timeout; superseded by rerun against fix, still pending at checkpoint. No real face/iPhone/head accuracy/FPS claim.
