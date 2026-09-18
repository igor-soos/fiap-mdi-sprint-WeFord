export class VehicleError extends Error {
  constructor(message, field) { super(message); this.name = 'VehicleError'; this.field = field; }
}
export const vehicleKey = accountId => `@weford/vehicles/v1/${accountId}`;
export function validateManualVehicle(input, currentYear = new Date().getFullYear()) {
  const model = String(input.model ?? '').trim().replace(/^ford\s+/i, '').replace(/\s+/g, ' ');
  const rawYear = String(input.modelYear ?? '').trim();
  const vin = String(input.vin ?? '').trim().toUpperCase();
  const rawKm = String(input.km ?? '').trim();
  if (model.length < 2 || model.length > 80) throw new VehicleError('Informe o modelo, com 2 a 80 caracteres.', 'model');
  if (!/^\d{4}$/.test(rawYear) || +rawYear < 1900 || +rawYear > currentYear + 1) {
    throw new VehicleError(`Informe um ano entre 1900 e ${currentYear + 1}.`, 'modelYear');
  }
  // Format validation only. No ownership or VIN-to-hash matching is performed.
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) throw new VehicleError('O VIN precisa ter 17 letras ou números, sem I, O ou Q.', 'vin');
  if (rawKm && (!/^\d+$/.test(rawKm) || !Number.isSafeInteger(+rawKm) || +rawKm > 9999999)) {
    throw new VehicleError('Informe a quilometragem inteira entre 0 e 9.999.999, sem pontos ou vírgulas.', 'km');
  }
  return { model, modelYear: +rawYear, vin, km: rawKm ? +rawKm : null };
}

export function createVehicleService({ storage, catalog, newId, getSessionAccountId, now = () => new Date().toISOString() }) {
  let queue = Promise.resolve();
  const serial = fn => { const task = queue.then(fn); queue = task.catch(() => {}); return task; };
  const demoById = new Map(catalog.vehicles.map(v => [v.id, v]));
  async function authorize(accountId) {
    if (!accountId || (await getSessionAccountId()) !== accountId) throw new VehicleError('Entre novamente para acessar seus veículos.');
  }
  async function read(accountId) {
    await authorize(accountId);
    let raw;
    try { raw = await storage.getItem(vehicleKey(accountId)); }
    catch { throw new VehicleError('Não foi possível carregar os veículos. Tente novamente.'); }
    if (raw === null) return { version: 1, accountId, items: [], primaryId: null };
    try {
      const s = JSON.parse(raw);
      if (s.version !== 1 || s.accountId !== accountId || !Array.isArray(s.items)) throw new Error();
      for (const v of s.items) {
        if (!v || typeof v.id !== 'string' || !v.id || typeof v.addedAt !== 'string') throw new Error();
        if (v.source === 'vin-share-demo') {
          if (!demoById.has(v.demoId) || v.id !== `demo:${v.demoId}`) throw new Error();
        } else if (v.source === 'manual') {
          validateManualVehicle(v);
        } else throw new Error();
      }
      if (new Set(s.items.map(v => v.id)).size !== s.items.length ||
          new Set(s.items.filter(v => v.source === 'manual').map(v => v.vin)).size !== s.items.filter(v => v.source === 'manual').length ||
          s.items.filter(v => v.source === 'vin-share-demo').length > 1 ||
          (s.items.length ? !s.items.some(v => v.id === s.primaryId) : s.primaryId !== null)) throw new Error();
      return s;
    } catch { throw new VehicleError('Os veículos salvos não puderam ser lidos. Os dados foram preservados.'); }
  }
  function hydrate(state) {
    return { ...state, items: state.items.map(v => {
      if (v.source === 'manual') return { ...v, history: [], isDemo: false, warrantyStartDate: null };
      const demo = demoById.get(v.demoId);
      const history = [...demo.history].sort((a,b) => b.date.localeCompare(a.date));
      return { ...v, model: demo.model, modelYear: demo.modelYear, vin: null,
        isDemo: true, km: history[0]?.km ?? null, mileageDate: history[0]?.date ?? null,
        warrantyStartDate: demo.warrantyStartDate, history };
    }) };
  }
  async function save(state) {
    await authorize(state.accountId);
    try { await storage.setItem(vehicleKey(state.accountId), JSON.stringify(state)); }
    catch { throw new VehicleError('Não foi possível salvar a alteração. Tente novamente.'); }
    return hydrate(state);
  }
  return {
    list: accountId => serial(async () => hydrate(await read(accountId))),
    addManual: (accountId, input) => serial(async () => {
      const values = validateManualVehicle(input);
      const state = await read(accountId);
      if (state.items.some(v => v.vin === values.vin)) throw new VehicleError('Este VIN já está cadastrado nesta conta.', 'vin');
      const item = { ...values, id: `manual:${await newId()}`, source: 'manual', addedAt: now() };
      state.items.push(item); state.primaryId ??= item.id;
      return save(state);
    }),
    addDemo: (accountId, demoId) => serial(async () => {
      if (!demoById.has(demoId)) throw new VehicleError('Veículo de exemplo não encontrado.');
      const state = await read(accountId);
      if (state.items.some(v => v.source === 'vin-share-demo')) throw new VehicleError('Esta conta já tem um veículo de exemplo. Remova-o antes de escolher outro.');
      const item = { id: `demo:${demoId}`, demoId, source: 'vin-share-demo', addedAt: now() };
      state.items.push(item); state.primaryId ??= item.id;
      return save(state);
    }),
    setPrimary: (accountId, id) => serial(async () => {
      const state = await read(accountId);
      if (!state.items.some(v => v.id === id)) throw new VehicleError('Veículo não encontrado nesta conta.');
      state.primaryId = id; return save(state);
    }),
    remove: (accountId, id) => serial(async () => {
      const state = await read(accountId);
      if (!state.items.some(v => v.id === id)) throw new VehicleError('Veículo não encontrado nesta conta.');
      state.items = state.items.filter(v => v.id !== id);
      if (state.primaryId === id) state.primaryId = state.items[0]?.id ?? null;
      return save(state);
    }),
  };
}
