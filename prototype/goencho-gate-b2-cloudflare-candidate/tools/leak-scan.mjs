import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { openDatabase } from '../lib/db.mjs';
import { OwnerAuthService } from '../lib/owner-auth.mjs';
import { publicError } from '../lib/errors.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const db = openDatabase();
const now = () => 1789574400000;
const marker = () => `B1_${randomBytes(18).toString('base64url')}`;
const pepper = marker();
const bootstrap = marker();
const ownerPin = String(randomBytes(3).readUIntBE(0, 3) % 1000000).padStart(6, '0');
const owner = new OwnerAuthService({ db, pepper, now });
owner.createBootstrapTicket(bootstrap);
const activated = owner.activate({ ticket: bootstrap, pin: ownerPin });

const secrets = [pepper, bootstrap, ownerPin, activated.deviceToken, activated.sessionToken, ...activated.recoveryCodes];
const surfaces = [];
for (const row of db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all()) {
  surfaces.push(JSON.stringify(db.prepare(`SELECT * FROM ${row.name}`).all()));
}
const internalMarker = marker();
surfaces.push(JSON.stringify(publicError({ status: 401, code: 'SAFE_ERROR', message: internalMarker })));

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.local' || entry.name === 'node_modules') continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (['.mjs', '.js', '.sql', '.json', '.html', '.css', '.md'].includes(extname(entry.name))) {
      surfaces.push(readFileSync(full, 'utf8'));
    }
  }
}
walk(root);

const leaked = secrets.filter((secret) => surfaces.some((surface) => surface.includes(secret)));
if (surfaces.some((surface) => surface.includes(internalMarker))) leaked.push('internal-error-marker');
db.close();

if (leaked.length) {
  process.stderr.write(`leak scan failed: ${leaked.length} runtime marker(s) found; raw values suppressed\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`leak scan passed: ${secrets.length} runtime secrets absent from DB, public error, audit data, and saved candidate files\n`);
}
