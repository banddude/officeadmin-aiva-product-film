import {mkdir,writeFile} from 'node:fs/promises';
// Font binaries are intentionally not distributed with this project.
const url='https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/InterVariable.woff2';
const response=await fetch(url);
if(!response.ok)throw new Error(`Could not download Inter: HTTP ${response.status}`);
const bytes=new Uint8Array(await response.arrayBuffer());
if(bytes.byteLength<10000)throw new Error('The font download is unexpectedly small.');
await mkdir('public/fonts',{recursive:true});
await writeFile('public/fonts/Inter.woff2',bytes);
console.log('Inter variable font prepared for local rendering.');
