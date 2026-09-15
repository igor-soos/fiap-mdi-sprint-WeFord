export const AUTH_KEY = '@weford/auth/v1';
export const LEGACY_KEY = 'user';
export class AuthError extends Error {
  constructor(message, field) { super(message); this.name = 'AuthError'; this.field = field; }
}
export const normalizeEmail = value => String(value ?? '').trim().toLowerCase();

export function validateRegistration(input) {
  const name = String(input.name ?? '').trim().replace(/\s+/g, ' ');
  const email = normalizeEmail(input.email);
  const phone = String(input.phone ?? '').replace(/\D/g, '');
  const password = String(input.password ?? '');
  if (name.length < 2 || name.length > 100) throw new AuthError('Informe seu nome, com 2 a 100 caracteres.', 'name');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError('Informe um e-mail válido.', 'email');
  if (phone && !/^\d{10,11}$/.test(phone)) throw new AuthError('Informe um telefone com DDD e 10 ou 11 dígitos.', 'phone');
  if (password.length < 8 || password.length > 128) throw new AuthError('Use uma senha com 8 a 128 caracteres.', 'password');
  if (!password.trim()) throw new AuthError('A senha não pode conter apenas espaços.', 'password');
  if (password !== input.confirmPassword) throw new AuthError('As senhas não coincidem.', 'confirmPassword');
  return { name, email, phone, password };
}
const emptyState = () => ({ version: 1, accounts: [], sessionAccountId: null });
const publicAccount = a => a ? { id: a.id, name: a.name, email: a.email, phone: a.phone, preferences: { ...a.preferences } } : null;
function parseState(raw) {
  if (raw === null) return emptyState();
  let state;
  try { state = JSON.parse(raw); } catch { throw new AuthError('Não foi possível ler as contas salvas. Os dados foram preservados.'); }
  const valid = a => a && typeof a.id === 'string' && a.id && typeof a.name === 'string' &&
    typeof a.email === 'string' && a.email && typeof a.phone === 'string' &&
    a.credential?.algorithm === 'pbkdf2-sha256' && a.credential.iterations === 600000 &&
    /^[a-f0-9]{32}$/.test(a.credential.salt) && /^[a-f0-9]{64}$/.test(a.credential.hash) &&
    typeof a.preferences?.offers === 'boolean' && typeof a.preferences?.reviews === 'boolean';
  if (!state || state.version !== 1 || !Array.isArray(state.accounts) || !state.accounts.every(valid) ||
    new Set(state.accounts.map(a => a.id)).size !== state.accounts.length ||
    new Set(state.accounts.map(a => a.email)).size !== state.accounts.length ||
    (state.sessionAccountId !== null && typeof state.sessionAccountId !== 'string')) {
    throw new AuthError('Os dados locais não estão no formato esperado. Nenhuma conta foi apagada.');
  }
  return state;
}

// Accounts/session share one storage write. A queue serializes concurrent calls.
export function createAuthService({ storage, passwords, newId }) {
  let queue = Promise.resolve();
  const serialize = fn => { const task = queue.then(fn); queue = task.catch(() => {}); return task; };
  async function read() {
    try { return parseState(await storage.getItem(AUTH_KEY)); }
    catch (e) { if (e instanceof AuthError) throw e; throw new AuthError('Não foi possível acessar os dados neste aparelho. Tente novamente.'); }
  }
  async function write(state) {
    try { await storage.setItem(AUTH_KEY, JSON.stringify(state)); }
    catch { throw new AuthError('Não foi possível salvar neste aparelho. Verifique o espaço disponível e tente novamente.'); }
  }
  async function restoreAndMigrate() {
    const state = await read();
    let legacyRaw;
    try { legacyRaw = await storage.getItem(LEGACY_KEY); }
    catch { throw new AuthError('Não foi possível verificar o cadastro anterior. Tente novamente.'); }
    if (legacyRaw !== null) {
      let legacy;
      try { legacy = JSON.parse(legacyRaw); } catch { throw new AuthError('O cadastro anterior não pôde ser lido. Ele foi preservado.'); }
      if (!legacy || typeof legacy.email !== 'string' || !legacy.email.trim() || typeof legacy.password !== 'string') {
        throw new AuthError('O cadastro anterior está incompleto. Ele foi preservado para recuperação.');
      }
      const email = normalizeEmail(legacy.email);
      const existing = state.accounts.find(a => a.email === email);
      if (existing && !(await passwords.verify(legacy.password, existing.credential))) throw new AuthError('Existe um conflito com o cadastro anterior. Os dados foram preservados.');
      if (!existing) {
        state.accounts.push({ id: await newId(), name: String(legacy.name || 'Usuário'), email,
          phone: String(legacy.phone || ''), credential: await passwords.hash(legacy.password),
          preferences: { offers: true, reviews: true } });
        // An old stored account is not proof of an active session.
        await write(state);
      }
      try { await storage.removeItem(LEGACY_KEY); }
      catch { throw new AuthError('A conta foi migrada, mas a limpeza do cadastro antigo falhou. Tente novamente.'); }
    }
    const account = state.accounts.find(a => a.id === state.sessionAccountId);
    if (state.sessionAccountId && !account) { state.sessionAccountId = null; await write(state); }
    return publicAccount(account);
  }
  return {
    restore: () => serialize(restoreAndMigrate),
    register: input => serialize(async () => {
      const v = validateRegistration(input);
      const state = await read();
      if (state.accounts.some(a => a.email === v.email)) throw new AuthError('Este e-mail já está cadastrado neste aparelho. Entre com sua conta.', 'email');
      const account = { id: await newId(), name: v.name, email: v.email, phone: v.phone,
        credential: await passwords.hash(v.password), preferences: { offers: true, reviews: true } };
      state.accounts.push(account); state.sessionAccountId = account.id;
      await write(state); return publicAccount(account);
    }),
    login: (emailInput, password) => serialize(async () => {
      const email = normalizeEmail(emailInput);
      if (!email || !password) throw new AuthError('Preencha o e-mail e a senha.');
      const state = await read();
      const account = state.accounts.find(a => a.email === email);
      if (!account || !(await passwords.verify(password, account.credential))) throw new AuthError('E-mail ou senha inválidos.');
      state.sessionAccountId = account.id; await write(state); return publicAccount(account);
    }),
    logout: () => serialize(async () => { const state = await read(); state.sessionAccountId = null; await write(state); }),
    updatePreferences: (accountId, changes) => serialize(async () => {
      const state = await read();
      if (state.sessionAccountId !== accountId) throw new AuthError('Entre novamente para alterar suas preferências.');
      const account = state.accounts.find(a => a.id === accountId);
      if (!account) throw new AuthError('Conta não encontrada.');
      for (const key of ['offers', 'reviews']) if (typeof changes[key] === 'boolean') account.preferences[key] = changes[key];
      await write(state); return publicAccount(account);
    }),
  };
}
