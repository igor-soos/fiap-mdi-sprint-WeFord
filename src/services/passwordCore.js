export const PASSWORD_ITERATIONS = 600000;
export function createPasswordService({ randomBytes, derive }) {
  const hex = bytes => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  const unhex = value => Uint8Array.from(value.match(/../g), pair => parseInt(pair, 16));
  return {
    async hash(password) {
      const salt = await randomBytes(16);
      const hash = await derive(password, salt, PASSWORD_ITERATIONS);
      return { algorithm: 'pbkdf2-sha256', iterations: PASSWORD_ITERATIONS, salt: hex(salt), hash: hex(hash) };
    },
    async verify(password, credential) {
      if (credential?.algorithm !== 'pbkdf2-sha256' || credential.iterations !== PASSWORD_ITERATIONS ||
        !/^[a-f0-9]{32}$/.test(credential.salt) || !/^[a-f0-9]{64}$/.test(credential.hash)) return false;
      const actual = await derive(password, unhex(credential.salt), credential.iterations);
      const expected = unhex(credential.hash);
      if (actual.length !== expected.length) return false;
      let difference = 0;
      for (let i = 0; i < actual.length; i++) difference |= actual[i] ^ expected[i];
      return difference === 0;
    },
  };
}
