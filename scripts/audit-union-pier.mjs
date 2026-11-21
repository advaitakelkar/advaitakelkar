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
    assert.equal(await page.locator('[data-up-open]').count(),111);
    assert.equal(await page.locator('.up-doc-chapter').count(),11);
    assert.equal(await page.locator('[data-up-slider]').count(),20);
    assert.equal(await page.locator('#up-transformation [data-up-slide]').count(),11);
    assert.equal(await page.locator('#up-blocks [data-up-slide]').count(),21);
    const urls=await page.locator('[data-up-open]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
    assert.deepEqual([...urls].sort(),renders.map(r=>r.src).sort());
    if(process.env.UP_SCREENSHOTS) await page.screenshot({path:`review/union-pier/intro-${width}.png`});
    await page.getByRole('link',{name:'07 Before / proposed',exact:true}).click();
    await page.locator('#up-transformation .up-sl-figure img').first().waitFor({state:'visible'});
    if(process.env.UP_SCREENSHOTS) { await page.waitForTimeout(800); await page.screenshot({path:`review/union-pier/before-after-${width}.png`}); }
    // Every slider walks to its last stop and the page never scrolls sideways on the way.
    for(const slider of await page.locator('[data-up-slider]').all()) {
      const next=slider.locator('[data-up-step="1"]');
      if(!(await next.count()) || !(await next.isVisible())) continue;
      await next.scrollIntoViewIfNeeded();
      for(let guard=0; guard<30 && await next.isEnabled(); guard++) { await next.click(); await page.waitForTimeout(120); }
      const [at,total]=(await slider.locator('[data-up-count]').innerText()).split(' / ').map(Number);
      assert.equal(at,total,'Slider did not reach its last stop');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Slider makes the page overflow');
    }
    for(const src of urls) { const response=await page.request.get(base+src);assert.equal(response.status(),200,src);assert.match(response.headers()['content-type'],/image\/webp/);await response.dispose(); }
    const opener=page.locator('[data-up-open]').first();
    await opener.click();
    const dialog=page.getByRole('dialog',{name:'Union Pier drawing viewer'});
    assert.equal(await dialog.isVisible(),true);
    assert.match(await dialog.locator('[data-up-viewer-caption]').innerText(),/^1 \/ 111/);
    await dialog.getByRole('button',{name:'Next drawing',exact:true}).click();
    assert.match(await dialog.locator('[data-up-viewer-caption]').innerText(),/^2 \/ 111/);
    await page.keyboard.press('ArrowLeft');
    assert.match(await dialog.locator('[data-up-viewer-caption]').innerText(),/^1 \/ 111/);
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(),false);
    assert.equal(await opener.evaluate(node=>node===document.activeElement),true);
    assert.deepEqual(errors,[]);
    results.push({width,images:111,chapters:11,sliders:20,allImageResponsesValid:true,sliderOverflow:false,viewerKeyboardAndFocus:true});
    await page.close();
  }
  await fs.writeFile('review/union-pier/interactions.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
} finally {await browser.close();}
