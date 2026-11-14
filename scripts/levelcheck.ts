/**
 * Check the published levels against the published formula, using only public data: the daily snapshot (each board's level and its parts)
 * and, when given, the snapshot from the day before (for the 0.6 hold). Used by scripts/check-levels.ts and by the tests.
 *
 * The parts are rounded to two places when stored, so every comparison allows for that. A problem means the numbers do not fit the
 * formula within that rounding; it is a question to ask, not a verdict.
 */
export interface PublicLevelParts{v:number;checks:number;uptime:number;reliability:number;docs:number;age:number;stability:number;trust:number;quality:number;raw:number;penalty:number;adjusted:number;caps:string[];level:number}

/** The parts that are public on every board page, without the improvement tips. Null when the stored copy is missing or malformed. */
export function publicLevelParts(stored:string|null|undefined):PublicLevelParts|null{
 if(!stored)return null;
 try{
  const p=JSON.parse(stored) as Partial<PublicLevelParts>;
  const n=(x:unknown)=>typeof x==='number'&&Number.isFinite(x);
  if(![p.v,p.checks,p.uptime,p.reliability,p.docs,p.age,p.stability,p.trust,p.quality,p.raw,p.penalty,p.level].every(n)||!Array.isArray(p.caps))return null;
  return {v:p.v!,checks:p.checks!,uptime:p.uptime!,reliability:p.reliability!,docs:p.docs!,age:p.age!,stability:p.stability!,trust:p.trust!,quality:p.quality!,raw:p.raw!,penalty:p.penalty!,adjusted:n(p.adjusted)?p.adjusted!:Math.round((p.raw!-p.penalty!)*100)/100,caps:p.caps.filter((c):c is string=>typeof c==='string'),level:p.level!};
 }catch{return null;}
}

export interface SnapshotLike{boards:{slug:string;level:number|null;level_parts?:PublicLevelParts|null}[]}
export interface LevelProblem{slug:string;message:string}
export interface LevelCheck{checked:number;skipped:number;problems:LevelProblem[]}

const NEW_CAP=8,OFFLINE_CAP=3,HOLD=.6;
const close=(a:number,b:number,tol:number)=>Math.abs(a-b)<=tol;
const clamp=(x:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,x));

/** The levels that are acceptable for a score of s given yesterday's level: rounding of the stored parts can move s by about 0.1. */
export function allowedLevels(s:number,prev:number,caps:string[]):Set<number>{
 const out=new Set<number>();
 for(const x of [s-.1,s,s+.1]){
  let level=prev>0&&Math.abs(x-prev)<HOLD?prev:Math.round(x);
  if(caps.includes('offline')&&level>OFFLINE_CAP)level=OFFLINE_CAP;
  if(caps.includes('new')&&level>NEW_CAP)level=NEW_CAP;
  out.add(Math.round(clamp(level,1,20)));
 }
 return out;
}

export function checkLevels(today:SnapshotLike,yesterday?:SnapshotLike|null):LevelCheck{
 const before=new Map((yesterday?.boards||[]).map(b=>[b.slug,b.level||0]));
 const problems:LevelProblem[]=[];let checked=0,skipped=0;
 for(const b of today.boards){
  const p=b.level_parts;
  if(!p){skipped++;continue;}
  checked++;
  const bad=(message:string)=>problems.push({slug:b.slug,message});
  const quality=.4*p.docs+.3*p.age+.2*p.stability+.1*p.trust;
  if(!close(quality,p.quality,.02))bad(`quality ${p.quality} does not fit 0.4 docs + 0.3 age + 0.2 stability + 0.1 trust (${quality.toFixed(3)})`);
  const reliability=clamp((p.uptime-.5)/.5,0,1)**2;
  if(!close(reliability,p.reliability,.02))bad(`reliability ${p.reliability} does not fit uptime ${p.uptime} (${reliability.toFixed(3)})`);
  const raw=1+19*p.quality*p.reliability;
  if(!close(raw,p.raw,.15))bad(`raw ${p.raw} does not fit 1 + 19 x quality x reliability (${raw.toFixed(2)})`);
  if(p.penalty<0||p.penalty>3.0001)bad(`penalty ${p.penalty} is outside 0 to 3`);
  const s=p.raw-p.penalty,prev=before.get(b.slug)||0;
  const level=b.level??p.level;
  if(level!==p.level)bad(`snapshot level ${level} differs from the level in its parts (${p.level})`);
  const ok=allowedLevels(s,yesterday&&prev>0?prev:0,p.caps);
  // Without yesterday's snapshot the hold cannot be checked, so a level next to the rounded score is also accepted.
  if(!yesterday||prev===0){for(const d of [-1,1])for(const x of [...ok])ok.add(clamp(x+d,1,20));if(!p.caps.length&&Math.abs(level-s)>1.2)bad(`level ${level} is far from the score ${s.toFixed(2)}`);}
  else if(!ok.has(level))bad(`level ${level} does not follow from score ${s.toFixed(2)}, yesterday's level ${prev} and caps [${p.caps.join(',')}]`);
  if(p.caps.includes('offline')&&level>OFFLINE_CAP)bad(`an offline board is above level ${OFFLINE_CAP}`);
  if(p.caps.includes('new')&&level>NEW_CAP)bad(`a new board is above level ${NEW_CAP}`);
 }
 return {checked,skipped,problems};
}
