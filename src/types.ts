/** A normalized operation shape. Values are extracted from an unsigned envelope. */
export interface GuardOperation {
  type: string;
  source?: string;
  destination?: string;
  asset?: string;
  amount?: string;
  contractId?: string;
  functionName?: string;
}

export interface GuardTransaction {
  network: string;
  operations: GuardOperation[];
}

export interface GuardPolicy {
  /** Exact network passphrases accepted by this policy. */
  allowedNetworks?: string[];
  /** Explicit allowlist. Unsupported and omitted operation types are blocked. */
  allowedOperationTypes: string[];
  allowedDestinations?: string[];
  /** Use "native" for XLM, or "CODE:ISSUER" for issued assets. */
  allowedAssets?: string[];
  /** Maximum payment amount in decimal units, e.g. "100.25". */
  maxPaymentAmount?: string;
  allowedContractIds?: string[];
  allowedSorobanFunctions?: string[];
}

export type FindingSeverity = "block" | "warning";

export interface GuardFinding {
  code: string;
  severity: FindingSeverity;
  message: string;
  operationIndex?: number;
}

export interface GuardResult {
  allowed: boolean;
  findings: GuardFinding[];
}
