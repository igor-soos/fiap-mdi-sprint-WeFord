import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const code=await readFile(new URL('../src/services/loyaltyCore.js',import.meta.url),'utf8');
const {createLoyaltyService,walletKey,summarize}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const catalog=JSON.parse(await readFile(new URL('../src/data/demoVehicles.json',import.meta.url),'utf8'));
function fixture(customCatalog=catalog){
  const data=new Map(),linked=new Map([['a',['DEMO-003']]]);let session='a';
  const faults={read:false,write:false,afterVehicles:null};
  const storage={getItem:async k=>{if(faults.read)throw Error();return data.get(k)??null;},setItem:async(k,v)=>{if(faults.write)throw Error();data.set(k,v);}};
  const build=()=>createLoyaltyService({storage,catalog:customCatalog,getSessionAccountId:async()=>session,
    getDemoIds:async id=>{faults.afterVehicles?.();return linked.get(id)??[];},now:()=> '2026-09-11T12:00:00Z'});
  return{data,linked,faults,build,service:build(),setSession:s=>session=s};
}
test('Ranger history credits 5000 once, persists and yields Gold',async()=>{
  const f=fixture();const w=await f.service.sync('a');assert.equal(w.entries.length,5);assert.equal(summarize(w).balance,5000);assert.equal(summarize(w).level,'Gold');
  assert.equal((await f.build().sync('a')).entries.length,5);
  assert.equal((await f.service.sync('a')).entries.length,5);
});
test('empty or manual-only collection awards no points',async()=>{
  const f=fixture();f.linked.set('a',[]);assert.equal(summarize(await f.service.sync('a')).balance,0);
  await assert.rejects(f.service.redeem('a','review','request-0001'),/insuficientes/);
});
test('redemption deducts balance, persists receipt and preserves earned level',async()=>{
  const f=fixture();const w=await f.service.redeem('a','review','request-0001');
  assert.equal(summarize(w).balance,4000);assert.equal(summarize(w).earned,5000);assert.equal(summarize(w).level,'Gold');
  assert.equal(w.entries.at(-1).coupon,'DEMO-REQUEST-0001');assert.deepEqual(await f.build().sync('a'),w);
});
test('same request retry is idempotent, reused ID for another offer is rejected',async()=>{
  const f=fixture();const first=await f.service.redeem('a','review','request-0001');
  assert.deepEqual(await f.service.redeem('a','review','request-0001'),first);
  await assert.rejects(f.service.redeem('a','gifts','request-0001'),/já utilizado/);
});
test('concurrent duplicate resgates debit only once',async()=>{
  const f=fixture();const result=await Promise.allSettled([f.service.redeem('a','review','request-0001'),f.service.redeem('a','review','request-0002')]);
  assert.equal(result.filter(r=>r.status==='fulfilled').length,1);assert.equal(summarize(await f.service.sync('a')).balance,4000);
});
test('competing different offers cannot overspend',async()=>{
  const f=fixture();f.linked.set('a',['DEMO-001']);
  const r=await Promise.allSettled([f.service.redeem('a','gifts','request-0001'),f.service.redeem('a','tires','request-0002')]);
  assert.equal(r.filter(x=>x.status==='fulfilled').length,1);assert.equal(summarize(await f.service.sync('a')).balance,1000);
});
test('removing/readding same example preserves debits and does not renew credits',async()=>{
  const f=fixture();await f.service.redeem('a','review','request-0001');
  f.linked.set('a',[]);assert.equal(summarize(await f.service.sync('a')).balance,4000);
  f.linked.set('a',['DEMO-003']);assert.equal(summarize(await f.service.sync('a')).balance,4000);
  await assert.rejects(f.service.redeem('a','review','request-0002'),/já foi resgatada/);
});
test('another example adds new unique credits without resetting prior history',async()=>{
  const f=fixture();await f.service.redeem('a','review','request-0001');f.linked.set('a',['DEMO-001']);
  const w=await f.service.sync('a');assert.equal(summarize(w).balance,7000);assert.equal(summarize(w).earned,8000);
  f.linked.set('a',['DEMO-003']);assert.equal(summarize(await f.service.sync('a')).balance,7000);
});
test('two accounts have independent points and receipts',async()=>{
  const f=fixture();await f.service.redeem('a','review','request-0001');f.setSession('b');f.linked.set('b',['DEMO-003']);
  const b=await f.service.sync('b');assert.equal(summarize(b).balance,5000);assert.ok(!b.entries.some(e=>e.kind==='redemption'));
  await assert.rejects(f.service.sync('a'),/Entre novamente/);f.setSession('a');assert.equal(summarize(await f.service.sync('a')).balance,4000);
});
test('write failure cannot confirm redemption; retry debits once',async()=>{
  const f=fixture();await f.service.sync('a');const original=f.data.get(walletKey('a'));f.faults.write=true;
  await assert.rejects(f.service.redeem('a','review','request-0001'),/salvar/);assert.equal(f.data.get(walletKey('a')),original);
  f.faults.write=false;assert.equal(summarize(await f.service.redeem('a','review','request-0001')).balance,4000);
});
test('initial sync failure leaves no partially credited wallet',async()=>{
  const f=fixture();f.faults.write=true;await assert.rejects(f.service.sync('a'),/salvar/);assert.equal(f.data.size,0);
  f.faults.write=false;assert.equal(summarize(await f.service.sync('a')).balance,5000);
});
test('logout or session change before save blocks a mutation',async()=>{
  const f=fixture();f.setSession(null);await assert.rejects(f.service.sync('a'),/Entre novamente/);
  f.setSession('a');f.faults.afterVehicles=()=>f.setSession('b');await assert.rejects(f.service.redeem('a','review','request-0001'),/Entre novamente/);assert.equal(f.data.size,0);
});
test('unknown offer/request rejected and corrupt wallet preserved',async()=>{
  const f=fixture();await assert.rejects(f.service.redeem('a','unknown','request-0001'),/não encontrada/);
  await assert.rejects(f.service.redeem('a','review','x'),/inválido/);
  f.data.set(walletKey('a'),'{bad');await assert.rejects(f.service.sync('a'),/preservados/);assert.equal(f.data.get(walletKey('a')),'{bad');
});
test('forged credit amounts or account IDs fail closed',async()=>{
  const f=fixture();const w=await f.service.sync('a');w.entries[0].points=9999;f.data.set(walletKey('a'),JSON.stringify(w));
  await assert.rejects(f.service.sync('a'),/preservados/);w.entries[0].points=1000;w.accountId='b';f.data.set(walletKey('a'),JSON.stringify(w));await assert.rejects(f.service.sync('a'),/preservados/);
});
test('source ID and dealer/order repetitions do not inflate credits',async()=>{
  const c=structuredClone(catalog),v=c.vehicles[2],s=v.history[0];v.history.push({...s},{...s,sourceMaintenanceId:'another'});
  const f=fixture(c);assert.equal(summarize(await f.service.sync('a')).balance,5000);
});
test('all level boundaries and progress reflect lifetime earnings',()=>{
  for(const [earned,level] of [[0,'Bronze'],[2999,'Bronze'],[3000,'Silver'],[4999,'Silver'],[5000,'Gold'],[9999,'Gold'],[10000,'Platinum']]){
    const s=summarize({entries:[{kind:'credit',points:earned}]});assert.equal(s.level,level);assert.ok(s.progress>=0&&s.progress<=1);
  }
});
