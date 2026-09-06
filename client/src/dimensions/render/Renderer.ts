/**
 * WebGLRenderer lifecycle — client/src/dimensions/render/Renderer.ts
 *
 * Owns the `WebGLRenderer`, `Scene` and `PerspectiveCamera`. Per
 * ARCHITECTURE-DIMENSIONS.md §1 (D-3D-RUNTIME), this is raw `three`, not
 * `@react-three/fiber` — this file is the one place that owns the
 * `requestAnimationFrame`/XR loop, via `renderer.setAnimationLoop` (§7.3).
 */

import * as THREE from "three";

export interface RendererBundle {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  dispose(): void;
}

export interface RendererCallbacks {
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export function createRendererBundle(
  canvas: HTMLCanvasElement,
  callbacks: RendererCallbacks = {}
): RendererBundle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05060f); // matches the site's obsidian background (index.css)

  const width = Math.max(canvas.clientWidth, 1);
  const height = Math.max(canvas.clientHeight, 1);
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(6, 4.5, 8);
  renderer.setSize(width, height, false);

  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  const key = new THREE.DirectionalLight(0xffffff, 1.2);
  key.position.set(5, 8, 4);
  scene.add(ambient, key);

  function handleResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  const resizeObserver = new ResizeObserver(handleResize);
  resizeObserver.observe(canvas);

  function onContextLost(event: Event) {
    event.preventDefault();
    callbacks.onContextLost?.();
  }
  function onContextRestored() {
    callbacks.onContextRestored?.();
  }
  canvas.addEventListener("webglcontextlost", onContextLost, false);
  canvas.addEventListener("webglcontextrestored", onContextRestored, false);

  function dispose() {
    resizeObserver.disconnect();
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    renderer.setAnimationLoop(null);
    renderer.dispose();
  }

  return { renderer, scene, camera, dispose };
}
