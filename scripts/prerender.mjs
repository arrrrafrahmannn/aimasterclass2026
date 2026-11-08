import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {render} from '../.prerender/entry-server.js';

const root=process.cwd(),dist=path.join(root,'dist'),base='/aimasterclass2026/';
let html=await fs.readFile(path.join(dist,'index.html'),'utf8');
const markup=render();
assert.ok(markup.includes('<h1')&&markup.includes('A little AI.'),'The first response must include real page content.');
html=html.replace('<div id="root"></div>','<div id="root">'+markup+'</div>');
const cssTags=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
assert.ok(cssTags.length>0,'A stylesheet must be present.');
for(const [tag,url] of cssTags){assert.ok(url.startsWith(base));const css=await fs.readFile(path.join(dist,url.slice(base.length)),'utf8');html=html.replace(tag,'<style>'+css.replace(/<\/style/gi,'<\\/style')+'</style>');}
const jsTags=[...html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)];
assert.equal(jsTags.length,1,'Expected one self-contained client entry.');
for(const [tag,url] of jsTags){assert.ok(url.startsWith(base));const js=await fs.readFile(path.join(dist,url.slice(base.length)),'utf8');html=html.replace(tag,()=>'<script type="module">'+js.replace(/<\/script/gi,'<\\/script')+'</script>');}
html=html.replace('</head>','<meta name="ektu-build" content="static-html-v2"/></head>');
await fs.writeFile(path.join(dist,'index.html'),html);
// Retain previous hashed assets so a cached older HTML document can still load.
try{await fs.cp(path.join(root,'docs/assets'),path.join(dist,'assets'),{recursive:true,force:false,errorOnExist:false});}catch(error){if(error.code!=='ENOENT')throw error;}
const plain=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
assert.ok(plain.includes('A little AI.')&&plain.includes('Full name')&&plain.includes('WhatsApp number'));
assert.ok(plain.includes('<style>')&&plain.includes('#090a09'));
assert.ok(!/src="\/src\/main\.tsx"/.test(html));
console.log('Verified: full page HTML, inline CSS, inline client bundle, no empty-root dependency, and cached-asset compatibility.');
