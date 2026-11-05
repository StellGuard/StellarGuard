import { describe, expect, it } from "vitest";
import { normalizeOperations } from "../src/index.js";

describe("normalizeOperations", () => {
  it("normalizes known payment fields", () => {
    expect(normalizeOperations([{
      type: "payment",
      destination: "GDEST",
      amount: "2.5",
      asset: { isNative: true },
    }])).toEqual([{
      type: "payment",
      destination: "GDEST",
      amount: "2.5",
      asset: "native",
    }]);
  });

  it("classifies missing operation types as unknown", () => {
    expect(normalizeOperations([{}])[0]?.type).toBe("unknown");
  });
});
