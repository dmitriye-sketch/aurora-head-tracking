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

## Functional rerun after correction

`PLAYWRIGHT_BROWSERS_PATH=/Volumes/vader/Codex/GitHubKit/tools/browsers node scripts/browser-smoke.cjs` PASS (12 scenario outcomes in work/browser-results.json): actual locked MediaPipe JS/WASM/model initialized on Chromium fake camera; two no-face sessions; mode/background tracks ended; denied camera returned to Auto; reduced motion respected and explicit Auto restarts; image fallback without WebGL; no page errors; mobile axe zero violations; layout/input/control checks. This supersedes initial second-session timeout. Camera test is fake-device Chromium, not physical iPhone or real-face tracking accuracy.

## Initial deployment correction

The first main run was cancelled by the subsequent codex push; codex deploy then failed before execution because github-pages permits main only. Confirmed via check-run annotations124528252624; no build failure or billing issue. Retain that branch protection. Narrow automatic workflow trigger to main and publish the initial reviewed site snapshot there; codex remains working branch. No force push or protection bypass.

## Published acceptance 2026-10-31

Published application/config commit6b77cabfe9ea77cd3e54c6c88ed4cad44999ce29. Actions run41198272282 SUCCESS: https://github.com/dmitriye-sketch/aurora-head-tracking/actions/runs/41198272282 . Both initial public main and working branch synced to that snapshot before this handoff-only update. Protected security reviewer accepted final workflow delta; application bytes unchanged from995f42f.

Live https://dmitriye-sketch.github.io/aurora-head-tracking/ checked in actual Chromium browser at390×844: secure context=true, source image decoded854×1280, canvas1, automatic motion changes without input, no overflow, console0errors. Published screenshot work/published-mobile.png opened/inspected against original. All16dist files returned HTTP200, including model, allWASM variants and lazyJS/CSS; WASM MIME application/wasm. Downloaded live photo hash matches original byte-for-byte. Raw work/live-check.json. No Safari/iPhone hardware claim.

Final decision: published browser-tested prototype; physical iPhone head tracking/FPS validation remains outstanding. Purposefully limited continuous depth warp; no invented depth estimation/hidden reconstruction/3DGS. User's automatic-effect correction is implemented as default Auto, manual Touch optional only. No owner selection/approval of invented UI is claimed.

Resource lifecycle: browser-smoke contexts closed via finally; task-owned interactive browser closed; task dev server stopped after checks. Sources, accepted screenshots, compact logs/security/browser/live evidence retained on Vader; temporary copied screenshot files removed from local mirror after byte verification. No shared services or owner Chrome touched. Models used: renderer gpt-6.1-terra/medium; protected independent security Astra/high; lead unchanged. Qwen no_suitable_task for protected final acceptance/deterministic checks.
