import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const wrangler = join(root, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const args = process.argv.slice(2);
const isDryRunDeploy = args[0] === 'deploy' && args.includes('--dry-run');
const isLocalD1 = args[0] === 'd1' && args[1] === 'execute'
  && args.includes('--local') && !args.includes('--remote');
if (!isDryRunDeploy && !isLocalD1) {
  throw new Error('Gate B2-1A wrapper permits only deploy --dry-run or d1 execute --local');
}
if (isLocalD1 && !args.includes('--persist-to')) {
  args.push('--persist-to', join(tmpdir(), 'goencho-b2-d1-local-20260918'));
}
const environment = {
  ...process.env,
  WRANGLER_SEND_METRICS: 'false',
  XDG_CONFIG_HOME: join(root, '.local', 'xdg'),
  NO_COLOR: '1',
};
for (const name of [
  'CLOUDFLARE_API_TOKEN',
  'CLOUDFLARE_API_KEY',
  'CLOUDFLARE_ACCOUNT_ID',
  'CF_API_TOKEN',
  'CF_API_KEY',
]) {
  delete environment[name];
}
const result = spawnSync(process.execPath, [wrangler, ...args], {
  cwd: root,
  env: environment,
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
