const puppeteer = require('puppeteer');
const mocha = require('mocha');
const assert = require('assert');
const { promisify } = require('util');
const path = require('path');
const timeout = promisify(setTimeout);
describe('单元测试', () => {
  /** @type {puppeteer.Browser} */
  let browser;
  /** @type {puppeteer.Page} */
  let page;
  const fileUrl = 'file://' + path.resolve(__dirname, '..', 'index.svg');

  before (async () => {
    browser = await puppeteer.launch({headless: false});
  });

  beforeEach(async function() {
    this.timeout(60000);
    page = await browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 1000,
    });
    await page.goto(fileUrl);
  });

  describe('游戏开始测试', async () => {
    beforeEach(async () => {
      await page.keyboard.down('Space');
    })

    it('按任意键开始游戏方块下落应该成功', async () => {
      const actives = await page.evaluate(x => {
        return document.querySelectorAll('.active').length;
      })
      assert.equal(actives, 4);
    })

    it('按任意键开始游戏下一方块出现应该成功', async () => {
      const nexts = await page.evaluate(x => {
        return document.querySelectorAll('.next-shape').length;
      })
      assert.equal(nexts, 4);
    })
  })

  describe('方块垂直下落测试', async () => {
    beforeEach(async () => {
      await page.keyboard.down('Space');
    })

    it('碰到底部停止应该正确', async () => {
      await timeout(10000);
      const position = await page.evaluate(x => {
        const fixRects = Array.from(document.querySelectorAll('.fix'));
        for (const rect of fixRects) {
          let [, x, y] = /(.*)\_(.*)/.exec(rect.getAttribute('fix-field')).map(x => +x);
          if (y >= 20) {
            return 'false';
          }
        }
        return 'true';
      });
      assert.equal(position, 'true');
    })

    it('碰到其他元素停止应该正确', async () => {

    })
  })
})
