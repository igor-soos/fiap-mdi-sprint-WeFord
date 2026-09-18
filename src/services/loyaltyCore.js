export const OFFERS = [
  { id: 'review', title: 'Revisão Premium', cost: 1000, benefit: '20% OFF', icon: 'construct', description: 'Cupom fictício de desconto em uma revisão.' },
  { id: 'gifts', title: 'Brindes Ford', cost: 2000, benefit: '1 brinde', icon: 'gift', description: 'Resgate fictício de um brinde Ford.' },
  { id: 'tires', title: 'Troca de pneus', cost: 3000, benefit: '10% OFF', icon: 'car-sport', description: 'Cupom fictício de desconto na troca de pneus.' },
];
export const walletKey = id => `@weford/wallet/v1/${id}`;
export class LoyaltyError extends Error {}
export function summarize(wallet) {
  const entries = wallet?.entries ?? [];
  const earned = entries.filter(e => e.kind === 'credit').reduce((s,e) => s + e.points, 0);
  const balance = entries.reduce((s,e) => s + e.points, 0);
  const tiers = [{name:'Bronze',min:0},{name:'Silver',min:3000},{name:'Gold',min:5000},{name:'Platinum',min:10000}];
  let index=0; tiers.forEach((t,i)=>{if(earned>=t.min)index=i;});
  const tier=tiers[index], next=tiers[index+1];
  return {earned,balance,spent:earned-balance,level:tier.name,nextLevel:next?.name ?? null,
    remaining:next ? next.min-earned : 0,progress:next ? (earned-tier.min)/(next.min-tier.min) : 1};
}
export function createLoyaltyService({ storage, catalog, getDemoIds, getSessionAccountId, now=()=>new Date().toISOString() }) {
  let queue=Promise.resolve();
  const serial=fn=>{const task=queue.then(fn);queue=task.catch(()=>{});return task;};
  const events=new Map();
  for(const v of catalog.vehicles)for(const s of v.history){
    if(s.status!=='(60) Concluded'||s.type!=='Maintenance'||!s.sourceMaintenanceId||!s.dealerCode||!s.sourceServiceOrder)continue;
    const id=`credit:${v.id}:${s.sourceMaintenanceId}`;
    events.set(id,{id,kind:'credit',points:1000,demoId:v.id,model:v.model,modelYear:v.modelYear,
      serviceDate:s.date,maintenanceId:s.sourceMaintenanceId,
      orderKey:`${v.id}:${s.dealerCode}:${s.sourceServiceOrder}`});
  }
  async function authorize(id){
    try{if(id && await getSessionAccountId()===id)return;}catch{}
    throw new LoyaltyError('Entre novamente para acessar seus pontos.');
  }
  async function read(id){
    await authorize(id);let raw;
    try{raw=await storage.getItem(walletKey(id));}catch{throw new LoyaltyError('Não foi possível carregar seus pontos. Tente novamente.');}
    if(raw===null)return {version:1,accountId:id,entries:[]};
    try{
      const state=JSON.parse(raw);
      if(state.version!==1||state.accountId!==id||!Array.isArray(state.entries))throw new Error();
      const ids=new Set(), orders=new Set(), offers=new Set(), requests=new Set();let balance=0;
      for(const e of state.entries){
        if(!e || typeof e.id!=='string'||ids.has(e.id)||!Number.isSafeInteger(e.points)||typeof e.date!=='string'||!Number.isFinite(Date.parse(e.date)))throw new Error();
        ids.add(e.id);
        if(e.kind==='credit'){
          const canonical=events.get(e.id);
          if(!canonical||Object.keys(canonical).some(k=>canonical[k]!==e[k])||orders.has(e.orderKey))throw new Error();
          orders.add(e.orderKey);
        }else if(e.kind==='redemption'){
          const offer=OFFERS.find(o=>o.id===e.offerId);
          if(!offer||e.points!==-offer.cost||offers.has(e.offerId)||typeof e.requestId!=='string'||!e.requestId||requests.has(e.requestId)||e.id!==`redeem:${e.requestId}`||e.coupon!==`DEMO-${e.requestId.toUpperCase()}`)throw new Error();
          offers.add(e.offerId);requests.add(e.requestId);
        }else throw new Error();
        balance+=e.points;if(balance<0||!Number.isSafeInteger(balance))throw new Error();
      }
      return state;
    }catch{throw new LoyaltyError('O extrato salvo não pôde ser lido. Os dados foram preservados.');}
  }
  async function syncEntries(state){
    const demoIds=new Set(await getDemoIds(state.accountId));
    const ids=new Set(state.entries.map(e=>e.id));const orders=new Set(state.entries.filter(e=>e.kind==='credit').map(e=>e.orderKey));
    let changed=false;
    for(const e of events.values())if(demoIds.has(e.demoId)&&!ids.has(e.id)&&!orders.has(e.orderKey)){
      state.entries.push({...e,date:now()});ids.add(e.id);orders.add(e.orderKey);changed=true;
    }
    return changed;
  }
  async function write(state){
    await authorize(state.accountId);
    try{await storage.setItem(walletKey(state.accountId),JSON.stringify(state));}catch{throw new LoyaltyError('Não foi possível salvar os pontos. Nenhum resgate foi confirmado. Tente novamente.');}
    return state;
  }
  return {
    sync:id=>serial(async()=>{const state=await read(id);const changed=await syncEntries(state);await authorize(id);return changed?write(state):state;}),
    redeem:(id,offerId,requestId)=>serial(async()=>{
      if(typeof requestId!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(requestId))throw new LoyaltyError('Identificador de resgate inválido.');
      const offer=OFFERS.find(o=>o.id===offerId);if(!offer)throw new LoyaltyError('Oferta não encontrada.');
      const state=await read(id);
      const previous=state.entries.find(e=>e.requestId===requestId);
      if(previous){if(previous.offerId!==offerId)throw new LoyaltyError('Identificador de resgate já utilizado.');return state;}
      if(state.entries.some(e=>e.offerId===offerId))throw new LoyaltyError('Esta oferta já foi resgatada nesta conta.');
      await syncEntries(state);
      if(summarize(state).balance<offer.cost)throw new LoyaltyError('Pontos insuficientes para este resgate.');
      state.entries.push({id:`redeem:${requestId}`,kind:'redemption',offerId,requestId,
        points:-offer.cost,date:now(),coupon:`DEMO-${requestId.toUpperCase()}`});
      return write(state);
    }),
  };
}
