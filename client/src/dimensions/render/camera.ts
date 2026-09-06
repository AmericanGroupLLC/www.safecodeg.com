/**
 * Camera navigation — client/src/dimensions/render/camera.ts
 *
 * `OrbitControls` gives pointer-drag orbit and wheel-zoom for free. The
 * keyboard path (ARCHITECTURE-DIMENSIONS.md §8.2: "arrows orbit, +/- and
 * PageUp/PageDown dolly, Home resets") is this file's own addition — three's
 * `OrbitControls.listenToKeyEvents()` binds arrows to *panning*, which is
 * not what §8.2 asks for, so it is never called here. Each key handler goes
 * through `OrbitControls`' own public `rotateLeft`/`rotateUp`/`dollyIn`/
 * `dollyOut`/`reset` methods rather than writing `camera.position` directly,
 * so the controls' internal spherical state and the camera never disagree.
 *
 * The key handler is bound to the canvas element, never to `window`
 * (§8.2), so it cannot hijack page scrolling when the canvas is not focused.
 */

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { Vec3 } from "../state/types";

export interface CameraSnapshot {
  position: Vec3;
  target: Vec3;
  distance: number;
}

export interface CameraController {
  controls: OrbitControls;
  getSnapshot(): CameraSnapshot;
  setReducedMotion(reduced: boolean): void;
  dispose(): void;
}

const AZIMUTH_STEP = THREE.MathUtils.degToRad(4);
const POLAR_STEP = THREE.MathUtils.degToRad(3);
const DOLLY_SCALE = 0.85;

export function createCameraController(
  camera: THREE.PerspectiveCamera,
  domElement: HTMLElement,
  options: { reducedMotion: boolean; onChange: () => void },
): CameraController {
  const controls = new OrbitControls(camera, domElement);
  controls.target.set(0.6, 0.4, -0.4); // roughly centered on the pipeline platform, see model/process.ts
  controls.enableDamping = !options.reducedMotion;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = 22;
  controls.maxPolarAngle = Math.PI * 0.49; // stay above the platform
  camera.lookAt(controls.target);
  controls.update();
  controls.saveState(); // so Home / controls.reset() returns here, not three's built-in origin default

  function handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowLeft":
        controls.rotateLeft(AZIMUTH_STEP);
        break;
      case "ArrowRight":
        controls.rotateLeft(-AZIMUTH_STEP);
        break;
      case "ArrowUp":
        controls.rotateUp(-POLAR_STEP);
        break;
      case "ArrowDown":
        controls.rotateUp(POLAR_STEP);
        break;
      case "+":
      case "=":
      case "PageUp":
        controls.dollyIn(DOLLY_SCALE);
        break;
      case "-":
      case "_":
      case "PageDown":
        controls.dollyOut(DOLLY_SCALE);
        break;
      case "Home":
        controls.reset();
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  domElement.addEventListener("keydown", handleKeyDown);
  controls.addEventListener("change", options.onChange);

  function getSnapshot(): CameraSnapshot {
    return {
      position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      target: { x: controls.target.x, y: controls.target.y, z: controls.target.z },
      distance: controls.getDistance(),
    };
  }

  function setReducedMotion(reduced: boolean) {
    controls.enableDamping = !reduced; // §8.1: discrete steps under reduced motion, no easing
  }

  function dispose() {
    domElement.removeEventListener("keydown", handleKeyDown);
    controls.removeEventListener("change", options.onChange);
    controls.dispose();
  }

  return { controls, getSnapshot, setReducedMotion, dispose };
}
