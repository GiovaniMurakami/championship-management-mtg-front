import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRequestSequence } from "../hooks/useRequestSequence";

describe("useRequestSequence", () => {
  it("marca apenas a ultima requisicao como atual", () => {
    const { result } = renderHook(() => useRequestSequence());

    let first;
    let second;
    act(() => {
      first = result.current();
      second = result.current();
    });

    expect(first.isCurrent()).toBe(false);
    expect(second.isCurrent()).toBe(true);
  });
});
