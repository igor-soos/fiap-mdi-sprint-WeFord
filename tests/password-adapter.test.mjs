import test from 'node:test';
import assert from 'node:assert/strict';
import { pbkdf2Sync } from 'node:crypto';

let noble;
try {
  const { pbkdf2Async } = await import('@noble/hashes/pbkdf2');
  const { sha256 } = await import('@noble/hashes/sha256');
  noble = { pbkdf2Async, sha256 };
} catch (e) {
  if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e;
}

test('Expo password KDF adapter matches Node PBKDF2 for Unicode input', {
  skip: noble ? false : 'Execute npm install para testar @noble/hashes.',
}, async () => {
  const salt = Uint8Array.from({length: 16}, (_, i) => i);
  const actual = await noble.pbkdf2Async(noble.sha256, 'Senha á🙂', salt, { c: 600000, dkLen: 32, asyncTick: 8 });
  const expected = pbkdf2Sync('Senha á🙂', salt, 600000, 32, 'sha256');
  assert.deepEqual(Buffer.from(actual), expected);
});
