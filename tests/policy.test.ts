import { describe, expect, it } from "vitest";
import { decimalToStroops, inspectTransaction } from "../src/index.js";
import type { GuardPolicy, GuardTransaction } from "../src/index.js";

const policy: GuardPolicy = {
  allowedNetworks: ["Test SDF Network ; September 2015"],
  allowedOperationTypes: ["payment"],
  allowedDestinations: ["GTRUSTED"],
  allowedAssets: ["native"],
  maxPaymentAmount: "100",
};

const transaction: GuardTransaction = {
  network: "Test SDF Network ; September 2015",
  operations: [{ type: "payment", destination: "GTRUSTED", asset: "native", amount: "25.5" }],
};

describe("StellarGuard policy evaluation", () => {
  it("allows a transaction that satisfies every configured rule", () => {
    expect(inspectTransaction(transaction, policy).allowed).toBe(true);
  });

  it("blocks a disallowed destination", () => {
    const result = inspectTransaction({
      ...transaction,
      operations: [{ ...transaction.operations[0]!, destination: "GUNTRUSTED" }],
    }, policy);
    expect(result.allowed).toBe(false);
    expect(result.findings[0]?.code).toBe("DESTINATION_NOT_ALLOWED");
  });

  it("blocks a payment above the configured limit", () => {
    const result = inspectTransaction({
      ...transaction,
      operations: [{ ...transaction.operations[0]!, amount: "100.0000001" }],
    }, policy);
    expect(result.findings.some((finding) => finding.code === "PAYMENT_LIMIT_EXCEEDED")).toBe(true);
  });

  it("blocks operation types that are not explicitly allowed", () => {
    const result = inspectTransaction({
      ...transaction,
      operations: [{ type: "accountMerge", destination: "GTRUSTED" }],
    }, policy);
    expect(result.allowed).toBe(false);
    expect(result.findings[0]?.code).toBe("OPERATION_NOT_ALLOWED");
  });

  it("blocks a network mismatch", () => {
    const result = inspectTransaction({ ...transaction, network: "Public Global Stellar Network ; September 2015" }, policy);
    expect(result.findings.some((finding) => finding.code === "NETWORK_NOT_ALLOWED")).toBe(true);
  });

  it("fails closed when a Soroban contract cannot be identified under an allowlist", () => {
    const result = inspectTransaction({
      ...transaction,
      operations: [{ type: "invokeHostFunction" }],
    }, { ...policy, allowedOperationTypes: ["payment", "invokeHostFunction"], allowedContractIds: ["C123"] });
    expect(result.allowed).toBe(false);
    expect(result.findings.some((finding) => finding.code === "CONTRACT_NOT_ALLOWED")).toBe(true);
  });

  it("rejects malformed transaction input", () => {
    expect(inspectTransaction({ network: "", operations: [] }, policy).allowed).toBe(true);
    expect(inspectTransaction(null as never, policy).allowed).toBe(false);
  });
});

describe("decimalToStroops", () => {
  it("uses exact integer arithmetic", () => {
    expect(decimalToStroops("1.0000001")).toBe(10_000_001n);
  });

  it("rejects precision beyond seven decimal places", () => {
    expect(decimalToStroops("1.00000001")).toBeNull();
  });
});
