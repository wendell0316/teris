const stopMark = {};
let score = 0; // 计分
class Teris {
  constructor(shape) {
    this.position = JSON.parse(JSON.stringify(shape));
    for (let index = 0; index < this.position.x.length; index++) {
      this.position.x[index] += 4;
    }
    this.shape = JSON.parse(JSON.stringify(shape));
    this.element = [];
  }
  create() { // 创建方块
    if (this.check()) {
      if (downSpeed >= 350) {
        downSpeed = downSpeed - 5;
      } else if (downSpeed >= 250) {
        downSpeed = downSpeed - 3;
      } else if (downSpeed >= 100) {
        downSpeed = downSpeed - 2;
      } else if (downSpeed >= 50) {
        downSpeed = downSpeed - 1;
      } else if (downSpeed >= 10) {
        downSpeed = downSpeed - 0.5;
      }
      for (let index = 0; index < this.position.x.length; index++) {
        const rectDom = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectDom.setAttribute('width', 20);
        rectDom.setAttribute('height', 20);
        rectDom.classList.add('active');
        this.element.push(rectDom);
        this.draw();
        document.getElementById('svg').appendChild(rectDom);
      }
    } else {
      [...document.querySelector('.title').children].map(x => x.innerHTML = 'GAME OVER');
    }
  }
  draw() {  // 移动方块位置
    for (const [index, rect] of this.element.entries()) {
      rect.setAttribute('transform', `translate(${this.position.x[index] * 20}, ${this.position.y[index] * 20})`);
    }
  }
  check() {  // 检测是否超出高度及是否下方已有固定方块
    for (let index = 0; index < this.position.y.length; index++) {
      if (this.position.y[index] + 1 >= 20) {
        return false;
      } else if (stopMark[(this.position.x[index]) + '_' + (this.position.y[index] + 1)]) {
        return false;
      }
    }
    return true;
  }
  checkleft() { // 检测是否超出左侧位置及左侧是否有固定方块
    for (let index = 0; index < this.position.x.length; index++) {
      if (stopMark[(this.position.x[index] - 1) + '_' + (this.position.y[index])]) {
        return false;
      } else if (this.position.x[index] - 1 < 0) {
        return false;
      }
    }
    return true;
  }
  checkright() { // 检测右侧
    for (let index = 0; index < this.position.x.length; index++) {
      if (stopMark[(this.position.x[index] + 1) + '_' + (this.position.y[index])]) {
        return false;
      } else if (this.position.x[index] + 1 >= 10) {
        return false;
      }
    }
    return true;
  }
  checkRotate(difference) { // 检测旋转过程中是否超出左侧或右侧或者左侧或右侧已有固定方块
    for (let index = 0; index < this.position.x.length; index++) {
      if (this.position.y[index] + 1 >= 20) {
        return false;
      } else if (stopMark[(this.shape.y[index] + difference.x[index]) + '_' + (2 - this.shape.x[index] + difference.y[index])]) {
        return false;
      } else if (this.shape.y[index] + difference.x[index] >= 10 || this.shape.y[index] + difference.x[index] < 0) {
        return false;
      }
    }
    return true;
  }
  movedown() {
    for (let index = 0; index < this.position.y.length; index++) {
      this.position.y[index]++;
    }
    this.draw();
  }
  moveleft() {
    if (this.checkleft()) {
      for (let index = 0; index < this.position.x.length; index++) {
        this.position.x[index]--;
      }
      this.draw();
    }

  }
  moveright() {
    if (this.checkright()) {
      for (let index = 0; index < this.position.x.length; index++) {
        this.position.x[index]++;
      }
      this.draw();
    }
  }
  rotate() {
    const difference = {x: [], y: []};
    for (const [index, value] of this.position.x.entries()) {
      difference.x.push(value - this.shape.x[index]);
    }
    for (const [index, value] of this.position.y.entries()) {
      difference.y.push(value - this.shape.y[index]);
    }

    if (this.checkRotate(difference)) {
      for (let index = 0; index < this.position.x.length; index++) {
        this.position.x[index] = this.shape.y[index] + difference.x[index];
        this.position.y[index] = 2 - this.shape.x[index] + difference.y[index];
      }

      this.shape = {x: [this.shape.y[0], this.shape.y[1], this.shape.y[2], this.shape.y[3]],
                    y: [2 - this.shape.x[0], 2 - this.shape.x[1], 2 - this.shape.x[2], 2 - this.shape.x[3]]};
      this.draw();
    }
  }
  fix() {
    for (let index = 0; index < this.position.y.length; index++) {
      stopMark[this.position.x[index] + '_' + this.position.y[index]] = 1;
    }
    for (const [index, value] of Array.from(document.querySelectorAll('.active').entries())) {
      value.classList.remove('active');
      value.classList.add('fix');
      value.setAttribute('fix-field', `${this.position.x[index]}_${this.position.y[index]}`); // 标记每个固定方块的位置。
    }
  }
  checkRemove() { // 检测是否有可以消除的行
    const row = 10, col = 20;
    for (let y = 0; y < col; y++) {
      let count = 0;
      for (let x = 0; x < row; x++) {
        if (stopMark[x + '_' + y]) {
          count++;
        }
      }
      if (count === row) {
        this.remove(y);
      }
    }
  }
  remove(line) { // 消除行
    score++;
    [...document.querySelector('.score').children].map(x => x.innerHTML = score);
    const fixRects = document.querySelectorAll('.fix');
    for (let index = 0; index < 10; index++) {
      document.querySelector(`.fix[fix-field="${index}_${line}"]`).remove();
      delete stopMark[index + '_' + line];
    }
    for (let i = line; i > 0; i--) {
      for (let j = 0; j < 10; j++) {
        if (stopMark[j + "_" + (i - 1)]) {
          delete stopMark[j + '_' + (i - 1)]
          stopMark[j + "_" + i] = 1;
        }
      }
    }
    for (const rect of Array.from(fixRects)) {
      let [, x, y] = /(.*)\_(.*)/.exec(rect.getAttribute('fix-field')).map(x => +x);
      if (y < line) {
        document.querySelector(`.fix[fix-field="${x}_${y}"]`).setAttribute('transform', `translate(${x * 20}, ${(y + 1) * 20})`);
        document.querySelector(`.fix[fix-field="${x}_${y}"]`).setAttribute('fix-field', `${x}_${y + 1}`);
      }
    }
  }
}
const shapes = [{x: [2, 2, 2, 1], y: [0, 1, 2, 2]},
                {x: [0, 1, 1, 2], y: [1, 0, 1, 1]},
                {x: [1, 2, 1, 2], y: [0, 0, 1, 1]},
                {x: [0, 1, 1, 2], y: [0, 0, 1, 1]},
                {x: [1, 1, 1, 1], y: [0, 1, 2, 3]},
                {x: [1, 2, 0, 1], y: [0, 0, 1, 1]},
                {x: [1, 1, 1, 2], y: [0, 1, 2, 2]}];
let random = Math.trunc(Math.random() * 7);
let nextShape = shapes[Math.trunc(Math.random() * 7)];
let shape = new Teris(nextShape);
let interval;
let spaceCount = 0;
let downSpeed = 500;
let pause = false;
document.onkeydown = keyDown;
function init() {
  shape.create();
  drawnext(nextShape);
  interval = setInterval(() => {repeatmove()},downSpeed);
}
function repeatmove() {
  if(shape.check()) {
    shape.movedown();
  } else if(document.querySelector('.title text').innerHTML === 'GAME OVER') {
    clearInterval(interval);
  } else {
    shape.fix();
    shape.checkRemove();
    [...document.querySelector('.next').children].map(x => x.remove());
    shape = new Teris(nextShape);
    clearInterval(interval);
    shape.create();
    interval = setInterval(() => {repeatmove()}, downSpeed);
    nextShape = shapes[Math.trunc(Math.random() * 7)];
    drawnext(nextShape);
  }
}
function keyDown(e) {
  if (spaceCount === 0) { // 按任意键启动
    document.querySelector('.start').remove();
    init();
  }
  spaceCount++;
  switch (e.code) {
    case 'ArrowUp':
      if (!pause) {
        shape.rotate();
      }
      break;
    case 'ArrowRight':
      if (!pause) {
        shape.moveright();
      }
      break;
    case 'ArrowLeft':
      if (!pause) {
        shape.moveleft();
      }
      break;
    case 'ArrowDown':
      if (shape.check()) {
        shape.movedown();
      } else if(document.querySelector('.title text').innerHTML === 'GAME OVER') {
        clearInterval(interval);
      } else {
        shape.fix();
        shape.checkRemove();
        [...document.querySelector('.next').children].map(x => x.remove());
        shape = new Teris(nextShape);
        clearInterval(interval);
        shape.create();
        interval = setInterval(() => {repeatmove()}, downSpeed);
        nextShape = shapes[Math.trunc(Math.random() * 7)];
        drawnext(nextShape);
      }
      break;
    case 'Space':
      if (spaceCount !== 1) {
        pause = !pause;
      }
      if (pause) {
        clearInterval(interval);
        [...document.querySelector('.title').children].map(x => x.innerHTML = 'PAUSE');
      } else {
        [...document.querySelector('.title').children].map(x => x.innerHTML = 'SCORE');
        clearInterval(interval);
        interval = setInterval(() => {repeatmove()}, downSpeed);
      }
      break;
    default:
      break;
  }
}
function drawnext(nextShape) {
  for (let index = 0; index < nextShape.x.length; index++) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', 10);
    rect.setAttribute('height', 10);
    rect.setAttribute('x', 100);
    rect.setAttribute('y', 120)
    rect.classList.add('next-shape');
    rect.setAttribute('transform', `translate(${nextShape.x[index] * 10}, ${nextShape.y[index] * 10})`);
    document.querySelector('.next').appendChild(rect);
  }
}


