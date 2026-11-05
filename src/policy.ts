import { decimalToStroops } from "./amount.js";
import type { GuardFinding, GuardOperation, GuardPolicy, GuardResult, GuardTransaction } from "./types.js";

const PAYMENT_TYPES = new Set(["payment", "pathPaymentStrictSend", "pathPaymentStrictReceive"]);

export function evaluatePolicy(transaction: GuardTransaction, policy: GuardPolicy): GuardResult {
  const findings: GuardFinding[] = [];

  if (policy.allowedNetworks && !policy.allowedNetworks.includes(transaction.network)) {
    findings.push({ code: "NETWORK_NOT_ALLOWED", severity: "block", message: "Transaction network is not allowed by this policy." });
  }

  if (!Array.isArray(policy.allowedOperationTypes) || policy.allowedOperationTypes.length === 0) {
    findings.push({ code: "EMPTY_OPERATION_ALLOWLIST", severity: "block", message: "At least one operation type must be explicitly allowed." });
  }

  transaction.operations.forEach((operation, operationIndex) => {
    inspectOperation(operation, operationIndex, policy, findings);
  });

  return { allowed: findings.every((finding) => finding.severity !== "block"), findings };
}

function inspectOperation(
  operation: GuardOperation,
  operationIndex: number,
  policy: GuardPolicy,
  findings: GuardFinding[],
): void {
  const add = (code: string, message: string, severity: "block" | "warning" = "block") => {
    findings.push({ code, severity, message, operationIndex });
  };

  if (!policy.allowedOperationTypes.includes(operation.type)) {
    add("OPERATION_NOT_ALLOWED", `Operation type "${operation.type}" is not explicitly allowed.`);
  }

  if (operation.destination && policy.allowedDestinations &&
      !policy.allowedDestinations.includes(operation.destination)) {
    add("DESTINATION_NOT_ALLOWED", "Operation destination is not on the destination allowlist.");
  }

  if (operation.asset && policy.allowedAssets && !policy.allowedAssets.includes(operation.asset)) {
    add("ASSET_NOT_ALLOWED", "Operation asset is not on the asset allowlist.");
  }

  if (PAYMENT_TYPES.has(operation.type) && policy.maxPaymentAmount !== undefined) {
    const amount = operation.amount === undefined ? null : decimalToStroops(operation.amount);
    const maximum = decimalToStroops(policy.maxPaymentAmount);
    if (amount === null || maximum === null) {
      add("INVALID_PAYMENT_AMOUNT", "Payment amount or configured maximum is invalid.");
    } else if (amount > maximum) {
      add("PAYMENT_LIMIT_EXCEEDED", "Payment amount exceeds the configured maximum.");
    }
  }

  if (operation.type === "invokeHostFunction") {
    if (policy.allowedContractIds && (!operation.contractId || !policy.allowedContractIds.includes(operation.contractId))) {
      add("CONTRACT_NOT_ALLOWED", "Soroban contract is unknown or not on the contract allowlist.");
    }
    if (policy.allowedSorobanFunctions &&
        (!operation.functionName || !policy.allowedSorobanFunctions.includes(operation.functionName))) {
      add("SOROBAN_FUNCTION_NOT_ALLOWED", "Soroban function is unknown or not on the function allowlist.");
    }
    if (!operation.contractId || !operation.functionName) {
      add("SOROBAN_DETAILS_UNAVAILABLE", "The envelope adapter could not identify the contract and function; inspect the operation before signing.");
    }
  }

  if (operation.type === "unknown") {
    add("UNKNOWN_OPERATION", "Operation could not be classified safely.");
  }
}
