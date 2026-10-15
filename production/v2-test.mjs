import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const checks=[];
const check=(name,fn)=>{fn();checks.push({name,passed:true});console.log('PASS',name);};
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const capture=JSON.parse(fs.readFileSync('qa/v2/capture2-results.json','utf8'));
const expected=['desktop-projects','desktop-estimate','desktop-invoice','desktop-dashboard','desktop-dashboard-financial','desktop-aiva','mobile-projects','mobile-estimate','mobile-invoice','mobile-invoice-paid','mobile-aiva','mobile-aiva-context'];
check('Actual-source capture provenance and private-preview disclosure',()=>{
 assert.match(capture.sourceRevision,/^[a-f0-9]{40}$/);assert.equal(capture.liveRecording,false);assert.equal(capture.fictionalDemoData,true);assert.equal(capture.realCustomerData,false);assert.equal(capture.aivaAvailability,'Private preview');
});
for(const name of expected)check('Capture integrity: '+name,()=>{
 const c=capture.screenshots.find(s=>s.name===name);assert(c,'Missing manifest entry');
 assert.equal(c.sha256,sha(c.file));assert.deepEqual(c.errors,[]);assert.deepEqual(c.blocked,[]);assert.deepEqual(c.mutationAttempts,[]);assert.equal(c.topbar,1);
 const data=fs.readFileSync(c.file);assert.equal(data.subarray(1,4).toString(),'PNG');const dimensions=[data.readUInt32BE(16),data.readUInt32BE(20)];
 assert.deepEqual(dimensions,name.startsWith('mobile')?[1206,2370]:[2880,1960]);
 assert(!/NaN|\bundefined\b|Invalid Date|Document logo missing|0\.0[16] ×/.test(c.text));
});
const context={window:{},URL,Response,Date,Math:Object.create(Math),Map};vm.createContext(context);vm.runInContext(fs.readFileSync('production/capture2/fixtures.js','utf8'),context);
const f=context.window.__FILM__;
check('Quantity units and estimate arithmetic',()=>{
 for(const line of f.quote.lines)assert.equal(line.amount,line.quantity*line.unitPrice/100);
 assert.equal(f.quote.lines.reduce((s,l)=>s+l.amount,0),1845000);assert.equal(f.quote.total,1845000);assert.equal(f.quote.subtotal+f.quote.taxTotal,f.quote.total);
});
check('Invoice balance and chronological consistency',()=>{
 assert.equal(f.invoice.amountPaid+f.invoice.amountDue,f.invoice.total);assert.equal(f.invoice.status,'paid');
 assert(new Date(f.quote.issueDate)<new Date(f.quote.signature.signedAt));assert(new Date(f.quote.signature.signedAt)<new Date(f.invoice.issueDate));assert(new Date(f.invoice.issueDate)<new Date('2026-10-12'));
});
check('Fictional identities and explicitly unsent draft',()=>{
 assert.match(f.user.email,/@example\.com$/);assert.match(f.contact.email,/@example\.com$/);assert(f.messages.some(m=>m.body.includes('Draft for your review. Not sent.')));
});
const narration=JSON.parse(fs.readFileSync('production/v2-narration.json','utf8'));
check('Narration slots, duration and explicit AY-vuh',()=>{
 assert.equal(narration.length,13);
 narration.forEach((n,i)=>{assert(n.start>=0&&n.end<=96);assert(n.duration<=n.available+.04);if(i)assert(n.start>narration[i-1].end);if(n.text.includes('AIVA'))assert(n.phonemes.includes('ˈeɪvə'));});
 assert.equal(narration.filter(n=>n.phonemes.includes('ˈeɪvə')).length,2);
});
check('Official brand source hashes',()=>{
 const brand=JSON.parse(fs.readFileSync('production/v2-brand-provenance.json','utf8'));for(const a of brand.assets)assert.equal(a.source_sha256,sha(a.source));
});
check('AAC soundtrack delivery',()=>{
 const p=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json','public/audio/v2/master.m4a'],{encoding:'utf8'}));
 assert.equal(p.streams[0].codec_name,'aac');assert.equal(p.streams[0].channels,2);assert.equal(Number(p.streams[0].sample_rate),48000);assert(Math.abs(Number(p.format.duration)-96)<.04);
});
check('Composition duration and source asset requirements',()=>{
 const film=fs.readFileSync('src/v2-film.tsx','utf8');assert(film.includes('V2_SECONDS = 96'));assert(film.includes('V2_FPS = 30'));assert(!film.includes('aiva-mask-robot.png'));assert(film.includes('aiva-dark-complete.png'));assert(film.includes('audio/v2/master.m4a'));
});
fs.writeFileSync('qa/v2/tests.json',JSON.stringify({passed:true,checks:checks.length,results:checks},null,2)+'\n');
console.log(`All ${checks.length} checks passed.`);
