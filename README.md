# StellarGuard

**A transaction-policy SDK for Stellar and Soroban.**

StellarGuard helps wallets, dApps, and payment services inspect a Stellar transaction before it is signed. Define an explicit policy, decode an XDR envelope, and receive a structured decision with actionable findings.

> StellarGuard is a policy evaluator, not a transaction simulator, auditor, signer, or guarantee that a transaction is safe. It evaluates the information available in the transaction envelope and fails closed on unsupported operations.

## Why StellarGuard?

Stellar applications need a reusable way to express transaction safety rules without embedding policy logic in every wallet or dApp. StellarGuard provides a small TypeScript API for:

- Allowlisting networks and operation types.
- Restricting payment destinations and assets.
- Setting maximum payment amounts with exact decimal arithmetic.
- Restricting Soroban contract IDs and function names when those identifiers are available.
- Returning structured blocking and warning findings.
- Inspecting XDR envelopes before a wallet signs them.

## Quick start

Requires Node.js 20 or newer.

```bash
npm install
npm run build
```

```ts
import { inspectTransaction, type GuardPolicy } from "stellarguard";

const policy: GuardPolicy = {
  allowedNetworks: ["Test SDF Network ; September 2015"],
  allowedOperationTypes: ["payment"],
  allowedDestinations: ["G...TRUSTED_DESTINATION"],
  allowedAssets: ["native"],
  maxPaymentAmount: "250",
};

const result = inspectTransaction({
  network: "Test SDF Network ; September 2015",
  operations: [
    {
      type: "payment",
      destination: "G...TRUSTED_DESTINATION",
      asset: "native",
      amount: "12.5",
    },
  ],
}, policy);

if (!result.allowed) {
  console.error("Transaction blocked:", result.findings);
} else {
  console.log("Transaction passed policy checks");
}
```

The example destination is illustrative; replace it with a real Stellar account.

## Inspect an XDR envelope

The XDR adapter uses the official Stellar SDK to decode an envelope. It does not sign, submit, or simulate the transaction.

```ts
import { inspectXdr } from "stellarguard";

const result = inspectXdr(unsignedTransactionXdr, networkPassphrase, policy);
```

See [docs/architecture.md](docs/architecture.md) for the normalized operation model and limitations.

## Policy behavior

- Every operation type must be explicitly listed in `allowedOperationTypes`.
- If `allowedNetworks` is set, the transaction network must match.
- Destination, asset, amount, contract, and function restrictions apply when configured.
- Unknown or unsupported operations are blocked by default.
- Findings use stable codes so applications can present consistent UI.

## Development

```bash
npm test
npm run typecheck
npm run build
```

## Project status

Early-stage open-source software. Review the API and limitations before integrating it into a production signing flow. Contributions and security reports are welcome.

## License

MIT. See [LICENSE](LICENSE).
