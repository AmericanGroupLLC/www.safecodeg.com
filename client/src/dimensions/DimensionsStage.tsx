/**
 * DimensionsStage — client/src/dimensions/DimensionsStage.tsx
 *
 * THE lazy entry point (ARCHITECTURE-DIMENSIONS.md §9.2). This is the
 * default export `client/src/pages/Dimensions.tsx` reaches through its one
 * `lazy(() => import("@/dimensions/DimensionsStage"))` call. Everything
 * that pulls in `three` — the renderer, the camera, the projector, the
 * store, the model asset — is reachable only from here.
 *
 * Renders the 3D scene (T-005) and the 4D timeline UI (T-006) for the
 * "Product Delivery Pipeline" process defined in `model/process.ts`.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Pause, Play, RotateCcw } from "lucide-react";

import LiveRegion from "./a11y/LiveRegion";
import SceneOutline from "./a11y/SceneOutline";
import LiveDataPanel from "./live/LiveDataPanel";
import { useLiveData } from "./live/useLiveData";
import PhysicsPanel from "./physics/PhysicsPanel";
import { PHYSICS_IMPULSE_DEFAULT } from "./physics/constants";
// `import type` only — erased at build time, so this reference does not pull
// `cannon-es` into this file's chunk. The actual `createPhysicsSandbox` value
// is reached only via the dynamic `import("./physics/sandbox")` below, the
// first time "Run simulation" is clicked (ARCHITECTURE-DIMENSIONS.md §9).
import type { PhysicsSandbox } from "./physics/sandbox";
import { PRODUCT_PIPELINE } from "./model/process";
import { findActiveStage } from "./model/timeline";
import { createCameraController, type CameraController } from "./render/camera";
import { pickObjectId } from "./render/pick";
import { createProjector } from "./render/projector";
import { createRendererBundle } from "./render/Renderer";
import { startRenderLoop, type RenderLoopHandle } from "./render/loop";
import {
  createDimensionsStore,
  usePlaying,
  useStoreValue,
} from "./state/store";
import { installTestHook } from "./state/testHook";
import type { ObjectId } from "./state/types";
import { probeXR, resolveXrUiState, type XrCapability } from "./xr/detect";
import {
  requestXRSession,
  type XRSessionHandle,
  type XrSessionMode,
  type XrSessionPhase,
} from "./xr/session";
import XRPanel from "./xr/XRPanel";
import CollabPanel from "./transport/CollabPanel";
import RemoteControlPanel from "./transport/RemoteControlPanel";
import {
  CONTROL_TARGET_ID,
  useCollaboration,
} from "./transport/useCollaboration";
import { composeScene } from "./state/compose";

/** Runtime path to a real, built `.usdz` asset (§7.4) — see client/public/models/astronaut.LICENSE.txt for provenance. */
const AR_QUICKLOOK_MODEL_HREF = "/models/astronaut.usdz";

export interface DimensionsStageProps {
  prefersReducedMotion: boolean;
}

type ModelStatus = "loading" | "ready" | "error";

const srOnlyStyle: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

function createPrimitiveTemplates(): Record<string, THREE.Object3D> {
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
  // 5D physics sandbox ball — geometry radius 1, scaled per-instance to
  // PHYSICS_BALL_RADIUS by state/compose.ts's `PHYSICS_BODY_SCALE`. Bright
  // amber so it reads clearly as the physics object, distinct from the
  // pipeline's set dressing.
  const physicsBall = new THREE.Mesh(
    new THREE.SphereGeometry(1, 24, 16),
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.35,
      metalness: 0.15,
      emissive: 0x7a4a05,
      emissiveIntensity: 0.3,
    })
  );
  return {
    platform,
    "crate-closed": crateClosed,
    "crate-open": crateOpen,
    "physics-ball": physicsBall,
  };
}

export default function DimensionsStage({
  prefersReducedMotion,
}: DimensionsStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraControllerRef = useRef<CameraController | null>(null);
  const loopRef = useRef<RenderLoopHandle | null>(null);

  const storeRef = useRef<ReturnType<typeof createDimensionsStore> | null>(
    null
  );
  if (!storeRef.current) {
    storeRef.current = createDimensionsStore(PRODUCT_PIPELINE);
  }
  const store = storeRef.current;

  // 6D — the collaboration wiring hook (`transport/useCollaboration.ts`).
  // Constructs `createTransport()` once, eagerly (cheap, synchronous, no
  // network — §6.2), but never calls `.join()` on mount (§6.3): that only
  // happens from `CollabPanel`'s "Join the shared stage" button, below.
  const collab = useCollaboration(store);

  const registryRef = useRef<Record<string, THREE.Object3D | null> | null>(
    null
  );
  if (!registryRef.current) {
    registryRef.current = { ...createPrimitiveTemplates(), toycar: null };
  }

  // 5D interaction — populated in the mount effect below, read by the
  // pointerdown/pointerup raycast handler installed in that same effect.
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // 5D physics — `null` until the first "Run simulation" click resolves the
  // dynamic `import("./physics/sandbox")`. This is the ONE reference to the
  // lazily-loaded sandbox instance; nothing else in this file imports
  // `cannon-es` at the value level (ARCHITECTURE-DIMENSIONS.md §9).
  const physicsRef = useRef<PhysicsSandbox | null>(null);
  const [physicsLoading, setPhysicsLoading] = useState(false);
  // True from the first "Run simulation" click until "Reset" — this, not the
  // sandbox's own moment-to-moment `isRunning()`, is what disables the 4D
  // scrubber (§2.4: physics is forward-only and never wired to the scrubber).
  const [physicsEngaged, setPhysicsEngaged] = useState(false);
  // Cosmetic only, polled at low frequency (not per animation frame — see the
  // effect below) so the status text doesn't lag far behind the sandbox
  // auto-pausing itself once the ball settles.
  const [physicsRunningUi, setPhysicsRunningUi] = useState(false);
  const [impulse, setImpulse] = useState(PHYSICS_IMPULSE_DEFAULT);

  // 7D — WebXR capability + session lifecycle (ARCHITECTURE-DIMENSIONS.md
  // §7, D-7D-DETECT). `xrCapability` is the once-per-mount async probe
  // result (§7.1's four steps); `xrSessionPhase`/`xrActiveMode`/
  // `xrRejectReason` are the transient session-lifecycle layer §7.2 stacks
  // on top of it via `resolveXrUiState`. `rendererRef` and `xrSessionRef`
  // are refs (not state) because the renderer instance and the live
  // `XRSession` handle are not themselves rendered — only their effect on
  // the state above is.
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const xrSessionRef = useRef<XRSessionHandle | null>(null);
  const [xrCapability, setXrCapability] = useState<XrCapability | null>(null);
  const [xrSessionPhase, setXrSessionPhase] = useState<XrSessionPhase>("idle");
  const [xrRejectReason, setXrRejectReason] = useState<string | null>(null);
  const [xrActiveMode, setXrActiveMode] = useState<XrSessionMode | null>(null);
  // Mirrors the four pieces above into one ref, read by the test hook
  // (installed once, in the mount effect) so it always reflects the
  // current XR state rather than the one captured at install time — same
  // pattern as `liveDataRef` below.
  const xrSnapshotInputsRef = useRef({
    capability: xrCapability,
    sessionPhase: xrSessionPhase,
    activeMode: xrActiveMode,
  });
  useEffect(() => {
    xrSnapshotInputsRef.current = {
      capability: xrCapability,
      sessionPhase: xrSessionPhase,
      activeMode: xrActiveMode,
    };
  }, [xrCapability, xrSessionPhase, xrActiveMode]);

  const [modelStatus, setModelStatus] = useState<ModelStatus>("loading");
  const [modelError, setModelError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const t = useStoreValue(store, s => s.t);
  const stages = useStoreValue(store, s => s.stages);
  const objects = useStoreValue(store, s => s.objects);
  const selection = useStoreValue(store, s => s.selection);
  const playing = usePlaying(store);
  const activeStage = findActiveStage(PRODUCT_PIPELINE, t);

  const liveData = useLiveData();
  // Mirrors `liveData` into a ref so the test hook (installed once, in the
  // mount effect) always reads the current fetch state rather than the one
  // captured at install time.
  const liveDataRef = useRef(liveData);
  useEffect(() => {
    liveDataRef.current = liveData;
  }, [liveData]);

  // 6D — same pattern: the mount-once effect below installs the test hook
  // once, so it reads `collab`'s current values through this ref rather
  // than the ones captured at install time.
  const collabRef = useRef(collab);
  useEffect(() => {
    collabRef.current = collab;
  });

  const prevStageIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (activeStage && activeStage.id !== prevStageIdRef.current) {
      prevStageIdRef.current = activeStage.id;
      setAnnouncement(`Stage: ${activeStage.label}`);
    }
  }, [activeStage]);

  useEffect(() => {
    setAnnouncement(playing ? "Playing" : "Paused");
  }, [playing]);

  useEffect(() => {
    if (selection === null) return;
    const label = objects[selection]?.label ?? selection;
    setAnnouncement(`Selected: ${label}`);
  }, [selection, objects]);

  // 6D — §8.2's `a11y/LiveRegion.tsx` also announces transport status
  // changes. `prevTransportStatusRef` skips the very first render (the
  // initial "idle"/"unconfigured" state is already shown as on-screen text
  // by `CollabPanel`; only a genuine transition is announced here).
  const prevTransportStatusRef = useRef<string | null>(null);
  useEffect(() => {
    const kind = collab.status.kind;
    if (prevTransportStatusRef.current === null) {
      prevTransportStatusRef.current = kind;
      return;
    }
    if (prevTransportStatusRef.current === kind) return;
    prevTransportStatusRef.current = kind;
    if (kind === "connected") setAnnouncement("Joined the shared stage.");
    else if (kind === "disconnected")
      setAnnouncement("Disconnected from the shared stage.");
    else if (kind === "reconnecting")
      setAnnouncement("Reconnecting to the shared stage.");
  }, [collab.status]);

  // 7D — the capability probe (§7.1's four steps) runs once per mount. It is
  // never re-run on a timer and never assumed to have resolved — `xrCapability`
  // stays `null`, and `XRPanel` renders a "checking" status, until it does.
  useEffect(() => {
    let cancelled = false;
    probeXR().then(capability => {
      if (!cancelled) setXrCapability(capability);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Cosmetic status-text sync for the physics panel, polled every 300ms
  // rather than per animation frame — the sandbox can auto-pause itself
  // between polls (§8.1's invalidation-driven loop; see physics/sandbox.ts),
  // and this keeps the "Running"/"Resting" text from drifting far from that
  // without re-rendering this component 60 times a second.
  useEffect(() => {
    if (!physicsEngaged) return;
    const interval = window.setInterval(() => {
      const running = physicsRef.current?.isRunning() ?? false;
      setPhysicsRunningUi(current => (current === running ? current : running));
    }, 300);
    return () => window.clearInterval(interval);
  }, [physicsEngaged]);

  // Mount-once: renderer, camera, render loop, model fetch, test hook.
  // Intentionally an empty dependency array — every dependency below
  // (canvas, store, registry) is a ref and is stable for the component's
  // lifetime; recreating the renderer on a prop change is not wanted here.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const canvasMaybeNull = canvasRef.current;
    if (!canvasMaybeNull) return;
    // Rebound to a non-nullable const: the nested `handlePointerUp` function
    // declaration below is hoisted, so TypeScript won't carry the `if
    // (!canvasMaybeNull) return;` narrowing from this outer scope into it.
    const canvas: HTMLCanvasElement = canvasMaybeNull;

    const {
      renderer,
      scene,
      camera,
      dispose: disposeRenderer,
    } = createRendererBundle(canvas, {
      onContextLost: () => {
        setModelStatus("error");
        setModelError("The WebGL context was lost.");
      },
      onContextRestored: () => {
        setModelStatus(current => (current === "error" ? "ready" : current));
        setModelError(null);
      },
    });
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const cameraController = createCameraController(camera, canvas, {
      reducedMotion: prefersReducedMotion,
      onChange: () => loopRef.current?.invalidate(),
    });
    cameraControllerRef.current = cameraController;

    const projector = createProjector(scene);

    const loop = startRenderLoop(
      renderer,
      scene,
      camera,
      timestampMs => {
        store.tick(timestampMs);

        // 5D physics — stepped only while the sandbox exists. `wasRunning`
        // (checked before `step()`) covers the exact frame the sandbox
        // auto-pauses on: `step()` may flip `isRunning()` to false internally
        // (physics/sandbox.ts's rest detection) partway through this call, and
        // that settled snapshot still needs one final commit so the ball's
        // resting state actually reaches the store. Once both are false, no
        // more commits happen and the render loop settles on its own (§8.1) —
        // exactly like 4D playback already behaves once paused.
        const physics = physicsRef.current;
        if (physics) {
          const wasRunning = physics.isRunning();
          physics.step();
          if (wasRunning || physics.isRunning()) {
            store.setPhysicsSnapshot(physics.getSnapshot());
          }
        }

        cameraController.controls.update();
        projector.sync(store.getSnapshot(), registryRef.current!);
      },
      () => testHookHandle.setReady(true)
    );
    loopRef.current = loop;

    const testHookHandle = installTestHook({
      getState: () => store.getSnapshot(),
      getRenderStats: () => loop.getStats(),
      getCamera: () => cameraController.getSnapshot(),
      getPhysics: () => physicsRef.current?.getSnapshot() ?? null,
      getLiveData: () => {
        const current = liveDataRef.current;
        return {
          source: current.source,
          status: current.status,
          fetchedAt: current.fetchedAt,
          value: current.value,
          error: current.error,
        };
      },
      getTransport: () => {
        const current = collabRef.current;
        return {
          status: current.status,
          actorCount: current.actors.length,
          actors: current.actors.map(a => a.actorId),
          opsApplied: current.opsApplied,
          opsRejected: current.opsRejected,
        };
      },
      getXR: () => {
        const { capability, sessionPhase, activeMode } =
          xrSnapshotInputsRef.current;
        if (!capability) return null;
        return {
          state: resolveXrUiState(capability.state, sessionPhase),
          supported: capability.supported,
          sessionMode: activeMode,
          xrFrames: loop.getXrFrameCount(),
        };
      },
    });

    const unsubscribe = store.subscribe(() => loop.invalidate());

    // 5D interaction — raycast picking (render/pick.ts). A pointerdown+up
    // pair with little movement between them is treated as a click; a
    // larger movement is an orbit drag and must not change selection.
    // Bound to `canvas`, not `window` (mirrors the keyboard camera handler
    // in render/camera.ts), and does not call preventDefault/stopPropagation
    // so OrbitControls' own listeners on the same element are unaffected.
    let pointerDownAt: { x: number; y: number } | null = null;
    const CLICK_MOVE_THRESHOLD_PX = 6;

    function handlePointerDown(event: PointerEvent) {
      pointerDownAt = { x: event.clientX, y: event.clientY };
    }

    function handlePointerUp(event: PointerEvent) {
      const start = pointerDownAt;
      pointerDownAt = null;
      if (!start) return;
      const moved = Math.hypot(
        event.clientX - start.x,
        event.clientY - start.y
      );
      if (moved > CLICK_MOVE_THRESHOLD_PX) return; // an orbit drag, not a click

      const activeScene = sceneRef.current;
      const activeCamera = cameraRef.current;
      if (!activeScene || !activeCamera) return;

      const currentObjects = store.getSnapshot().objects;
      const selectableIds = new Set(
        Object.entries(currentObjects)
          .filter(([, object]) => object.visible)
          .map(([id]) => id)
      );
      const hitId = pickObjectId(
        event.clientX,
        event.clientY,
        canvas,
        activeCamera,
        activeScene,
        selectableIds
      );
      store.select(hitId as ObjectId | null);
    }

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);

    // The 3D model asset is a runtime fetch, not a bundled import (§5.7) —
    // this is what makes T-005's "stub the request to a 500" test possible.
    let disposed = false;
    const gltfLoader = new GLTFLoader();
    setModelStatus("loading");
    gltfLoader.load(
      "/models/toycar.glb",
      gltf => {
        if (disposed) return;
        registryRef.current!.toycar = gltf.scene;
        setModelStatus("ready");
        loop.invalidate();
      },
      undefined,
      error => {
        if (disposed) return;
        const message =
          error instanceof Error
            ? error.message
            : "The 3D model could not be loaded.";
        setModelStatus("error");
        setModelError(message);
      }
    );

    return () => {
      disposed = true;
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      unsubscribe();
      testHookHandle.uninstall();
      loop.dispose();
      projector.dispose();
      cameraController.dispose();
      physicsRef.current?.dispose();
      // A live XRSession is not tied to this canvas's own lifetime the way
      // the renderer/controls are — ending it here (rather than leaving it
      // to the browser) is what keeps navigating away from /dimensions from
      // leaving a headset stuck presenting a page that no longer exists.
      void xrSessionRef.current?.end();
      disposeRenderer();
      sceneRef.current = null;
      cameraRef.current = null;
      cameraControllerRef.current = null;
      rendererRef.current = null;
      loopRef.current = null;
    };
  }, []);

  // Reduced-motion can change after mount (the media query is live) without
  // requiring the whole renderer to be torn down and rebuilt.
  useEffect(() => {
    cameraControllerRef.current?.setReducedMotion(prefersReducedMotion);
  }, [prefersReducedMotion]);

  // 5D physics controls. "Run simulation" is the explicit user action that
  // fires the one dynamic `import("./physics/sandbox")` for this whole page
  // (never on mount — §8.1 requires the sandbox not auto-start, and this is
  // also what keeps `cannon-es` out of every other route's chunk graph).
  const handleRunPhysics = useCallback(async () => {
    if (!physicsRef.current) {
      setPhysicsLoading(true);
      const { createPhysicsSandbox } = await import("./physics/sandbox");
      physicsRef.current = createPhysicsSandbox();
      setPhysicsLoading(false);
    }
    physicsRef.current.start();
    store.setPhysicsSnapshot(physicsRef.current.getSnapshot());
    setPhysicsEngaged(true);
    setPhysicsRunningUi(true);
    loopRef.current?.invalidate();
  }, [store]);

  const handleResetPhysics = useCallback(() => {
    if (!physicsRef.current) return;
    physicsRef.current.reset();
    store.setPhysicsSnapshot(physicsRef.current.getSnapshot());
    setPhysicsEngaged(false);
    setPhysicsRunningUi(false);
    loopRef.current?.invalidate();
  }, [store]);

  const handleApplyImpulse = useCallback(() => {
    const physics = physicsRef.current;
    if (!physics) return;
    physics.applyImpulse(impulse);
    physics.start(); // wakes the sandbox if it had auto-rested (physics/sandbox.ts)
    store.setPhysicsSnapshot(physics.getSnapshot());
    setPhysicsRunningUi(true);
    loopRef.current?.invalidate();
  }, [impulse, store]);

  // 6D — T-016 S-9: the sandbox notice states plainly that "anyone who
  // joins can move the shared object below or reset it"; this is what
  // makes "reset it" a real, exercised control rather than only a
  // true-but-invisible property of the RLS policy. The baseline is
  // recomputed with `remote: {}` — i.e. "what this object would show with
  // no 6D override applied" — rather than a hand-maintained constant, so it
  // can never drift from what `model/process.ts` + the 4D timeline
  // actually author for this object at the current `t`.
  const handleResetStage = useCallback(async () => {
    const baseline = composeScene({
      model: PRODUCT_PIPELINE,
      t: store.getSnapshot().t,
      physics: null,
      selection: null,
      actors: {},
    });
    const baselineObject = baseline.objects[CONTROL_TARGET_ID as string];
    if (!baselineObject) return;
    await collab.resetTarget(baselineObject.position);
  }, [store, collab]);

  // 7D session controls. "Enter AR"/"Enter VR" are the explicit user actions
  // §7.3/§6.3-equivalent honesty rule requires — never requested on mount.
  // A rejection (permission declined, no headset connected mid-attempt,
  // etc.) is read from the browser's own error and mapped to
  // `session-rejected` (§7.2) rather than swallowed or generalised.
  const handleEnterXR = useCallback(async (mode: XrSessionMode) => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    setXrSessionPhase("requesting");
    setXrActiveMode(mode);
    setXrRejectReason(null);
    try {
      const handle = await requestXRSession(renderer, mode, {
        onEnd: () => {
          xrSessionRef.current = null;
          setXrSessionPhase("idle");
          setXrActiveMode(null);
          setAnnouncement("Immersive session ended.");
          loopRef.current?.invalidate();
        },
      });
      xrSessionRef.current = handle;
      setXrSessionPhase("running");
      setAnnouncement(
        `Immersive ${mode === "immersive-vr" ? "VR" : "AR"} session started.`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "The request was declined.";
      setXrRejectReason(message);
      setXrSessionPhase("rejected");
      setAnnouncement(`Immersive session did not start: ${message}`);
    }
  }, []);

  const handleExitXR = useCallback(() => {
    void xrSessionRef.current?.end();
  }, []);

  const selectableSceneItems = Object.entries(objects)
    .filter(([, object]) => object.visible)
    .map(([id, object]) => ({ id, label: object.label }));

  const sceneSummary =
    modelStatus === "error"
      ? `3D scene unavailable: ${modelError}`
      : `Interactive 3D scene: ${PRODUCT_PIPELINE.label}. Currently at stage "${activeStage?.label ?? "—"}", ${t.toFixed(2)} of ${PRODUCT_PIPELINE.duration} seconds.`;

  return (
    <div className="relative">
      <LiveRegion message={announcement} />

      <div
        style={{
          position: "relative",
          height: "min(70vh, 640px)",
          minHeight: 420,
          background: "#05060f",
        }}
      >
        <canvas
          ref={canvasRef}
          tabIndex={0}
          role="img"
          aria-label={`3D scene: ${PRODUCT_PIPELINE.label}`}
          aria-describedby="dimensions-scene-summary"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            outline: focused ? "3px solid #F59E0B" : "none",
            outlineOffset: -3,
          }}
        />
        <p id="dimensions-scene-summary" style={srOnlyStyle}>
          {sceneSummary}
        </p>

        {modelStatus === "loading" && (
          <div
            role="status"
            className="absolute bottom-3 left-3 text-xs font-mono px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(5,6,15,0.85)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "rgba(196,181,253,0.9)",
            }}
          >
            Loading the 3D model…
          </div>
        )}
        {modelStatus === "error" && (
          <div
            role="alert"
            data-testid="dimensions-model-error"
            className="absolute inset-x-3 bottom-3 text-sm px-4 py-3 rounded-xl"
            style={{
              background: "rgba(127,29,29,0.35)",
              border: "1px solid rgba(248,113,113,0.4)",
              color: "#FCA5A5",
            }}
          >
            The 3D model failed to load: {modelError}
          </div>
        )}
      </div>

      {/* ── 5D interaction: the parallel DOM control tree ───────────────── */}
      <div className="p-5 sm:p-6 pb-0">
        <SceneOutline
          items={selectableSceneItems}
          selectedId={selection}
          onSelect={id => store.select(id as ObjectId | null)}
        />
        <p
          className="text-xs"
          data-testid="dimensions-selection"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {selection
            ? `Selected: ${objects[selection]?.label ?? selection}`
            : "Nothing selected — click an object above or in the 3D scene."}
        </p>
      </div>

      {/* ── Timeline controls (4D) ─────────────────────────────────────── */}
      <div
        className="p-5 sm:p-6"
        style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}
      >
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div>
            <div
              className="text-[10px] uppercase tracking-widest font-mono mb-1"
              style={{ color: "rgba(167,139,250,0.6)" }}
            >
              Process simulation
            </div>
            <h2
              className="font-bold text-white text-lg"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              {PRODUCT_PIPELINE.label}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => (playing ? store.pause() : store.play())}
              aria-label={playing ? "Pause simulation" : "Play simulation"}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
              }}
            >
              {playing ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => {
                cameraControllerRef.current?.controls.reset();
                loopRef.current?.invalidate();
              }}
              aria-label="Reset camera to its starting position"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(124,58,237,0.25)",
              }}
            >
              <RotateCcw className="w-4 h-4" /> Reset camera
            </button>
          </div>
        </div>

        <label
          htmlFor="dimensions-scrubber"
          className="sr-only"
          style={srOnlyStyle}
        >
          Simulation time, in seconds
        </label>
        <input
          id="dimensions-scrubber"
          type="range"
          min={0}
          max={PRODUCT_PIPELINE.duration}
          step={1 / 100 /* TEMPORARY BREAK FOR FAIL-BEFORE/PASS-AFTER PROOF */}
          value={t}
          disabled={physicsEngaged}
          aria-disabled={physicsEngaged}
          onChange={event => store.setT(Number(event.target.value))}
          className="w-full mb-3 disabled:opacity-40"
          aria-valuetext={`${t.toFixed(2)} seconds, stage ${activeStage?.label ?? "—"}`}
        />

        {physicsEngaged && (
          <p
            data-testid="dimensions-physics-timeline-note"
            className="text-xs mb-3"
            style={{ color: "rgba(252,211,77,0.85)" }}
          >
            Timeline disabled: the physics sandbox below runs forward only and
            can&apos;t be scrubbed. Use its Reset control to re-enable time
            scrubbing.
          </p>
        )}

        <div
          className="flex items-center justify-between text-xs mb-4"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <span data-testid="dimensions-time" className="font-mono">
            {t.toFixed(2)}s / {PRODUCT_PIPELINE.duration.toFixed(2)}s
          </span>
        </div>

        <ol className="flex flex-wrap gap-2" aria-label="Pipeline stages">
          {stages.map(stage => {
            const isActive = stage.id === activeStage?.id;
            return (
              <li key={stage.id}>
                <button
                  type="button"
                  data-testid="dimensions-stage-label"
                  aria-current={isActive ? "step" : undefined}
                  onClick={() => store.setT(stage.startsAt)}
                  className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: isActive
                      ? "rgba(124,58,237,0.25)"
                      : "rgba(255,255,255,0.04)",
                    border: isActive
                      ? "1px solid rgba(124,58,237,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                    color: isActive
                      ? "rgba(196,181,253,1)"
                      : "rgba(255,255,255,0.6)",
                  }}
                >
                  {stage.label}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ── 5D: physics and live data ────────────────────────────────────── */}
      <div
        className="p-5 sm:p-6"
        style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}
      >
        <PhysicsPanel
          loading={physicsLoading}
          running={physicsRunningUi}
          engaged={physicsEngaged}
          impulse={impulse}
          onImpulseChange={setImpulse}
          onRun={handleRunPhysics}
          onReset={handleResetPhysics}
          onApplyImpulse={handleApplyImpulse}
        />
        <LiveDataPanel
          status={liveData.status}
          value={liveData.value}
          error={liveData.error}
          source={liveData.source}
          fetchedAt={liveData.fetchedAt}
          refresh={liveData.refresh}
        />
      </div>

      {/* ── 6D: multi-user collaboration, digital twin, remote session control ── */}
      <div
        className="p-5 sm:p-6 space-y-6"
        style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}
      >
        <CollabPanel
          status={collab.status}
          actors={collab.actors}
          selfActorId={collab.selfActorId}
          joined={collab.joined}
          lastErrorMessage={collab.lastErrorMessage}
          opsApplied={collab.opsApplied}
          opsRejected={collab.opsRejected}
          lastSavedAt={collab.lastSavedAt}
          onJoin={collab.join}
          onLeave={collab.leave}
          onMoveTarget={collab.moveTarget}
          onResetTarget={handleResetStage}
        />
        <RemoteControlPanel
          status={collab.status}
          joined={collab.joined}
          actors={collab.actors}
          selfActorId={collab.selfActorId}
          role={collab.remoteControlRole}
          onSetRole={collab.setRemoteControlRole}
          lastCommand={collab.lastCommand}
          onSendCommand={collab.sendRemoteCommand}
          lastReceivedCommand={collab.lastReceivedCommand}
        />
      </div>

      {/* ── 7D: WebXR, honestly degraded ─────────────────────────────────── */}
      <div
        className="p-5 sm:p-6"
        style={{ borderTop: "1px solid rgba(124,58,237,0.15)" }}
      >
        <XRPanel
          capability={xrCapability}
          sessionPhase={xrSessionPhase}
          rejectReason={xrRejectReason}
          activeMode={xrActiveMode}
          quickLookHref={AR_QUICKLOOK_MODEL_HREF}
          onEnter={handleEnterXR}
          onExit={handleExitXR}
        />
      </div>
    </div>
  );
}
