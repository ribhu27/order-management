import { describe, expect, it } from "vitest";
import { computeStatus, STATUS_DURATIONS_MS } from "./status";

describe("computeStatus", () => {
  const createdAt = 1_000_000;

  it("is 'received' immediately after creation", () => {
    expect(computeStatus(createdAt, createdAt)).toBe("received");
  });

  it("is 'received' right up to the preparing threshold", () => {
    const justBefore = createdAt + STATUS_DURATIONS_MS.received - 1;
    expect(computeStatus(createdAt, justBefore)).toBe("received");
  });

  it("advances to 'preparing' once the received window elapses", () => {
    const now = createdAt + STATUS_DURATIONS_MS.received;
    expect(computeStatus(createdAt, now)).toBe("preparing");
  });

  it("advances to 'out_for_delivery' after preparing elapses", () => {
    const now = createdAt + STATUS_DURATIONS_MS.received + STATUS_DURATIONS_MS.preparing;
    expect(computeStatus(createdAt, now)).toBe("out_for_delivery");
  });

  it("advances to 'delivered' after out_for_delivery elapses", () => {
    const now =
      createdAt +
      STATUS_DURATIONS_MS.received +
      STATUS_DURATIONS_MS.preparing +
      STATUS_DURATIONS_MS.out_for_delivery;
    expect(computeStatus(createdAt, now)).toBe("delivered");
  });

  it("stays 'delivered' indefinitely afterwards", () => {
    const farFuture = createdAt + 1_000_000_000;
    expect(computeStatus(createdAt, farFuture)).toBe("delivered");
  });
});
