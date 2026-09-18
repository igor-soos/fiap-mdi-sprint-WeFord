import test from 'node:test';
import assert from 'node:assert/strict';
import { pbkdf2, randomBytes } from 'node:crypto';
import { promisify } from 'node:util';
import { readFile } from 'node:fs/promises';

// Import pure production modules without changing Expo's package module mode.
async function load(relative) {
  const source = await readFile(new URL(relative, import.meta.url), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
}
const { createAuthService, AUTH_KEY, LEGACY_KEY, validateRegistration } = await load('../src/services/authCore.js');
const { createPasswordService } = await load('../src/services/passwordCore.js');
const derive = promisify(pbkdf2);
// The adapter uses Node's native PBKDF2. Expo/noble integration remains a device check.
const passwords = createPasswordService({ randomBytes: async n => randomBytes(n),
  derive: (password, salt, c) => derive(password, salt, c, 32, 'sha256') });
const input = (email = 'igor@example.com') => ({ name: 'Igor Ribeiro', email, phone: '(11) 99999-9999', password: 'SenhaExemplo123', confirmPassword: 'SenhaExemplo123' });
function fixture() {
  const data = new Map();
  const faults = { read: false, write: false, remove: false };
  let id = 0;
  const storage = {
    async getItem(k) { if (faults.read) throw new Error('read'); return data.get(k) ?? null; },
    async setItem(k, v) { if (faults.write) throw new Error('write'); data.set(k, v); },
    async removeItem(k) { if (faults.remove) throw new Error('remove'); data.delete(k); },
  };
  const build = () => createAuthService({ storage, passwords, newId: async () => `account-${++id}` });
  return { data, faults, build, auth: build() };
}

test('rejects incomplete fields, invalid email/phone and password mismatch', () => {
  for (const [patch, field] of [ [{ name: '' }, 'name'], [{ email: 'bad' }, 'email'],
    [{ phone: '123' }, 'phone'], [{ password: '123' }, 'password'],
    [{ password: '        ', confirmPassword: '        ' }, 'password'],
    [{ confirmPassword: 'different' }, 'confirmPassword'] ]) {
    assert.throws(() => validateRegistration({ ...input(), ...patch }), e => e.field === field);
  }
  assert.equal(validateRegistration({ ...input(), email: ' IGOR@EXAMPLE.COM ', phone: '' }).email, 'igor@example.com');
});

test('registration persists session and returns no credential or password', async () => {
  const f = fixture();
  const user = await f.auth.register(input());
  assert.equal(user.email, 'igor@example.com');
  assert.equal(user.phone, '11999999999');
  assert.equal(user.credential, undefined);
  assert.equal(user.password, undefined);
  assert.equal((await f.build().restore()).id, user.id);
  assert.ok(!f.data.get(AUTH_KEY).includes(input().password));
});

test('two accounts retain independent identity and preferences', async () => {
  const f = fixture();
  const a = await f.auth.register(input());
  await f.auth.updatePreferences(a.id, { offers: false });
  await f.auth.logout();
  const b = await f.auth.register({ ...input('second@example.com'), name: 'Outra Pessoa' });
  assert.notEqual(a.id, b.id);
  assert.equal(b.preferences.offers, true);
  await f.auth.logout();
  const restoredA = await f.auth.login(' IGOR@EXAMPLE.COM ', input().password);
  assert.equal(restoredA.preferences.offers, false);
  assert.equal(restoredA.name, a.name);
  await assert.rejects(f.auth.updatePreferences(b.id, { offers: false }), /Entre novamente/);
});

test('logout clears session, retains account and permits a later login', async () => {
  const f = fixture();
  await f.auth.register(input());
  await f.auth.logout();
  assert.equal(await f.build().restore(), null);
  assert.equal(JSON.parse(f.data.get(AUTH_KEY)).accounts.length, 1);
  await assert.rejects(f.auth.login(input().email, 'wrong'), /inválidos/);
  assert.equal(await f.auth.restore(), null);
  assert.ok(await f.auth.login(input().email, input().password));
});

test('concurrent duplicate registrations produce only one account', async () => {
  const f = fixture();
  const outcomes = await Promise.allSettled([f.auth.register(input()), f.auth.register(input(' IGOR@EXAMPLE.COM '))]);
  assert.equal(outcomes.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(JSON.parse(f.data.get(AUTH_KEY)).accounts.length, 1);
});

test('failed registration never creates session; queue recovers for retry', async () => {
  const f = fixture(); f.faults.write = true;
  await assert.rejects(f.auth.register(input()), /salvar/);
  assert.equal(f.data.has(AUTH_KEY), false);
  f.faults.write = false;
  assert.ok(await f.auth.register(input()));
});

test('failed logout preserves previous state and reports failure', async () => {
  const f = fixture(); const user = await f.auth.register(input());
  f.faults.write = true;
  await assert.rejects(f.auth.logout(), /salvar/);
  f.faults.write = false;
  assert.equal((await f.auth.restore()).id, user.id);
});

test('failed login/preferences write leaves the persisted state unchanged', async () => {
  const f = fixture(); const user = await f.auth.register(input());
  f.faults.write = true;
  await assert.rejects(f.auth.updatePreferences(user.id, { reviews: false }), /salvar/);
  assert.equal(JSON.parse(f.data.get(AUTH_KEY)).accounts[0].preferences.reviews, true);
  f.faults.write = false; await f.auth.logout(); f.faults.write = true;
  await assert.rejects(f.auth.login(input().email, input().password), /salvar/);
  assert.equal(JSON.parse(f.data.get(AUTH_KEY)).sessionAccountId, null);
});

test('legacy account migrates once, removes plaintext and requires login', async () => {
  const f = fixture(); f.data.set(LEGACY_KEY, JSON.stringify({ name: 'Anterior', email: ' OLD@EXAMPLE.COM ', password: 'short', phone: '123' }));
  assert.equal(await f.auth.restore(), null);
  assert.equal(f.data.has(LEGACY_KEY), false);
  assert.ok(!f.data.get(AUTH_KEY).includes('short'));
  assert.equal((await f.auth.login('old@example.com', 'short')).name, 'Anterior');
  await f.auth.restore();
  assert.equal(JSON.parse(f.data.get(AUTH_KEY)).accounts.length, 1);
});

test('migration write failure preserves original account for retry', async () => {
  const f = fixture(); f.data.set(LEGACY_KEY, JSON.stringify(input())); f.faults.write = true;
  await assert.rejects(f.auth.restore(), /salvar/);
  assert.equal(f.data.has(LEGACY_KEY), true);
  assert.equal(f.data.has(AUTH_KEY), false);
  f.faults.write = false; await f.auth.restore();
  assert.equal(f.data.has(LEGACY_KEY), false);
});

test('migration cleanup failure is retryable and does not duplicate account', async () => {
  const f = fixture(); f.data.set(LEGACY_KEY, JSON.stringify(input())); f.faults.remove = true;
  await assert.rejects(f.auth.restore(), /limpeza/);
  f.faults.remove = false; await f.auth.restore();
  assert.equal(JSON.parse(f.data.get(AUTH_KEY)).accounts.length, 1);
  assert.equal(f.data.has(LEGACY_KEY), false);
});

test('corrupt data fails closed without overwriting or deleting it', async () => {
  const f = fixture(); f.data.set(AUTH_KEY, '{broken');
  await assert.rejects(f.auth.restore(), /preservados/);
  await assert.rejects(f.auth.register(input()), /preservados/);
  assert.equal(f.data.get(AUTH_KEY), '{broken');
});

test('invalid session reference is cleared without removing accounts', async () => {
  const f = fixture(); await f.auth.register(input());
  const state = JSON.parse(f.data.get(AUTH_KEY)); state.sessionAccountId = 'missing';
  f.data.set(AUTH_KEY, JSON.stringify(state));
  assert.equal(await f.auth.restore(), null);
  assert.equal(JSON.parse(f.data.get(AUTH_KEY)).accounts.length, 1);
});

test('salted password derivation validates Unicode and rejects wrong passwords', async () => {
  const pass = 'Segredo á🙂 123';
  const first = await passwords.hash(pass); const second = await passwords.hash(pass);
  assert.notEqual(first.salt, second.salt);
  assert.notEqual(first.hash, second.hash);
  assert.equal(await passwords.verify(pass, first), true);
  assert.equal(await passwords.verify('wrong', first), false);
  assert.equal(await passwords.verify(pass, { ...first, iterations: 1 }), false);
});
