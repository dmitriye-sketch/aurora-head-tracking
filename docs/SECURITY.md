# Security review — 2026-10-31

Independent reviewer: protected security role (Astra/high). Read-only application review; this report is the only reviewer-authored repository change. QWEN_DECISION: no_suitable_task — camera privacy, dependency trust and final security acceptance require protected judgment.

Reviewed final application commit: `995f42fa4a635fd296c258e6bfbc0719498158be`, including restart-state correction and distribution licenses. Initial scanner baseline: `a3230c9e1ec6239babb3376751ac2fb6d225e6de`. The reviewer manually inspected the correction delta and reran tests; this report does not silently cover future application changes. A subsequent report-only commit may bind this report without changing reviewed application bytes.

## Decision

**PASS — independent security publication gate** for application commit `995f42fa4a635fd296c258e6bfbc0719498158be` under the stated local-camera/static-site threat model. No unresolved confirmed security finding remains. The repeat-start correctness issue was fixed and independently rechecked. Functional/visual acceptance, completed full-model browser smoke, final artifact binding and live deployment checks remain the lead’s separate gates. This decision is not physical-iPhone acceptance or an unconditional claim that third-party code is vulnerability-free.

## Scope and threat model

Reviewed all first-party `src/` modules, HTML/CSS, TypeScript/Vite configuration, package manifest/lockfile, tests, browser smoke script, GitHub Pages workflow, documentation and public asset provenance. The owner explicitly authorized a public repository and public deployment of the original aurora photograph; camera video publication/upload is excluded.

Assets to protect: transient camera frames/landmarks, browser permission choice, repository/deployment integrity and absence of credentials or private metadata in public artifacts. Inputs are browser media frames, library landmark output, local pointer/keyboard/range events and static trusted assets. Visitors cannot choose model URLs, file paths, HTML, shaders or remote requests. Trust boundaries are user-to-browser permission, browser-to-same-origin assets, third-party npm/model/WASM supply chain and GitHub Actions-to-Pages deployment. No backend, account, API, database, payment or uploaded-file feature exists.

## Confirmed findings

- **Low correctness, fixed in 995f42f:** `src/tracking/HeadTracker.ts:60` guards the no-face message with `!lost`, but `stop()` at baseline lines 67–71 does not reset `lost` or `lastSeen`. After a no-face session, a subsequent session without a face retains its loading/calibration message instead of returning the no-face state. This also prevents the second-start browser smoke from reaching its expected status. The fix resets `lost`, `lastSeen` and inference interval. Seven unit tests pass. An independent behavioral stub-detector probe called two no-face sessions separated by stop and confirmed both emit the no-face message. No camera exposure was demonstrated by this defect.
- **Packaging observation, corrected during review:** vendored dependencies initially lacked full distribution license text. `public/licenses/three-MIT.txt` and `public/licenses/mediapipe-Apache-2.0.txt` were added by the lead. Three.js text matches the installed package; MediaPipe text is attributed by the lead to official v0.10.32 upstream LICENSE. No separate NOTICE was present in the installed npm package. This observation is not a security vulnerability or an independent legal certification of model rights.

## Verified controls

- `HeadTracker.ts:24–38`: secure-context/API checks; explicit user-click entry through `AppController.ts:29–32`; `audio:false`; generation checks after every asynchronous setup boundary. A stale permission result stops all acquired tracks; a stale model result is closed.
- `HeadTracker.ts:67–73` and `AppController.ts:20–21,44–46,62`: switching modes, backgrounding, pagehide and disposal stop tracks, clear the video source and close the detector; BFCache return reloads into Auto. Source review covers those paths, with runtime evidence distinguished below.
- `HeadTracker.ts:34–37`: model/WASM paths are build-time same-origin paths, not user-controlled URLs. Frames are passed to the in-browser detector; no first-party recording, frame serialization, upload, analytics, telemetry or persistence path exists. Browser/hosting infrastructure still receives ordinary asset requests; this review does not claim network anonymity or immediate secure erasure of engine memory.
- `AppController.ts:19` uses `textContent` for model/browser error strings. No dynamic HTML, URL-provided content, command execution or database query sink exists in first-party code. Landmark validity and offsets are bounded in `tracking/math.ts`; renderer inputs are finite/clamped in `PhotoDepthScene.ts`.
- Renderer, texture, animation, observer and event lifecycle responsibilities are separate from camera ownership. `main.ts` disposes a scene that finishes initialization after application disposal through `AppController.attach()`.
- `.github/workflows/deploy.yml` uses immutable action commit hashes, `npm ci`, tests, audit and build before uploading only `dist`. Deployment credentials are GitHub-managed scoped Pages/OIDC permissions. It has no pull-request execution or untrusted expression-to-shell interpolation. Writers able to push configured deployment branches remain trusted deployers; repository/environment protection settings require live inspection by the lead.
- `package-lock.json`: exact registry sources and integrity fields for all 100 dependency entries, with no git/HTTP/local dependency source. Declared install scripts are esbuild and optional fsevents; npm audit does not certify their behavior. Direct runtime dependencies are exact versions.
- All six public MediaPipe runtime JS/WASM assets were SHA-256 checked and byte-compared with `node_modules/@mediapipe/tasks-vision/wasm`: identical. Model SHA-256 is `64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff`; declared source is Google's float16 version 1. Local hashes are recorded in `docs/ASSET-HASHES.txt`; a local hash proves identity, not independent publisher authenticity or model safety.
- `public/aurora.jpg`: SHA-256 `79ea3a6d3313b7a5d0cb51aef3213cf7453a10cd591d71d6d1b83dde02e4b479`, 854×1280 JPEG. Pillow inspection of EXIF plus nested EXIF/Photoshop fields found resolution, orientation, color space/dimensions and empty IPTC/digest fields; no GPS, capture timestamp, author or device identity was found in these inspected metadata fields. The pixels are intentionally public owner content.

## Evidence and limitations

| Check | Observed result | Limits |
|---|---|---|
| Gitleaks 8.30.1 directory and full Git history | Both exit 0, empty finding arrays; baseline SHA and clean tree bound in collector manifest | Pattern scan; ignored generated/dependency directories are not a complete binary or provenance audit |
| Semgrep 1.179.0 local baseline | Exit 0, 0 results, 0 errors; listed first-party modules and public runtime JS paths | Baseline rules are narrow; not a complete web security ruleset or binary WASM/model analysis |
| Supplemental web SAST | Three local TS/JS rules, 7 targets, 0 results/errors | Only dynamic HTML/eval/MediaRecorder/WebSocket/beacon patterns; cannot establish absence of all upload paths or malicious dependencies |
| npm audit | `work/audit-final.log`: found 0 vulnerabilities | Known advisory coverage only; OSV was installed but not executed by collector. Its manifest dependency entry remains pending; npm audit is the separate ecosystem evidence |
| Unit tests | Reviewer reran `npm test` on 995f42f: seven pass, including restart-state regression; separate behavioral two-session no-face probe passes | Tests do not establish 80% whole-application coverage; raw V8 collection alone is not a coverage percentage |
| Independent browser cancellation probe | PASS delayed `getUserMedia` completion after Touch selection; PASS delayed completion after synthetic background event; all fake tracks ended and video not attached | Chromium with fake camera and controlled promise, not Safari/iPhone hardware; initial missing default browser cache was resolved using existing pinned Vader browser cache |
| Lead full browser smoke | 12 scenario outcomes PASS, work/browser-results.json; actual same-origin model/WASM with fake camera | Chromium fake camera, not real-face accuracy or physical Safari/iPhone |

Raw collector evidence: `work/security/20261031T113734123515Z/`; supplementary `work/web-rules.yml`, `work/web-sast.json` and `work/web-sast.log`. Collector explicitly reports `NOT_APPROVED` until independent/final acceptance; it is not overridden by merely having zero findings. Excluded generated bundles and opaque WASM/model internals were not exhaustively audited. Manual review checked caller-controlled model/runtime paths and standard Emscripten GET-only loading code, not every third-party instruction. Third-party runtime remains a trust assumption.

## Not applicable / residual concerns

Authentication, authorization, CSRF/session cookies, SQL/command injection, server SSRF, server file traversal, sensitive server logs and endpoint rate limiting are not applicable to this static client without a backend or user-provided resource URLs. Repository credentials and GitHub account security remain outside application code.

No CSP/Permissions-Policy enforcement is configured in source. This is defense-in-depth opportunity, not a demonstrated injection or camera-permission bypass: the app has no untrusted HTML surface and browser camera consent remains enforced. Browser extensions, compromised hosting/dependency publishers, malicious repository maintainers, WebAssembly/browser engine vulnerabilities and physical-device performance are not ruled out by this review. Do not claim camera startup, tracking accuracy, frame rate or thermal behavior has been verified on a physical iPhone.

Final collector rerun on995f42f: work/security/20261031T114120179592Z, Gitleaks tree/history and SAST exit0/no findings; dirty flag reflects untracked reviewer report, no application change. Workflow follow-up limits automatic deployment to main to match the existing GitHub Pages branch-protection policy; protected environment rules were preserved.
