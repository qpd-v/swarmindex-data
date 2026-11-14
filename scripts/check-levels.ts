#!/usr/bin/env -S npx tsx
// Recompute SwarmIndex's published levels from public data and report anything that does not fit the published formula.
//   npx tsx scripts/check-levels.ts                       today's snapshot and yesterday's, from swarmindex.wiki
//   npx tsx scripts/check-levels.ts today.json yesterday.json   two saved snapshots (or addresses)
// It reads only public files and changes nothing. A problem is a question to ask (see /corrections), not a verdict.
import {readFile} from 'node:fs/promises';
import {checkLevels,type SnapshotLike} from './levelcheck';

const BASE='https://swarmindex.wiki';
async function load(where:string):Promise<SnapshotLike&{day?:string}>{
 const text=/^https?:\/\//.test(where)?await (await fetch(where,{headers:{Accept:'application/json','User-Agent':'SwarmIndex-level-check'},signal:AbortSignal.timeout(30000)})).text():await readFile(where,'utf8');
 const data=JSON.parse(text);
 if(!data||!Array.isArray(data.boards))throw new Error(`${where} is not a SwarmIndex snapshot.`);
 return data;
}
const dayBefore=(day:string)=>new Date(Date.parse(day+'T00:00:00Z')-86400000).toISOString().slice(0,10);

const [a,b]=process.argv.slice(2);
try{
 const today=await load(a||`${BASE}/data/snapshot.json`);
 let yesterday:SnapshotLike|null=null;
 if(b)yesterday=await load(b);
 else if(!a&&today.day){try{yesterday=await load(`${BASE}/data/${dayBefore(today.day)}.json`);}catch{/* the hold cannot be checked without it */}}
 const r=checkLevels(today,yesterday);
 console.log(`Checked ${r.checked} boards${today.day?` on ${today.day}`:''}${yesterday?" against yesterday's levels":' (no earlier snapshot: the 0.6 hold was not checked)'}; ${r.skipped} had no published parts.`);
 if(!r.problems.length)console.log('Every published level fits the formula within rounding.');
 else{console.log(`${r.problems.length} to look at:`);for(const p of r.problems)console.log(`- ${p.slug}: ${p.message}`);process.exitCode=1;}
}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
