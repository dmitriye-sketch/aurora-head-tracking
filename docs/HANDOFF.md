# Aurora handoff

Canonical source: /Volumes/vader/Codex/aurora-head-tracking, branch codex/aurora. Reviewed application995f42f; report-only checkpoint6fe0485. Repo: https://github.com/dmitriye-sketch/aurora-head-tracking . Intended Pages: https://dmitriye-sketch.github.io/aurora-head-tracking/ . Initial public publication expressly requested in supplied task.

Auto animates immediately without dragging (except respected reduced-motion setting). Head mode requires an explicit click and browser permission; camera/model processing is local. Original photo unchanged byte-for-byte. 2.5D authored continuous UV warp, not 3DGS/ML depth/inpainting. Camera translation is an approximation from eye midpoint movement; not calibrated metric head position. Full multi-view geometry needs new capture.

Seven unit checks, build/typecheck, zero-vulnerability npm audit, local Gitleaks/Semgrep and protected independent security review passed. Real-model browser smoke12outcomes passed, with fake Chromium camera. Browser captures were opened and inspected at390×844,844×390,1440×900. Screenshot evidence is in ignored work/. Whole-app80%coverage not established; pure numerical depth/math have all collected V8 functions/ranges hit. Do not mislabel these measures.

No physical iPhone camera, real-face accuracy, 60FPS, thermal or iOS Safari hardware test has run. Next device check: Safari HTTPS open, observe Auto, tap Head tracking/Allow, recenter facing screen then move head sideways, switch Auto and verify iOS camera indicator clears, background and return, rotate portrait/landscape. Capture actual iPhone/FPS evidence before asserting hardware acceptance.

MediaPipe first-time head mode needs a ~14MB selected WASM plus3.6MBmodel download. Static photo/Auto do not need model download. JS/texture loads are same-origin; no external frame transfer. Three render chunk531kBraw/132kBgzip is lazy; no false all-app small-bundle claim.

Deployment SUCCESS on6b77cab, Actions41198272282. Live browser Auto/image/canvas PASS; all16assets HTTP200 and live photo hash matches original. Final evidence and cleanup recorded in PROGRESS.md. No backend, credentials, paid service or ongoing dev server is needed by the hosted app.
