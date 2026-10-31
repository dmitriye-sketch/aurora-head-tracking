import * as THREE from 'three';
import { authoredDepth } from './depth';
import type { SceneAdapter, ViewOffset } from './SceneAdapter';

const DEPTH_WIDTH = 256;
const DEPTH_HEIGHT = 384;
const IMAGE_ASPECT = 854 / 1280;

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D photo;
  uniform sampler2D depthMap;
  uniform vec2 viewport;
  uniform vec2 viewOffset;
  uniform float intensity;
  varying vec2 vUv;
  void main() {
    float viewportAspect = viewport.x / viewport.y;
    vec2 scale = viewportAspect > ${IMAGE_ASPECT.toFixed(8)}
      ? vec2(${IMAGE_ASPECT.toFixed(8)} / viewportAspect, 1.0)
      : vec2(1.0, viewportAspect / ${IMAGE_ASPECT.toFixed(8)});
    vec2 imageUv = (vUv - 0.5) / scale + 0.5;
    if (any(lessThan(imageUv, vec2(0.0))) || any(greaterThan(imageUv, vec2(1.0)))) {
      gl_FragColor = vec4(0.015, 0.019, 0.025, 1.0);
    } else {
      float depth = texture2D(depthMap, imageUv).r;
      vec2 warpedUv = clamp(imageUv + viewOffset * intensity * depth * 0.012, vec2(0.001), vec2(0.999));
      gl_FragColor = texture2D(photo, warpedUv);
    }
    #include <colorspace_fragment>
  }
`;

function makeDepthTexture(): THREE.DataTexture {
  const data = new Uint8Array(DEPTH_WIDTH * DEPTH_HEIGHT * 4);
  for (let row = 0; row < DEPTH_HEIGHT; row++) {
    for (let column = 0; column < DEPTH_WIDTH; column++) {
      const value = Math.round(authoredDepth(column / (DEPTH_WIDTH - 1), 1 - row / (DEPTH_HEIGHT - 1)) * 255);
      const index = (row * DEPTH_WIDTH + column) * 4;
      data[index] = data[index + 1] = data[index + 2] = value;
      data[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, DEPTH_WIDTH, DEPTH_HEIGHT, THREE.RGBAFormat);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function clampFinite(value: number, min: number, max: number): number {
  return Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : 0;
}

export class PhotoDepthScene implements SceneAdapter {
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private readonly geometry = new THREE.PlaneGeometry(2, 2);
  private readonly depthTexture = makeDepthTexture();
  private readonly material: THREE.ShaderMaterial;
  private disposed = false;

  private constructor(
    private readonly container: HTMLElement,
    private readonly renderer: THREE.WebGLRenderer,
    private readonly photoTexture: THREE.Texture,
  ) {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        photo: { value: photoTexture },
        depthMap: { value: this.depthTexture },
        viewport: { value: new THREE.Vector2(1, 1) },
        viewOffset: { value: new THREE.Vector2() },
        intensity: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    this.scene.add(new THREE.Mesh(this.geometry, this.material));
    container.appendChild(renderer.domElement);
    this.resize(container.clientWidth, container.clientHeight);
  }

  static async create(container: HTMLElement, imageUrl: string): Promise<PhotoDepthScene> {
    // WebGLRenderer throws if a context cannot be created; propagate it so the
    // caller can show the original image instead.
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    try {
      const texture = await new THREE.TextureLoader().loadAsync(imageUrl);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      try {
        return new PhotoDepthScene(container, renderer, texture);
      } catch (error) {
        texture.dispose();
        throw error;
      }
    } catch (error) {
      renderer.dispose();
      renderer.domElement.remove();
      throw error;
    }
  }

  setView(offset: ViewOffset, intensity: number): void {
    this.material.uniforms.viewOffset.value.set(clampFinite(offset.x, -1, 1), clampFinite(offset.y, -1, 1));
    this.material.uniforms.intensity.value = clampFinite(intensity, 0, 1);
  }

  resize(width: number, height: number): void {
    const safeWidth = Number.isFinite(width) ? Math.max(1, width) : 1;
    const safeHeight = Number.isFinite(height) ? Math.max(1, height) : 1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(safeWidth, safeHeight, false);
    this.renderer.domElement.style.width = `${safeWidth}px`;
    this.renderer.domElement.style.height = `${safeHeight}px`;
    this.material.uniforms.viewport.value.set(safeWidth, safeHeight);
  }

  render(): void {
    if (!this.disposed) this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.scene.clear();
    this.geometry.dispose();
    this.material.dispose();
    this.depthTexture.dispose();
    this.photoTexture.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
