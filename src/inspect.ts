import { evaluatePolicy } from "./policy.js";
import type { GuardPolicy, GuardResult, GuardTransaction } from "./types.js";

export function inspectTransaction(transaction: GuardTransaction, policy: GuardPolicy): GuardResult {
  if (!transaction || typeof transaction.network !== "string" || !Array.isArray(transaction.operations)) {
    return {
      allowed: false,
      findings: [{ code: "INVALID_TRANSACTION", severity: "block", message: "Transaction must include a network and an operations array." }],
    };
  }
  return evaluatePolicy(transaction, policy);
}
