'use strict';
let score = 0; // 计分
let downTimer = 800;
const row = 10, col = 20;
function deepClone(obj) {
  if (obj == null || typeof obj !== 'object') {
    return obj;
  }

  switch (Object.prototype.toString.call(obj)) {
    case '[object Array]': {
      const result = new Array(obj.length);
      for (let i=0; i<result.length; ++i) {
        result[i] = deepClone(obj[i]);
      }
      return result;
    }

    // Object.prototype.toString.call(new XxxError) returns '[object Error]'
    case '[object Error]': {
      const result = new obj.constructor(obj.message);
      result.stack = obj.stack; // hack...
      return result;
    }

    case '[object Date]':
    case '[object RegExp]':
    case '[object Int8Array]':
    case '[object Uint8Array]':
    case '[object Uint8ClampedArray]':
    case '[object Int16Array]':
    case '[object Uint16Array]':
    case '[object Int32Array]':
    case '[object Uint32Array]':
    case '[object Float32Array]':
    case '[object Float64Array]':
    case '[object Map]':
    case '[object Set]':
      return new obj.constructor(obj);

    case '[object Object]': {
      const keys = Object.keys(obj);
      const result = {};
      for (let i=0; i<keys.length; ++i) {
        const key = keys[i];
        result[key] = deepClone(obj[key]);
      }
      return result;
    }

    default: {
      throw new Error("Unable to copy obj! Its type isn't supported.");
    }
  }
}

class Tetris {
  constructor(shape) {
    this.position = deepClone(shape);
    this.rotateCoodinate = this.position.pop();
    for (const pos of this.position) {
      pos.x += 4;
    }
    if (this.rotateCoodinate !== null) {
      this.rotateCoodinate.rX += 4;
    }
    this.element = [];
    this.create();
  }

  create() { // 创建方块
    if (Tetris.isValidPos(this.position)) {
      for (let index = 0; index < this.position.length; index++) {
        let rectDom = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectDom.setAttribute('width', 20);
        rectDom.setAttribute('height', 20);
        rectDom.classList.add('active');
        this.element.push(rectDom);
        this.draw();
        document.getElementById('svg').appendChild(rectDom);
      }
    }
  }

  draw() {
    for (const [index, rect] of this.element.entries()) {
      const { x, y } = this.position[index];
      rect.setAttribute('transform', `translate(${x * 20}, ${y * 20})`);
    }
  }

  static isValidPos(pos) {
    return pos.every(({x, y}) => x >= 0 && x < row && y < col && !document.querySelector(`[fix-field="${x}_${y}"]`));
  }

  move(x, y) {
    const newPos = deepClone(this.position);
    newPos.forEach(pos => {
      pos.x += x;
      pos.y += y;
    });
    if (Tetris.isValidPos(newPos)) {
      if (this.rotateCoodinate !== null) {
        this.rotateCoodinate.rX += x;
        this.rotateCoodinate.rY += y;
      }
      this.position = newPos;
      this.draw();
    }
  }

  rotate() {
    const newPos = deepClone(this.position);
    for (let index = 0; index < this.position.length; index++) {
      newPos[index].x = this.rotateCoodinate.rX + this.rotateCoodinate.rY - this.position[index].y;
      newPos[index].y = this.rotateCoodinate.rY - this.rotateCoodinate.rX + this.position[index].x;
    }
    if (Tetris.isValidPos(newPos)) {
      this.position = newPos;
      this.draw();
    }
  }

  fix() {
    for (const [index, rect] of Array.from(document.querySelectorAll('.active')).entries()) {
      let pos = this.position[index];
      rect.classList.remove('active');
      rect.classList.add('fix');
      rect.setAttribute('fix-field', `${pos.x}_${pos.y}`); // 标记每个固定方块的位置。
    }
  }

  remove() { // 消除行
    for (let y = col - 1; y > 0; y--) {
      let line = document.querySelectorAll(`[fix-field$="_${y}"]`);
      if (line.length === row) {
        [...line].map(x => x.remove());
        score++;
        if ([10, 20, 30, 40, 50, 70, 100, 150, 200, 250, 300, 400, 500].includes(score)) {
          downTimer -= 50;
        }
        [...document.querySelector('.score').children].map(x => x.innerHTML = score);
        for (let index = y - 1; index > 0; index--) {
          let downLine = document.querySelectorAll(`[fix-field$="_${index}"]`);
          [...downLine].map(x => {
            let [fixX, fixY] = x.getAttribute('fix-field').split('_').map(x => +x);
            x.setAttribute('transform', `translate(${fixX * 20}, ${(fixY + 1) * 20})`);
            x.setAttribute('fix-field', `${fixX}_${fixY + 1}`);
          });
        }
        y++;
      } else if (line.length === 0) {
        return;
      }
    }
  }
}
const shapes = [[{x: 1, y:0}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 0, y: 2}, {rX: 1, rY: 1}],
                [{x: 0, y:1}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}, {rX: 1, rY: 1}],
                [{x: 1, y:0}, {x: 2, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}, null],
                [{x: 0, y:0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}, {rX: 1, rY: 1}],
                [{x: 2, y:0}, {x: 2, y: 1}, {x: 2, y: 2}, {x: 2, y: 3}, {rX: 2, rY: 2}],
                [{x: 1, y:0}, {x: 2, y: 0}, {x: 1, y: 1}, {x: 0, y: 1}, {rX: 1, rY: 1}],
                [{x: 1, y:0}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 2, y: 2}, {rX: 1, rY: 1}]];
let nextShape;
let shape;
let interval;
let duration = 0;
let gameDuration;

function keyDown(e) {
  switch (e.code) {
    case 'ArrowUp':
      if (shape.rotateCoodinate !== null) {
        shape.rotate();
      }
      break;
    case 'ArrowRight':
      shape.move(1, 0);
      break;
    case 'ArrowLeft':
      shape.move(-1, 0);
      break;
    case 'ArrowDown':
      moveDown();
      break;
    case 'Space':
      const titles = [...document.querySelector('.title').children];
      clearInterval(interval);
      clearInterval(gameDuration);
      titles.map(x => x.innerHTML = 'PAUSE');
      document.onkeydown = function resume(e) {
        if (e.code !== 'Space') return;
        titles.map(x => x.innerHTML = 'SCORE');
        interval = setInterval(() => moveDown(), downTimer);
        setDuration();
        document.onkeydown = keyDown;
      };
      break;
  }
}

function createNextShape() {
  shape = new Tetris(nextShape);
  if (Tetris.isValidPos(shape.position)) {
    drawNext(nextShape = shapes[Math.trunc(Math.random() * 7)]);
    interval = setInterval(() => moveDown(), downTimer);
  } else {
    clearInterval(interval);
    [...document.querySelector('.title').children].map(x => x.innerHTML = 'GAME OVER');
    clearInterval(gameDuration);
    const restartText = document.querySelector('.start');
    restartText.innerHTML = '按Enter键重新开始';
    document.getElementById('svg').appendChild(restartText);
    document.onkeydown = function restartGame(e) {
      if (e.code === 'Enter') {
        location.reload();
      }
    };
  }
}

function moveDown() {
  const newPos = deepClone(shape.position);
  newPos.forEach(pos => {
    pos.y += 1;
  });
  if (Tetris.isValidPos(newPos)) {
    shape.move(0, 1);
  } else {
    shape.fix();
    shape.remove();
    [...document.querySelector('.next').children].map(x => x.remove());
    clearInterval(interval);
    createNextShape();
  }
}

function drawNext(nextShape) {
  for (let index = 0; index < nextShape.length - 1; index++) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', 20);
    rect.setAttribute('height', 20);
    rect.setAttribute('x', 80);
    rect.setAttribute('y', 200);
    rect.classList.add('next-shape');
    rect.setAttribute('transform', `translate(${nextShape[index].x * 20}, ${nextShape[index].y * 20})`);
    document.querySelector('.next').appendChild(rect);
  }
}

function setDuration() {
  gameDuration = setInterval(() => {
    duration += 1;
    document.querySelector('.duration').children[1].textContent = `${duration}s`;
  }, 1000);
}

document.onkeydown = function startGame() {
  setDuration();
  document.querySelector('.start').innerHTML = '';
  nextShape = shapes[Math.trunc(Math.random() * 7)];
  createNextShape();
  document.onkeydown = keyDown;
};
