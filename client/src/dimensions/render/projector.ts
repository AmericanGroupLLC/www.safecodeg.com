/**
 * The scene projection — client/src/dimensions/render/projector.ts
 *
 * ARCHITECTURE-DIMENSIONS.md §5.1 / §1 (consequence): this is the ONLY file
 * in the repo permitted to mutate an `Object3D`. It reads `SceneState`
 * (plain JSON) and writes `Object3D` transforms/visibility to match. Nothing
 * here is authoritative — if the process were killed and restarted from the
 * same `SceneState`, the scene would look identical.
 *
 * Object identity: one `Object3D` instance per `SceneObject.id`, created
 * once (cloned from a template keyed by `SceneObject.kind`) and mutated in
 * place on every subsequent sync — never recreated — so three's GPU buffers
 * are not churned every frame.
 */

import * as THREE from "three";
import type { SceneObject, SceneState } from "../state/types";

/** Templates keyed by `SceneObject.kind`. `null` = asset not loaded yet (T-005's loading state) — the object is simply not added to the scene until it resolves. */
export type GeometryRegistry = Readonly<Record<string, THREE.Object3D | null>>;

export function createPrimitiveRegistry(): Record<string, THREE.Object3D> {
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
      color: 0x1c1f33,
      roughness: 0.85,
      metalness: 0.05,
    })
  );

  const crateClosed = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({
      color: 0xb6803f,
      roughness: 0.7,
      metalness: 0.05,
    })
  );

  const crateOpen = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.6, 1),
    new THREE.MeshStandardMaterial({
      color: 0xd4a25a,
      roughness: 0.7,
      metalness: 0.05,
    })
  );

  return { platform, "crate-closed": crateClosed, "crate-open": crateOpen };
}

export interface Projector {
  /** Reconciles the scene's `Object3D` instances against `state.objects`. Pure side effect, idempotent. */
  sync(state: SceneState, registry: GeometryRegistry): void;
  dispose(): void;
}

function applyTransform(object3D: THREE.Object3D, source: SceneObject) {
  object3D.position.set(
    source.position.x,
    source.position.y,
    source.position.z
  );
  object3D.quaternion.set(
    source.rotation.x,
    source.rotation.y,
    source.rotation.z,
    source.rotation.w
  );
  object3D.scale.set(source.scale.x, source.scale.y, source.scale.z);
  object3D.visible = source.visible;
}

export function createProjector(scene: THREE.Scene): Projector {
  const instances = new Map<string, THREE.Object3D>();

  function sync(state: SceneState, registry: GeometryRegistry) {
    const seen = new Set<string>();

    for (const [id, sceneObject] of Object.entries(state.objects)) {
      seen.add(id);
      let instance = instances.get(id);

      if (!instance) {
        const template = registry[sceneObject.kind];
        if (!template) continue; // asset not loaded yet — nothing to project this frame
        instance = template.clone(true);
        instance.name = id;
        scene.add(instance);
        instances.set(id, instance);
      }

      applyTransform(instance, sceneObject);
    }

    // `for...of` over a Map/Set needs `--downlevelIteration` at this
    // project's tsconfig target; `.forEach()` needs neither, so it is used
    // throughout this file instead of changing a shared config file for it.
    instances.forEach((instance, id) => {
      if (seen.has(id)) return;
      scene.remove(instance);
      instances.delete(id);
    });
  }

  function dispose() {
    instances.forEach(instance => {
      scene.remove(instance);
    });
    instances.clear();
  }

  return { sync, dispose };
}
