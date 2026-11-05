# Architecture

StellarGuard separates envelope decoding from policy evaluation.

1. **Adapter** — `inspectXdr` uses `@stellar/stellar-sdk` to decode XDR and converts operation objects into the stable `GuardTransaction` model.
2. **Normalizer** — `normalizeOperations` extracts only fields represented as simple strings or recognizable asset values. It does not guess missing contract identifiers or function names.
3. **Policy engine** — `evaluatePolicy` checks the network, explicit operation allowlist, optional destination and asset allowlists, payment ceilings, and Soroban restrictions.
4. **Decision** — `GuardResult` reports `allowed` and structured findings. Any blocking finding makes `allowed` false.

## Security posture

- Operation types must be explicitly allowed.
- Unknown operations are blocked.
- Soroban contract/function allowlists fail closed if the adapter cannot identify the relevant value.
- Amount comparisons use integer stroops, not JavaScript floating-point arithmetic.
- The library never signs or submits a transaction.

## Current limitations

The first release is intentionally a policy foundation, not a complete semantic decoder for every Stellar operation or Soroban authorization tree. SDK operation shapes can vary by version. Applications should test the adapter against their own transaction fixtures and treat missing decoded details as a reason to stop for review.

A future adapter can add typed extraction for Soroban host functions, contract arguments, authorization entries, fee-bump envelopes, and additional classic operations. Those additions should include real XDR fixtures and regression tests.
