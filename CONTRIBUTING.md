# Contributing

Thanks for helping improve StellarGuard.

## Before opening a pull request

1. Open or comment on an issue describing the change.
2. Keep policy decisions fail-closed when transaction details are unknown.
3. Add tests for new operation types, policy rules, and malformed inputs.
4. Run `npm test`, `npm run typecheck`, and `npm run build`.
5. Explain any compatibility or security implications in the pull request.

## Scope

Prefer small, reviewable changes. Do not add signing, secret-key handling, or transaction submission to this package. Security-sensitive changes should include test fixtures and a clear threat-model note.
