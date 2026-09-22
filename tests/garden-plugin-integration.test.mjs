import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import loader from '../src/helpers/pluginLoader.cjs';

// Real Eleventy builds, isolated from the working tree and preview server.
test('Garden interface renders slots, settings, hooks, assets and navigation; disabling removes outputs without touching math', {timeout:120000}, () => {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'garden-contract-'));
 const source=process.cwd();
 try {
  execFileSync('rsync',['-a','--exclude=.git','--exclude=node_modules','--exclude=dist',source+'/',root+'/']);
  fs.symlinkSync(path.join(source,'node_modules'),path.join(root,'node_modules'));
  const write=(name,value)=>{const f=path.join(root,name);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,value);};
  const read=name=>fs.readFileSync(path.join(root,name),'utf8');
  // Exercise index layout as well as notes without changing production content.
  write('src/site/notes/README.md',read('src/site/notes/README.md').replace('"dg-home":true','"dg-home":true,"tags":["gardenEntry","note"]'));
  const slots={};
  for(const slot of loader.KNOWN_SLOTS){slots[slot]=`${slot}.njk`;write(`src/plugins/contract/${slot}.njk`,`<span data-contract="${slot}">{{pluginSettings.greeting}}:{{settings.contractFlag}}</span>`);}
  write('src/plugins/contract/garden-plugin.json',JSON.stringify({id:'contract',name:'Contract',version:'1',description:'Integration fixture',author:'Test',slots,settings:[{key:'greeting',default:'default'}],noteSettings:['contractFlag'],hooks:'index.js',styles:['style.scss'],scripts:['script.js'],assets:['asset.txt']}));
  write('src/plugins/contract/style.scss','.contract { color: red; }');
  write('src/plugins/contract/script.js','/* contract script */');
  write('src/plugins/contract/asset.txt','contract asset');
  write('src/plugins/contract/index.js',`module.exports={setupMarkdown(md){md.core.ruler.push('contract',state=>{for(const t of state.tokens)if(t.type==='inline')for(const c of t.children||[])if(c.type==='text')c.content=c.content.replaceAll('CONTRACT_TOKEN','HOOK_OK');});},setupEleventy(c){c.addTemplate('contract-hook.njk','HOOK_OUTPUT',{permalink:'/contract-hook.txt'});}};`);
  write('src/site/notes/contract.md','---\ntags: [note]\npermalink: /contract/\ncontractFlag: true\n---\nCONTRACT_TOKEN and $q$\n');
  write('src/site/notes/no-comments.md','---\ntags: [note]\npermalink: /no-comments/\ncomments: false\n---\nNo comments here.\n');
  const registry={plugins:{'dg-search':{enabled:true},'dg-link-preview':{enabled:true},'dg-math':{enabled:false},contract:{settings:{greeting:'configured'}}}};
  const build=(extraEnv={})=>{fs.rmSync(path.join(root,'dist'),{force:true,recursive:true});write('src/plugins/plugins.json',JSON.stringify(registry));execFileSync(process.execPath,[path.join(source,'node_modules/@11ty/eleventy/cmd.cjs')],{cwd:root,env:{...process.env,ELEVENTY_ENV:'prod',SOURCE_DATE_EPOCH:'1700000000',TIKZ_STRICT:'1',GISCUS_ENABLED:'true',...extraEnv},stdio:'pipe',timeout:90000});};
  build();
  let note=read('dist/contract/index.html'), home=read('dist/index.html');
  assert.match(home,/id="giscus-container"/);
  assert.doesNotMatch(read('dist/no-comments/index.html'),/id="giscus-container"|class="comments-shortcut"/);
  for(const slot of loader.KNOWN_SLOTS){assert.ok((slot.startsWith('index.')?home:note).includes(`data-contract="${slot}"`),slot);}
  assert.match(note,/configured:true/);assert.match(note,/HOOK_OK/);assert.match(note,/<mjx-container/);assert.equal(note.includes('id="giscus-container"'),note.includes('class="comments-shortcut"'));
  assert.equal(read('dist/contract-hook.txt'),'HOOK_OUTPUT');assert.match(read('dist/plugins/contract/style.css'),/color:red/);assert.equal(read('dist/plugins/contract/asset.txt'),'contract asset');
  assert.match(note,/src="\/plugins\/contract\/script.js"/);
  assert.equal((note.match(/id="globalsearch"/g)||[]).length,1);assert.equal((note.match(/id="tooltip-wrapper"/g)||[]).length,1);
  assert.ok(JSON.parse(read('dist/searchIndex.json')).some(x=>x.url==='/contract/'));
  // Exclusive region replacement and independent plugin disable switches.
  const manifest=JSON.parse(read('src/plugins/contract/garden-plugin.json'));manifest.regions={navigation:'navigation.njk'};write('src/plugins/contract/garden-plugin.json',JSON.stringify(manifest));write('src/plugins/contract/navigation.njk','<nav id="contract-nav">Replacement navigation</nav>');
  registry.plugins['dg-search'].enabled=false;registry.plugins['dg-link-preview'].enabled=false;
  build();note=read('dist/contract/index.html');
  assert.match(note,/id="contract-nav"/);assert.doesNotMatch(note,/class="filetree-sidebar"/);assert.doesNotMatch(note,/id="globalsearch"|id="tooltip-wrapper"/);assert.ok(!fs.existsSync(path.join(root,'dist/searchIndex.json')));assert.match(note,/<mjx-container/);
  registry.plugins.contract.enabled=false;build({GISCUS_ENABLED:"false"});note=read('dist/contract/index.html');
  assert.doesNotMatch(note,/id="giscus-container"|class="comments-shortcut"/);
  assert.doesNotMatch(note,/data-contract=|contract-nav|HOOK_OK/);assert.match(note,/CONTRACT_TOKEN/);assert.match(note,/<mjx-container/);assert.ok(!fs.existsSync(path.join(root,'dist/contract-hook.txt')));
  write('src/site/notes/bad-tikz.md','---\ntags: [note]\n---\n```tikz\n\\notARealTeXCommand\n```\n');
  assert.throws(()=>build({TIKZ_STRICT:'0'}),error=>{assert.match(String(error.stdout)+String(error.stderr),/diagram\(s\) failed to compile/);return true;});
 } finally {fs.rmSync(root,{recursive:true,force:true});}
});
