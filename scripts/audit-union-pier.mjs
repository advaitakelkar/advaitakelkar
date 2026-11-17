import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.SHOOT_BASE ?? 'http://127.0.0.1:4336';
const renders = JSON.parse(await fs.readFile('src/data/union-pier-renders.json','utf8'));
const browser = await chromium.launch();
await fs.mkdir('review/union-pier',{recursive:true});
const results=[];
try {
  for(const width of [390,834,1440]) {
    const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce',colorScheme:'light'});
    await page.addInitScript(()=>{sessionStorage.setItem('aks','default');});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(base+'/projects/union-pier-charleston/',{waitUntil:'networkidle'});
    assert.equal(await page.locator('[data-up-open]').count(),91);
    assert.equal(await page.locator('.up-doc-chapter').count(),8);
    assert.equal(await page.locator('#up-transformation .up-doc-item--pair').count(),5);
    assert.equal(await page.locator('#up-blocks .up-doc-item--pair').count(),9);
    const urls=await page.locator('[data-up-open]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
    assert.deepEqual([...urls].sort(),renders.map(r=>r.src).sort());
    if(process.env.UP_SCREENSHOTS) await page.screenshot({path:`review/union-pier/intro-${width}.png`});
    await page.getByRole('link',{name:'02 Before / after',exact:true}).click();
    await page.locator('#up-transformation .up-doc-figure img').first().waitFor({state:'visible'});
    if(process.env.UP_SCREENSHOTS) { await page.waitForTimeout(800); await page.screenshot({path:`review/union-pier/before-after-${width}.png`}); }
    for(const summary of await page.locator('.up-doc-more summary').all()) {
      await summary.click();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Expanded page overflows');
      await summary.click();
    }
    for(const src of urls) { const response=await page.request.get(base+src);assert.equal(response.status(),200,src);assert.match(response.headers()['content-type'],/image\/webp/);await response.dispose(); }
    const opener=page.locator('[data-up-open]').first();
    await opener.click();
    const dialog=page.getByRole('dialog',{name:'Union Pier drawing viewer'});
    assert.equal(await dialog.isVisible(),true);
    assert.match(await dialog.locator('[data-up-viewer-caption]').innerText(),/^1 \/ 91/);
    await dialog.getByRole('button',{name:'Next drawing',exact:true}).click();
    assert.match(await dialog.locator('[data-up-viewer-caption]').innerText(),/^2 \/ 91/);
    await page.keyboard.press('ArrowLeft');
    assert.match(await dialog.locator('[data-up-viewer-caption]').innerText(),/^1 \/ 91/);
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(),false);
    assert.equal(await opener.evaluate(node=>node===document.activeElement),true);
    assert.deepEqual(errors,[]);
    results.push({width,images:91,chapters:8,pairs:14,allImageResponsesValid:true,expandedOverflow:false,viewerKeyboardAndFocus:true});
    await page.close();
  }
  await fs.writeFile('review/union-pier/interactions.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
} finally {await browser.close();}
