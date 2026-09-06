/**
 * The parallel DOM control tree — client/src/dimensions/a11y/SceneOutline.tsx
 *
 * ARCHITECTURE-DIMENSIONS.md §8.2: a WebGL canvas is opaque to assistive
 * technology, so this is the real interface, not the canvas. Every
 * selectable object is a real `<button>`, with `SceneObject.label` as its
 * accessible name and `aria-pressed` reflecting selection. Selecting here and
 * selecting by raycast write the same `selection` state (T-007's "the
 * parallel DOM control tree" requirement).
 */

export interface SceneOutlineItem {
  id: string;
  label: string;
}

export interface SceneOutlineProps {
  items: readonly SceneOutlineItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function SceneOutline({
  items,
  selectedId,
  onSelect,
}: SceneOutlineProps) {
  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <div
        className="text-[10px] uppercase tracking-widest font-mono mb-2"
        style={{ color: "rgba(167,139,250,0.6)" }}
      >
        Scene objects
      </div>
      <ul
        className="flex flex-wrap gap-2"
        aria-label="Selectable scene objects"
        data-testid="dimensions-scene-outline"
      >
        {items.map(item => {
          const pressed = item.id === selectedId;
          return (
            <li key={item.id}>
              <button
                type="button"
                data-testid="dimensions-outline-item"
                aria-pressed={pressed}
                onClick={() => onSelect(pressed ? null : item.id)}
                className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: pressed
                    ? "rgba(245,158,11,0.2)"
                    : "rgba(255,255,255,0.04)",
                  border: pressed
                    ? "1px solid rgba(245,158,11,0.5)"
                    : "1px solid rgba(255,255,255,0.08)",
                  color: pressed
                    ? "rgba(252,211,77,1)"
                    : "rgba(255,255,255,0.6)",
                }}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
