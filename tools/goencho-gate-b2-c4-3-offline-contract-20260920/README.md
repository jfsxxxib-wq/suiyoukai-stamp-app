# B2-2C4-3A offline contract

This package freezes the C4-3 state machine, secret handling, command specifications, request
budget, safe output and single-use boundary. It contains no account identifier, D1 identifier,
API token or secret value. It is tested in a target-like Gate topology with the candidate and
the C4-2 offline package present as siblings in their normal locations.

`start-c43-live.ps1` deliberately accepts only `OfflineFixture`. This package is not a remote
runner; remote execution remains disabled until C4-3B and a separate C4-3C approval.
