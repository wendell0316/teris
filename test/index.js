const puppeteer = require('puppeteer');
const mocha = require('mocha');
const assert = require('assert');
const { promisify } = require('util');
const path = require('path');
const timeout = promisify(setTimeout);

async function move(arrow, count) {
  for (let index = 0; index < count; index++) {
    await this.down(arrow);
  }
}

describe('单元测试', () => {
  /** @type {puppeteer.Browser} */
  let browser;
  /** @type {puppeteer.Page} */
  let page;
  const fileUrl = 'file://' + path.resolve(__dirname, '..', 'index.svg');

  before (async () => {
    browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  });

  beforeEach(async function() {
    page = await browser.newPage();
    await page.setViewport({
      width: 1200,
      height: 1000,
    });
    await page.goto(fileUrl);
    await page.evaluate(x => {
      downSpeed = 100000;
    })
  });

  describe('游戏开始测试', async () => {
    beforeEach(async () => {
      await page.keyboard.down('Space');
    });

    it('按任意键开始游戏方块下落应该成功', async () => {
      const actives = await page.evaluate(x => {
        return document.querySelectorAll('.active').length;
      });
      assert.equal(actives, 4);
    });

    it('按任意键开始游戏下一方块出现应该成功', async () => {
      const nexts = await page.evaluate(x => {
        return document.querySelectorAll('.next-shape').length;
      });
      assert.equal(nexts, 4);
    });
  });

  describe('方块下落测试', async () => {
    beforeEach(async () => {
      await page.keyboard.down('Space');
    });

    it('碰到底部停止应该正确', async function() {
      await move.call(page.keyboard, 'ArrowDown', 18);
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
    });

    it('碰到其他元素停止应该正确', async function() {
      const direction = ['ArrowUp', 'ArrowLeft', 'ArrowRight'];
      for (let index = 0; index < 5; index++) {
        await move.call(page.keyboard, direction[Math.trunc(Math.random()*3)], Math.trunc(Math.random()*5));
        await move.call(page.keyboard, 'ArrowDown', 18);
      }
      const previous = await page.evaluate(x => {
        const poss = [...document.querySelectorAll('.fix')].map(rect => rect.getAttribute('fix-field'));
        for (const [index, pos] of poss.sort().entries()) {
          if (pos === poss[index + 1]) {
            return 'false';
          }
        }
        return 'true';
      });
      assert.equal(previous, 'true');
    });

    it('左移或右移应该正确', async function() {
      const oldPos = await page.evaluate(x => {
        return [...document.querySelectorAll('.active')].map(x => +/translate\((.*),(.*)\)/.exec(x.getAttribute('transform'))[1]);
      });
      await page.keyboard.down('ArrowLeft');
      const newLeftPos = await page.evaluate(x => {
        return [...document.querySelectorAll('.active')].map(x => +/translate\((.*),(.*)\)/.exec(x.getAttribute('transform'))[1]);
      });
      await page.keyboard.down('ArrowRight');
      const newRightPos = await page.evaluate(x => {
        return [...document.querySelectorAll('.active')].map(x => +/translate\((.*),(.*)\)/.exec(x.getAttribute('transform'))[1]);
      });
      assert.deepEqual(oldPos, newLeftPos.map(x => x + 20));
      assert.deepEqual(oldPos, newRightPos);
    });
  });

  describe('消除测试', async () => {
    beforeEach(async () => {
      await page.evaluate(x => {
        Math.random=function(){return 0.1};
      });
      await page.keyboard.down('Space');
    });

    it('底行消除分数增加及消除元素成功', async function() {
      await move.call(page.keyboard, 'ArrowRight', 4);
      await move.call(page.keyboard, 'ArrowDown', 18);

      await move.call(page.keyboard, 'ArrowRight', 2);
      await move.call(page.keyboard, 'ArrowDown', 18);

      await move.call(page.keyboard, 'ArrowLeft', 0);
      await move.call(page.keyboard, 'ArrowDown', 18);

      await move.call(page.keyboard, 'ArrowLeft', 2);
      await move.call(page.keyboard, 'ArrowDown', 18);

      await move.call(page.keyboard, 'ArrowLeft', 4);
      await move.call(page.keyboard, 'ArrowDown', 18);

      const remove = await page.evaluate(x => {
        const score = +document.querySelector('.score text').textContent;
        const posY = [...document.querySelectorAll('.fix')].map(x => /(.*)\_(.*)/.exec(x.getAttribute('fix-field'))[2]);
        if (score === 1 && !posY.includes('17')) {
          return 'true';
        } else {
          return 'false';
        }
      });
      assert.equal(remove, 'true');
    });

    it('顶部方块消除应该正确', async () => {
       await move.call(page.keyboard, 'ArrowUp', 2);
       await move.call(page.keyboard, 'ArrowRight', 3);
       await move.call(page.keyboard, 'ArrowDown', 18);

       await move.call(page.keyboard, 'ArrowUp', 2);
       await move.call(page.keyboard, 'ArrowRight', 1);
       await move.call(page.keyboard, 'ArrowDown', 18);

       await move.call(page.keyboard, 'ArrowUp', 2);
       await move.call(page.keyboard, 'ArrowLeft', 1);
       await move.call(page.keyboard, 'ArrowDown', 18);

       await move.call(page.keyboard, 'ArrowUp', 2);
       await move.call(page.keyboard, 'ArrowLeft', 3);
       await move.call(page.keyboard, 'ArrowDown', 18);

       await move.call(page.keyboard, 'ArrowUp', 2);
       await move.call(page.keyboard, 'ArrowLeft', 5);
       await move.call(page.keyboard, 'ArrowDown', 18);

       const newPosY = await page.evaluate(x => {
         const posY = [...document.querySelectorAll('.fix')].map(x => /(.*)\_(.*)/.exec(x.getAttribute('fix-field'))[2]);
         return JSON.stringify(!posY.includes('17'));
       });
       assert.equal(newPosY, 'true');
    });
  });

  describe('游戏暂停测试', async () => {
    beforeEach(async () => {
      await page.keyboard.down('Space');
    });

    it('开始游戏按空格键应该暂停失败', async () => {
      const startPos = await page.evaluate(x => {
        const fixRects = Array.from(document.querySelectorAll('.active'));
        return fixRects.map(rect => /translate\((.*),(.*)\)/.exec(rect.getAttribute('transform'))[2]).map(x => +x);
      });
      await move.call(page.keyboard, 'ArrowDown', 5);
      const nextPos = await page.evaluate(x => {
        const fixRects = Array.from(document.querySelectorAll('.active'));
        return fixRects.map(rect => /translate\((.*),(.*)\)/.exec(rect.getAttribute('transform'))[2]).map(x => +x);
      });
      let startState;
      if (startPos.toString() === nextPos.toString()) {
        startState = 'false';
      } else {
        startState = 'true';
      }
      assert.equal(startState, 'true');
    });

    it('游戏中按空格键暂停应该成功', async () => {
      await page.keyboard.down('Space');
      const startPos = await page.evaluate(x => {
        const fixRects = Array.from(document.querySelectorAll('.active'));
        return fixRects.map(rect => +/translate\((.*),(.*)\)/.exec(rect.getAttribute('transform'))[2]).map(x => +x);
      });
      await move.call(page.keyboard, 'ArrowDown', 5);
      const nextPos = await page.evaluate(x => {
        const fixRects = Array.from(document.querySelectorAll('.active'));
        return fixRects.map(rect => +/translate\((.*),(.*)\)/.exec(rect.getAttribute('transform'))[2]).map(x => +x);
      });
      let startState;
      if (startPos.toString() === nextPos.toString()) {
        startState = 'true';
      } else {
        startState = 'false';
      }
      assert.equal(startState, 'true');
    });
  });

  describe('游戏重新开始测试', async () => {
    beforeEach(async () => {
      await page.evaluate(x => {
        Math.random=function(){return 0.6};
      });
      await page.keyboard.down('Space');
    });

    it('游戏结束时应该出现重新开始提示', async () => {
      await move.call(page.keyboard, 'ArrowDown', 50);
      const reStartState = await page.evaluate(x => {
        return document.querySelector('.start').textContent;
      });
      assert.equal(reStartState, '按Enter键重新开始');
    });

    it('游戏结束时计时器和下一个shape应该结束', async () => {
      await move.call(page.keyboard, 'ArrowDown', 50);
      const nextChildrenLength = await page.evaluate(x => {
        return document.querySelector('.next').children.length;
      });
      assert.equal(nextChildrenLength, 0);
    })

    it('游戏结束时按Enter应该重新开始', async () => {
      await move.call(page.keyboard, 'ArrowDown', 50);
      await page.keyboard.down('Enter');
      await timeout(500);
      const startState = await page.evaluate(x => {
        return document.querySelector('.start').textContent;
      });
      assert.equal(startState, '按任意键开始游戏');
    });

    it('重新开始后任意键可以开始游戏', async () => {
      await move.call(page.keyboard, 'ArrowDown', 50);
      await page.keyboard.down('Enter');
      await timeout(500);
      await page.keyboard.down('Space');
      const actives = await page.evaluate(x => {
        return document.querySelectorAll('.active').length;
      });
      assert.equal(actives, 4);
    });
  });

  describe('游戏计时测试', async () => {
    beforeEach(async () => {
      await page.keyboard.down('Space');
    });

    it('游戏开始计时器工作应该正确',async () => {
      await timeout(1000);
      const duration = await page.evaluate(x => {
        return document.querySelector('.duration').children[1].textContent;
      });
      assert.equal(duration, '1s');
    });

    it('游戏暂停计时器工作应该正确', async () => {
      const duration = await page.evaluate(x => {
        return document.querySelector('.duration').children[1].textContent;
      });
      await page.keyboard.down('Space');
      await timeout(1000);
      const newDuration = await page.evaluate(x => {
        return document.querySelector('.duration').children[1].textContent;
      });
      assert.equal(duration, newDuration);
    });

    it('游戏恢复计时器工作应该正确', async () => {
      await page.keyboard.down('Space');
      await page.keyboard.down('Space');
      await timeout(1000);
      const duration = await page.evaluate(x => {
        return document.querySelector('.duration').children[1].textContent;
      });
      assert.equal(duration, '1s');
    });

    it('游戏结束计数器应该停止工作', async () => {
      await page.evaluate(x => {
        Math.random=function(){return 0.6};
      });
      await move.call(page.keyboard, 'ArrowDown', 50);
      const duration = await page.evaluate(x => {
        return document.querySelector('.duration').children[1].textContent;
      });
      await page.keyboard.down('Space');
      await timeout(1000);
      const newDuration = await page.evaluate(x => {
        return document.querySelector('.duration').children[1].textContent;
      });
      assert.equal(duration, newDuration);
    });
  });
  afterEach(async () => {
    await page.close();
  });

  after(async () => {
    await browser.close();
  });
});
