import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { auth } from '../services/auth';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [initializationError, setInitializationError] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  async function restore() {
    setInitializing(true); setInitializationError('');
    try { setUser(await auth.restore()); }
    catch (e) { setInitializationError(e.message || 'Não foi possível abrir sua conta.'); }
    finally { setInitializing(false); }
  }
  useEffect(() => { restore(); }, []);
  async function perform(operation) {
    if (inFlight.current) throw new Error('Aguarde a operação atual terminar.');
    inFlight.current = true; setBusy(true);
    try { const result = await operation(); setUser(result ?? null); return result; }
    finally { inFlight.current = false; setBusy(false); }
  }
  return <AuthContext.Provider value={{
    user, busy, initializing, initializationError, retryInitialization: restore,
    register: input => perform(() => auth.register(input)),
    login: (email, password) => perform(() => auth.login(email, password)),
    logout: () => perform(() => auth.logout()),
    updatePreferences: changes => perform(() => auth.updatePreferences(user?.id, changes)),
  }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth requer AuthProvider.');
  return value;
}
