# Aurora head tracking

A mobile-first, automatically animated 2.5D window into the owner's original aurora photograph. Auto starts on entry; Head tracking is opt-in and processes the front camera locally. Touch is optional.

## Development

Node 22.12+ (24 recommended), `npm ci`, `npm test`, `npm run build`, `npm run dev`.

The Vite base is `/aurora-head-tracking/`. GitHub Actions builds and deploys `dist` to Pages. MediaPipe model and WASM are served from this same origin, not a runtime CDN. Camera capture never uploads or records video; the browser still downloads static application/model assets.

## Scope and limitations

The original `public/aurora.jpg` is the user-supplied Photo 2.jpg. It is intentionally public as part of the expressly requested public site/repository. No stock image substitution or colour edits. The depth map is hand-authored: bounded texture warping, no inpainting or hidden geometry reconstruction. Not 3D Gaussian Splatting. Replace SceneAdapter with a future GaussianSplatScene once multi-view capture is available.

Aim: 60 Hz display animation, DPR capped at 1.5, 5–10 Hz CPU face inference with 640×480 camera request. These are implementation limits, not measured iPhone performance. Face midpoint translation approximates screen-relative movement; a single uncalibrated camera cannot provide accurate metric head position or fully separate rotation from translation.

## iPhone

Open the HTTPS Pages URL in Safari. Auto should move the photo without dragging. Choose Head tracking, allow camera, face the screen to calibrate, then shift your head gently sideways. Reset center recalibrates. Choosing Auto/Touch or leaving the page stops capture; returning stays in Auto. If permission is denied or tracking fails, Auto remains available. Hide controls for an unobstructed scene. Landscape preserves the entire photo with side margins.

## Third-party assets

Three.js MIT; MediaPipe tasks-vision Apache-2.0. Face Landmarker model from Google model repository, pinned float16 version 1. WASM copied from the exact locked tasks-vision npm package. See public/mediapipe/PROVENANCE.md for hashes/source. Original photograph is owner supplied and is not licensed as a reusable stock asset.
