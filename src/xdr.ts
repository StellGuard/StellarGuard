import { TransactionBuilder } from "@stellar/stellar-sdk";
import { inspectTransaction } from "./inspect.js";
import type { GuardOperation, GuardPolicy, GuardResult } from "./types.js";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null ? value as UnknownRecord : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function assetName(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  const asset = asRecord(value);
  const nativeFlag = asset.isNative;
  if (nativeFlag === true || (typeof nativeFlag === "function" && nativeFlag.call(value) === true)) {
    return "native";
  }
  const code = asString(asset.code);
  const issuer = asString(asset.issuer);
  return code && issuer ? `${code}:${issuer}` : undefined;
}

/** Convert the public operation objects exposed by Stellar SDK into the policy model. */
export function normalizeOperations(rawOperations: unknown[]): GuardOperation[] {
  return rawOperations.map((raw) => {
    const operation = asRecord(raw);
    const type = asString(operation.type) ?? "unknown";
    const normalized: GuardOperation = { type };

    const source = asString(operation.source);
    const destination = asString(operation.destination) ?? asString(operation.to);
    const asset = assetName(operation.asset) ?? assetName(operation.sendAsset);
    const amount = asString(operation.amount) ?? asString(operation.sendAmount);

    if (source) normalized.source = source;
    if (destination) normalized.destination = destination;
    if (asset) normalized.asset = asset;
    if (amount) normalized.amount = amount;

    // SDK versions may expose Soroban details differently. Only trust simple,
    // already-decoded strings; absent details cause the policy evaluator to fail closed.
    const contractId = asString(operation.contractId);
    const functionName = asString(operation.functionName);
    if (contractId) normalized.contractId = contractId;
    if (functionName) normalized.functionName = functionName;

    return normalized;
  });
}

/**
 * Decode and inspect an XDR envelope. No signing, simulation, or network request occurs.
 * Unsupported envelope shapes are rejected rather than treated as safe.
 */
export function inspectXdr(xdr: string, networkPassphrase: string, policy: GuardPolicy): GuardResult {
  try {
    const transaction = TransactionBuilder.fromXDR(xdr, networkPassphrase) as unknown as { operations?: unknown[] };
    if (!Array.isArray(transaction.operations)) {
      return {
        allowed: false,
        findings: [{ code: "UNSUPPORTED_ENVELOPE", severity: "block", message: "Decoded envelope does not expose a supported operations list." }],
      };
    }
    return inspectTransaction({
      network: networkPassphrase,
      operations: normalizeOperations(transaction.operations),
    }, policy);
  } catch {
    return {
      allowed: false,
      findings: [{ code: "XDR_DECODE_FAILED", severity: "block", message: "Could not decode the supplied XDR envelope for the selected network." }],
    };
  }
}
