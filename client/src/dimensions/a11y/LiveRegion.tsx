/**
 * The live region — client/src/dimensions/a11y/LiveRegion.tsx
 *
 * ARCHITECTURE-DIMENSIONS.md §8.2: one `aria-live="polite"` region
 * announcing state changes a WebGL canvas cannot expose to assistive
 * technology on its own — here, the current lifecycle stage and playback
 * state. Visually hidden; content-only.
 */

export interface LiveRegionProps {
  message: string;
}

export default function LiveRegion({ message }: LiveRegionProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {message}
    </div>
  );
}
