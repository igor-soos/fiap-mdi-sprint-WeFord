import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const code = await readFile(new URL('../src/services/vehicleCore.js', import.meta.url), 'utf8');
const { createVehicleService, validateManualVehicle, vehicleKey } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const catalog = JSON.parse(await readFile(new URL('../src/data/demoVehicles.json', import.meta.url), 'utf8'));
const manual = { model: 'Ranger', modelYear: '2023', vin: '3FTTW8S98RRA12345', km: '25000' };
function fixture() {
  const data = new Map(); let session = 'a'; let id = 0;
  const faults = { read: false, write: false, afterRead: null };
  const storage = {
    async getItem(k) { if (faults.read) throw new Error('read'); const value = data.get(k) ?? null; faults.afterRead?.(); return value; },
    async setItem(k,v) { if (faults.write) throw new Error('write'); data.set(k,v); },
  };
  const build = () => createVehicleService({ storage, catalog, newId: async () => String(++id), getSessionAccountId: async () => session, now: () => '2026-09-11T12:00:00Z' });
  return { data, faults, build, service: build(), setSession: v => { session = v; } };
}
test('manual validation checks model, year, VIN and mileage without interpreting a hash', () => {
  for (const [patch, field] of [[{model:''},'model'],[{modelYear:'1800'},'modelYear'],[{modelYear:'9999'},'modelYear'],
    [{vin:'invalid'},'vin'],[{vin:'3FTTW8S98RRA1234O'},'vin'],[{km:'-1'},'km'],[{km:'20.5'},'km']]) {
    assert.throws(() => validateManualVehicle({...manual,...patch}), e => e.field === field);
  }
  const normalized = validateManualVehicle({...manual, model:' Ford  Ranger ', vin:'3fttw8s98rra12345', km:''});
  assert.equal(normalized.model, 'Ranger'); assert.equal(normalized.vin, manual.vin); assert.equal(normalized.km, null);
  assert.equal(validateManualVehicle({...manual, km:'0'}).km, 0);
});
test('first manual vehicle becomes primary and persists across service instances', async () => {
  const f=fixture(); const added=await f.service.addManual('a',manual);
  const reloaded=await f.build().list('a');
  assert.equal(reloaded.primaryId,added.items[0].id);
  assert.equal(reloaded.items[0].vin,manual.vin);
  assert.equal(reloaded.items[0].isDemo,false);
  assert.deepEqual(reloaded.items[0].history,[]);
});
test('concurrent duplicate VIN submissions save one vehicle', async () => {
  const f=fixture(); const results=await Promise.allSettled([f.service.addManual('a',manual),f.service.addManual('a',{...manual,vin:manual.vin.toLowerCase()})]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal((await f.service.list('a')).items.length,1);
});
test('all five examples hydrate complete histories sorted newest-first', async () => {
  for (const source of catalog.vehicles) {
    const f=fixture(); const state=await f.service.addDemo('a',source.id); const v=state.items[0];
    assert.equal(v.history.length,source.history.length);assert.equal(v.vin,null);assert.equal(v.isDemo,true);
    assert.equal(v.model,source.model);assert.equal(v.km,v.history[0].km);
    assert.deepEqual(v.history.map(s=>s.date),[...v.history.map(s=>s.date)].sort().reverse());
    assert.equal(new Set(v.history.map(s=>s.sourceMaintenanceId)).size,v.history.length);
    assert.ok(!f.data.get(vehicleKey('a')).includes('sourceVinHash'));
  }
});
test('unknown demo and second demo are rejected without changing saved data', async () => {
  const f=fixture();await assert.rejects(f.service.addDemo('a','fake'),/não encontrado/);
  await f.service.addDemo('a',catalog.vehicles[0].id);const saved=f.data.get(vehicleKey('a'));
  await assert.rejects(f.service.addDemo('a',catalog.vehicles[1].id),/já tem/);
  assert.equal(f.data.get(vehicleKey('a')),saved);
});
test('primary selection and removal keep a valid remaining selection', async () => {
  const f=fixture();const first=await f.service.addManual('a',manual);
  const added=await f.service.addDemo('a',catalog.vehicles[0].id);const demoId=added.items[1].id;
  await f.service.setPrimary('a',demoId);assert.equal((await f.build().list('a')).primaryId,demoId);
  const remaining=await f.service.remove('a',demoId);assert.equal(remaining.primaryId,first.primaryId);
  const empty=await f.service.remove('a',first.primaryId);assert.equal(empty.primaryId,null);assert.deepEqual(empty.items,[]);
});
test('accounts have isolated vehicles, primary selection and remove operations', async () => {
  const f=fixture();const a=await f.service.addManual('a',manual);f.setSession('b');
  assert.deepEqual((await f.service.list('b')).items,[]);
  const b=await f.service.addDemo('b',catalog.vehicles[0].id);
  await assert.rejects(f.service.remove('b',a.primaryId),/não encontrado/);
  await assert.rejects(f.service.list('a'),/Entre novamente/);
  f.setSession('a');assert.equal((await f.service.list('a')).primaryId,a.primaryId);
  assert.notEqual(a.primaryId,b.primaryId);
});
test('logout blocks reads and writes', async () => {
  const f=fixture();f.setSession(null);
  await assert.rejects(f.service.list('a'),/Entre novamente/);
  await assert.rejects(f.service.addManual('a',manual),/Entre novamente/);
  assert.equal(f.data.size,0);
});
test('session change during mutation prevents saving to old account', async () => {
  const f=fixture();f.faults.afterRead=()=>f.setSession('b');
  await assert.rejects(f.service.addManual('a',manual),/Entre novamente/);assert.equal(f.data.size,0);
});
test('failed writes preserve existing vehicles and permit retry', async () => {
  const f=fixture();const state=await f.service.addManual('a',manual);const raw=f.data.get(vehicleKey('a'));f.faults.write=true;
  await assert.rejects(f.service.remove('a',state.primaryId),/salvar/);assert.equal(f.data.get(vehicleKey('a')),raw);
  await assert.rejects(f.service.addDemo('a',catalog.vehicles[0].id),/salvar/);assert.equal(f.data.get(vehicleKey('a')),raw);
  f.faults.write=false;assert.equal((await f.service.remove('a',state.primaryId)).items.length,0);
});
test('corrupt records fail closed without overwriting the source', async () => {
  const f=fixture();f.data.set(vehicleKey('a'),'{broken');
  await assert.rejects(f.service.list('a'),/preservados/);
  await assert.rejects(f.service.addManual('a',manual),/preservados/);assert.equal(f.data.get(vehicleKey('a')),'{broken');
});
test('a forged account key or primary vehicle is rejected', async () => {
  const f=fixture();await f.service.addManual('a',manual);
  const state=JSON.parse(f.data.get(vehicleKey('a')));state.primaryId='missing';f.data.set(vehicleKey('a'),JSON.stringify(state));
  await assert.rejects(f.service.list('a'),/preservados/);
  state.primaryId=state.items[0].id;state.accountId='b';f.data.set(vehicleKey('a'),JSON.stringify(state));
  await assert.rejects(f.service.list('a'),/preservados/);
});
test('storage read failure leaves data untouched and gives a recoverable error', async () => {
  const f=fixture();f.faults.read=true;await assert.rejects(f.service.list('a'),/carregar/);
  f.faults.read=false;assert.deepEqual((await f.service.list('a')).items,[]);
});
