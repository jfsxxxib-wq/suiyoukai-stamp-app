import { stdin, stdout } from 'node:process';
import { decodeInputPacket } from './b2c4-2-core.mjs';

const chunks = [];
for await (const chunk of stdin) chunks.push(Buffer.from(chunk));
const packet = Buffer.concat(chunks);
for (const chunk of chunks) chunk.fill(0);

let material;
try {
  material = decodeInputPacket(packet);
  material.validate();
  stdout.write('{"schema_version":1,"operation":"b2-2c4-2-offline-input","accepted":true}\n');
} catch {
  stdout.write('{"schema_version":1,"operation":"b2-2c4-2-offline-input","accepted":false}\n');
  process.exitCode = 2;
} finally {
  material?.zeroize();
  packet.fill(0);
}
