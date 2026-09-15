import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { vehicles } from '../services/vehicles';
const VehicleContext = createContext(null);

// Mount with key=accountId so the next account never sees a previous collection.
export function VehicleProvider({ accountId, children }) {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(!!accountId);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);
  const inFlight = useRef(false);
  async function reload() {
    if (!accountId || inFlight.current) return;
    inFlight.current = true; setLoading(true); setError('');
    try { const data = await vehicles.list(accountId); if (mounted.current) setCollection(data); }
    catch (e) { if (mounted.current) setError(e.message || 'Não foi possível carregar os veículos.'); }
    finally { inFlight.current = false; if (mounted.current) setLoading(false); }
  }
  useEffect(() => {
    mounted.current = true; reload();
    return () => { mounted.current = false; };
  }, []);
  async function perform(operation) {
    if (inFlight.current || !collection) throw new Error('Aguarde o carregamento dos veículos.');
    inFlight.current = true; setBusy(true);
    try { const data = await operation(); if (mounted.current) { setCollection(data); setError(''); } return data; }
    finally { inFlight.current = false; if (mounted.current) setBusy(false); }
  }
  const items = collection?.items ?? [];
  return <VehicleContext.Provider value={{ items, primaryVehicle: items.find(v => v.id === collection?.primaryId) ?? null,
    loading, error, busy, reload,
    addManual: input => perform(() => vehicles.addManual(accountId, input)),
    addDemo: id => perform(() => vehicles.addDemo(accountId, id)),
    setPrimary: id => perform(() => vehicles.setPrimary(accountId, id)),
    remove: id => perform(() => vehicles.remove(accountId, id)),
  }}>{children}</VehicleContext.Provider>;
}
export function useVehicles() {
  const value = useContext(VehicleContext);
  if (!value) throw new Error('useVehicles requer VehicleProvider.');
  return value;
}
