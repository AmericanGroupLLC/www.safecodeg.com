/**
 * Raycast picking — client/src/dimensions/render/pick.ts
 *
 * T-007's interaction criterion: "clicking a rendered object selects it...
 * computed by raycast, not by screen-region guesswork." This is the one
 * raycast call site; `DimensionsStage` wires pointer events to it.
 *
 * Object identity: `render/projector.ts` names every `Object3D` it creates
 * with `instance.name = id` (the `SceneObject.id`). A raycast hit is
 * frequently a *child* mesh of that named group (a loaded GLTF's internal
 * mesh nodes, for instance), so this walks up `.parent` until it finds an
 * ancestor whose name is a currently selectable id.
 */

import * as THREE from "three";

const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

/** Returns the id of the selectable object under `(clientX, clientY)`, or `null` if the ray hits nothing selectable. */
export function pickObjectId(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  camera: THREE.Camera,
  scene: THREE.Scene,
  selectableIds: ReadonlySet<string>,
): string | null {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return null;

  ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
  raycaster.setFromCamera(ndc, camera);
  const hits = raycaster.intersectObjects(scene.children, true);

  for (const hit of hits) {
    let node: THREE.Object3D | null = hit.object;
    while (node) {
      if (node.name && selectableIds.has(node.name)) return node.name;
      node = node.parent;
    }
  }
  return null;
}
