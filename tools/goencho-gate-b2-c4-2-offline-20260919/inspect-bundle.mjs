import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  deploymentContractHash,
  readWranglerConfig,
  runOfflineBundleTwice,
  verifyCandidateBaseline,
} from './b2c4-2-core.mjs';

const toolRoot = dirname(fileURLToPath(import.meta.url));
const gateRoot = dirname(dirname(toolRoot));
const candidateRoot = join(gateRoot, 'prototype', 'goencho-gate-b2-cloudflare-candidate');
const baseline = verifyCandidateBaseline(candidateRoot);
const bundle = runOfflineBundleTwice(candidateRoot);
const result = {
  schema_version: 1,
  operation: 'b2-2c4-2-offline-bundle-inspect',
  source_files: baseline.file_count,
  source_tree_sha256: baseline.tree_hash,
  deployment_contract_sha256: deploymentContractHash(readWranglerConfig(candidateRoot)),
  bundle_files: bundle.file_count,
  canonical_bundle_sha256: bundle.bundle_hash,
  worker_js_sha256: bundle.worker_hash,
  normalized_metadata: bundle.normalized_metadata,
  deterministic: bundle.deterministic,
};
process.stdout.write(`${JSON.stringify(result)}\n`);
