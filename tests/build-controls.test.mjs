import test from 'node:test';
import assert from 'node:assert/strict';
import {commentConfig} from '../src/helpers/comments.js';
import {compileTikzBlocks,tikzLimits} from '../src/helpers/tikz-plugin.js';
test('one comment configuration controls global enable and per-note opt-out',()=>{
  const env={GISCUS_ENABLED:'true',GISCUS_REPO:'owner/test',GISCUS_CATEGORY_ID:'custom'};
  assert.equal(commentConfig({},env).repo,'owner/test');
  assert.equal(commentConfig({},env).categoryId,'custom');
  assert.equal(commentConfig({},env).enabled,true);
  assert.equal(commentConfig({comments:false},env).enabled,false);
  assert.equal(commentConfig({dgShowComments:false},env).enabled,false);
  assert.equal(commentConfig({comments:true},{GISCUS_ENABLED:'false'}).enabled,false);
});
test('TikZ worker pool bounds concurrency and preserves failures without dropping work',async()=>{
  let active=0,max=0;
  const results=await compileTikzBlocks(Array.from({length:7},(_,i)=>({code:i})),'.',async(i)=>{
    active++;max=Math.max(max,active);
    await new Promise(resolve=>setTimeout(resolve,5)); active--;
    if(i===3) throw new Error('fixture failure'); return String(i);
  });
  assert.ok(max<=tikzLimits().concurrency);assert.equal(results.length,7);
  assert.equal(results[3].status,'rejected');assert.equal(results[6].value,'6');
  assert.deepEqual(tikzLimits({TIKZ_TIMEOUT_MS:'999999',TIKZ_CONCURRENCY:'99'}),{timeout:120000,concurrency:4});
  assert.deepEqual(tikzLimits({TIKZ_TIMEOUT_MS:'no',TIKZ_CONCURRENCY:'0'}),{timeout:30000,concurrency:2});
});

// An actual external process is killed by the compiler timeout, not just a mocked timer.
test('TikZ terminates a hung compiler, including paths with spaces', async()=>{
  const {default:fs}=await import('node:fs');
  const {default:os}=await import('node:os');
  const {default:path}=await import('node:path');
  const {compileTikzToSvg}=await import('../src/helpers/tikz-plugin.js');
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'tikz timeout '));
  const previousPath=process.env.PATH,previousTimeout=process.env.TIKZ_TIMEOUT_MS;
  try {
    fs.writeFileSync(path.join(root,'latex'),`#!${process.execPath}\nsetInterval(()=>{},1000);\n`,{mode:0o755});
    process.env.PATH=root+path.delimiter+previousPath;process.env.TIKZ_TIMEOUT_MS='100';
    const start=Date.now();
    assert.equal(await compileTikzToSvg('fixture',path.join(root,'output svg')),null);
    assert.ok(Date.now()-start<5000);
  } finally {
    process.env.PATH=previousPath;
    if(previousTimeout===undefined)delete process.env.TIKZ_TIMEOUT_MS;else process.env.TIKZ_TIMEOUT_MS=previousTimeout;
    fs.rmSync(root,{recursive:true,force:true});
  }
});
