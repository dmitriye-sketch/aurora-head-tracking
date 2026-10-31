# Aurora implementation checkpoint

Scope: attached Photo 2.jpg, automatically animated 2.5D on entry, optional user-enabled local head tracking, public GitHub Pages deployment explicitly requested in attached task. No stock replacement. Naming/public repository selected by owner; store reservation/native signing N/A to this web-only product.

Storage: /Volumes/vader (UUID EB3B1436-A261-4EBE-8220-6F046337F883), canonical /Volumes/vader/Codex/aurora-head-tracking.

Architecture: main.ts composes AppController, static image fallback and lazy PhotoDepthScene. AppController owns modes/input/lifecycle. scene/SceneAdapter isolates renderer replacement. tracking/HeadTracker owns camera/model lifecycle; tracking/math owns translation and smoothing. No backend, account or persistent biometric storage.

Visual contract: preserve entire portrait photo with contain geometry, correct sRGB and no retouching. Quiet dark surroundings; original photograph dominates. Mobile controls follow photo, hide/show available. Auto runs without touch; reduced-motion preference pauses passive motion until explicit Auto selection. Head tracking requires Safari permission by click. Small continuous warp is 2.5D, not reconstructed geometry or Gaussian splatting. Original photo is the concrete reference; unrelated Pinterest art is unnecessary.

QWEN_DECISION: no_suitable_task for implementation block: current work is lifecycle-sensitive camera logic, renderer integration and final acceptance; deterministic tools cover extraction and verification. No useful bounded 4B text drafting task yet.

Routing: Jev returned low-confidence/no suggested model for isolated renderer task. Available gpt-6.1-terra/medium used for that module under local matrix; no savings claim.

Verification pending: unit/build, browser viewport/image/Auto/Touch/permission/lifecycle, security scanners + independent review, deployment and live asset checks. Physical iPhone camera/FPS are not tested.
