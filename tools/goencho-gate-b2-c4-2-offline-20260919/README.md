# B2-2C4-2 offline repository tool

This directory is a repository-level, offline-only safety tool for bundle, single-use runner, and secret-input fixtures. It is not Worker runtime source and is not deployed.

- The fixed candidate is `../../prototype/goencho-gate-b2-cloudflare-candidate/` at Git checkpoint `9afbc0d`.
- `b2c4-2-core.mjs` contains only local hashing, config guards, zero-fill buffers, injected adapters, and `deploy --dry-run` execution.
- The pinned Wrangler inside the fixed candidate is invoked by absolute path; PATH Wrangler, npm, and npx are not used.
- No real Cloudflare adapter, API URL, Token, secret value, remote deploy command, or runtime request is implemented.
- `start-b2c4-2-offline-input.ps1` sends a length-prefixed binary packet only to the offline validator through stdin.
- Tests use fixture-only values and injected functions.

Run the offline fixtures with:

```powershell
node --test --test-isolation=none tests/*.test.mjs
```

Produce the safe deterministic bundle summary with:

```powershell
node inspect-bundle.mjs
```
