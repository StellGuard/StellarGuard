import { evaluatePolicy } from "./policy.js";
import type { GuardPolicy, GuardResult, GuardTransaction } from "./types.js";

export function inspectTransaction(transaction: GuardTransaction, policy: GuardPolicy): GuardResult {
  if (
    !transaction ||
    typeof transaction.network !== "string" ||
    transaction.network.trim().length === 0 ||
    !Array.isArray(transaction.operations) ||
    transaction.operations.length === 0
  ) {
    return {
      allowed: false,
      findings: [{
        code: "INVALID_TRANSACTION",
        severity: "block",
        message: "Transaction must include a non-empty network and at least one operation.",
      }],
    };
  }

  return evaluatePolicy(transaction, policy);
}
