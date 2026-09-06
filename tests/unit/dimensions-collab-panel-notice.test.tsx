/**
 * UNIT TESTS — T-018 rejection, F-4
 * client/src/dimensions/transport/CollabPanel.tsx
 * client/src/dimensions/transport/RemoteControlPanel.tsx
 *
 * Before this fix, `CollabPanel` rendered its "This is a public sandbox…
 * anyone who joins can move the shared object below or reset it" notice
 * UNCONDITIONALLY, in every `TransportStatus` — including `"unconfigured"`
 * (the actual shipped default, since no Supabase anon key exists in this
 * repo), where the join form renders nothing at all (`status.kind ===
 * "unconfigured"` returns `null` for the whole form a few lines down). The
 * notice described controls that were not on the page. `RemoteControlPanel`
 * compounded it: its "not joined" message always read "Join the shared
 * stage above to use remote session control", pointing at a join control
 * that, in the unconfigured build, does not exist.
 *
 * These tests render both components directly (no browser, no Playwright)
 * with a real `TransportStatus` value of each kind and assert the notice
 * and message are gated on whether joining is actually reachable.
 */
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import CollabPanel from "@/dimensions/transport/CollabPanel";
import RemoteControlPanel from "@/dimensions/transport/RemoteControlPanel";
import type { ActorId, TransportStatus } from "@/dimensions/transport/types";

const SELF_ACTOR_ID = "self" as ActorId;

const UNCONFIGURED: TransportStatus = {
  kind: "unconfigured",
  reason: "This build has no shared-session configuration.",
};
const IDLE: TransportStatus = { kind: "idle" };

function noop() {}

describe("CollabPanel — the sandbox notice only describes controls that actually exist", () => {
  it("does not render the sandbox notice when unconfigured (no join control exists to warn about)", () => {
    render(
      <CollabPanel
        status={UNCONFIGURED}
        actors={[]}
        selfActorId={SELF_ACTOR_ID}
        joined={false}
        lastErrorMessage={null}
        opsApplied={0}
        opsRejected={0}
        lastSavedAt={null}
        onJoin={noop}
        onLeave={noop}
        onMoveTarget={noop}
        onResetTarget={noop}
      />
    );
    expect(screen.queryByTestId("collab-sandbox-notice")).toBeNull();
    expect(screen.getByTestId("collab-status").textContent).toMatch(
      /not available in this build/i
    );
    expect(screen.queryByTestId("collab-join")).toBeNull();
  });

  it("renders the sandbox notice once joining is reachable (idle, configured)", () => {
    render(
      <CollabPanel
        status={IDLE}
        actors={[]}
        selfActorId={SELF_ACTOR_ID}
        joined={false}
        lastErrorMessage={null}
        opsApplied={0}
        opsRejected={0}
        lastSavedAt={null}
        onJoin={noop}
        onLeave={noop}
        onMoveTarget={noop}
        onResetTarget={noop}
      />
    );
    const notice = screen.getByTestId("collab-sandbox-notice");
    expect(notice.textContent).toMatch(/public sandbox/i);
    expect(notice.textContent).toMatch(/anyone who joins can move/i);
    expect(screen.getByTestId("collab-join")).toBeTruthy();
  });
});

describe('RemoteControlPanel — the "not joined" message never points at a join control that does not exist', () => {
  it('states the honest unconfigured reason, not "Join the shared stage above", when no join control exists', () => {
    render(
      <RemoteControlPanel
        status={UNCONFIGURED}
        joined={false}
        actors={[]}
        selfActorId={SELF_ACTOR_ID}
        role="none"
        onSetRole={noop}
        lastCommand={null}
        onSendCommand={noop}
        lastReceivedCommand={null}
      />
    );
    const status = screen.getByTestId("remote-control-status");
    expect(status.textContent).toMatch(/not available in this build/i);
    expect(status.textContent).not.toMatch(/join the shared stage above/i);
  });

  it('still says "Join the shared stage above" when configured but simply not yet joined (the join control genuinely IS there)', () => {
    render(
      <RemoteControlPanel
        status={IDLE}
        joined={false}
        actors={[]}
        selfActorId={SELF_ACTOR_ID}
        role="none"
        onSetRole={noop}
        lastCommand={null}
        onSendCommand={noop}
        lastReceivedCommand={null}
      />
    );
    expect(screen.getByTestId("remote-control-status").textContent).toMatch(
      /join the shared stage above/i
    );
  });
});
