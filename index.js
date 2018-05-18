const stopMark = {};
let count = 0;
let score = 0; // 计分
class Teris {
  constructor(shape) {
    this.position = JSON.parse(JSON.stringify(shape));
    for (let index = 0; index < this.position.length; index += 2) {
      this.position[index] += 9;
    }
    this.shape = JSON.parse(JSON.stringify(shape));
    this.element = [];
  }
  create() { // 创建方块
    if (this.check()) {
      if (downSpeed >= 250) {
        downSpeed = downSpeed - 5;
      } else if (downSpeed >= 100) {
        downSpeed = downSpeed - 2;
      } else if (downSpeed >= 50) {
        downSpeed = downSpeed - 1;
      } else if (downSpeed >= 10) {
        downSpeed = downSpeed - 0.5;
      }
      for (let index = 0; index < this.position.length; index += 2) {
        const rectDom = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rectDom.setAttribute('width', 10);
        rectDom.setAttribute('height', 10);
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
      rect.setAttribute('transform', `translate(${this.position[2 * index] * 10}, ${this.position[2 * index + 1] * 10})`);
    }
  }
  check() {  // 检测是否超出高度及是否下方已有固定方块
    for (let index = 0; index < this.position.length; index += 2) {
      if (this.position[index + 1] + 1 >= 40) {
        return false;
      } else if (stopMark[(this.position[index]) + '_' + (this.position[index + 1] + 1)]) {
        return false;
      }
    }
    return true;
  }
  checkleft() { // 检测是否超出左侧位置及左侧是否有固定方块
    for (let index = 0; index < this.position.length; index += 2) {
      if (stopMark[(this.position[index] - 1) + '_' + (this.position[index + 1])]) {
        return false;
      } else if (this.position[index] - 1 < 0) {
        return false;
      }
    }
    return true;
  }
  checkright() { // 检测右侧
    for (let index = 0; index < this.position.length; index += 2) {
      if (stopMark[(this.position[index] + 1) + '_' + (this.position[index + 1])]) {
        return false;
      } else if (this.position[index] + 1 >= 20) {
        return false;
      }
    }
    return true;
  }
  checkRotate(difference) { // 检测旋转过程中是否超出左侧或右侧或者左侧或右侧已有固定方块
    for (let index = 0; index < this.position.length; index += 2) {
      if (this.position[index + 1] + 1 >= 40) {
        return false;
      } else if (stopMark[(this.shape[index + 1] + difference[index]) + '_' + (2 - this.shape[index] + difference[index + 1])]) {
        return false;
      } else if (this.shape[index + 1] + difference[index] >= 20 || this.shape[index + 1] + difference[index] + 1 - 1 < 0) {
        return false;
      }
    }
    return true;
  }
  movedown() {
    for (let index = 0; index < this.position.length; index += 2) {
      this.position[index + 1]++;
    }
    this.draw();
  }
  moveleft() {
    if (this.checkleft()) {
      for (let index = 0; index < this.position.length; index += 2) {
        this.position[index]--;
      }
      this.draw();
    }

  }
  moveright() {
    if (this.checkright()) {
      for (let index = 0; index < this.position.length; index += 2) {
        this.position[index]++;
      }
      this.draw();
    }
  }
  rotate() {
    const difference = [];
    for (const [index, value] of this.position.entries()) {
      difference.push(value - this.shape[index]);
    }
    if (this.checkRotate(difference)) {
      this.position = [this.shape[1] + difference[0], 2 - this.shape[0] + difference[1], this.shape[3] + difference[2], 2 - this.shape[2] + difference[3], this.shape[5] + difference[4], 2 - this.shape[4] +difference[5], this.shape[7] + difference[6], 2 - this.shape[6] + difference[7]];
      this.shape = [this.shape[1], 2 - this.shape[0], this.shape[3], 2 - this.shape[2], this.shape[5], 2 - this.shape[4], this.shape[7], 2 - this.shape[6]];
      this.draw();
    }
  }
  fix() {
    for (let index = 0; index < this.position.length; index += 2) {
      stopMark[this.position[index] + '_' + this.position[index + 1]] = 1;
    }
    for (const [index, value] of Array.from(document.querySelectorAll('.active').entries())) {
      value.classList.remove('active');
      value.classList.add('fix');
      value.setAttribute('fix-field', `${this.position[index * 2]}_${this.position[index * 2 + 1]}`); // 标记每个固定方块的位置。
    }
  }
  checkRemove() { // 检测是否有可以消除的行
    const row = 20, col = 40;
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
    for (let index = 0; index < 20; index++) {
      document.querySelector(`.fix[fix-field="${index}_${line}"]`).remove();
      delete stopMark[index + '_' + line];
    }
    for (let i = line; i > 0; i--) {
      for (let j = 0; j < 20; j++) {
        if (stopMark[j + "_" + (i - 1)]) {
          delete stopMark[j + '_' + (i - 1)]
          stopMark[j + "_" + i] = 1;
        }
      }
    }
    for (const rect of Array.from(fixRects)) {
      let [, x, y] = /(.*)\_(.*)/.exec(rect.getAttribute('fix-field')).map(x => +x);
      if (y < line) {
        document.querySelector(`.fix[fix-field="${x}_${y}"]`).setAttribute('transform', `translate(${x * 10}, ${(y + 1) * 10})`);
        document.querySelector(`.fix[fix-field="${x}_${y}"]`).setAttribute('fix-field', `${x}_${y + 1}`);
      }
    }
  }
}
const shapes = [[2, 0, 2, 1, 2, 2, 1, 2],
                [0, 1, 1, 0, 1, 1, 2, 1],
                [1, 0, 2, 0, 1, 1, 2, 1],
                [0, 0, 1, 0, 1, 1, 2, 1],
                [1, 0, 1, 1, 1, 2, 1, 3],
                [1, 0, 2, 0, 0, 1, 1, 1],
                [1, 0, 1, 1, 1, 2, 2, 2]];
let nextShape = shapes[Math.trunc(Math.random() * 10 % 7)];
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
    nextShape = shapes[Math.trunc(Math.random() * 10 % 7)];
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
        nextShape = shapes[Math.trunc(Math.random() * 10 % 7)];
        drawnext(nextShape);
      }
      break;
    case 'Space':
      if (spaceCount !== 1) {
        pause = !pause;
      }
      if (pause) {
        clearInterval(interval);
      } else {
        clearInterval(interval);
        interval = setInterval(() => {repeatmove()}, downSpeed);
      }
      break;
    default:
      break;
  }
}
function drawnext(nextShape) {
  for (let index = 0; index < nextShape.length; index += 2) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', 10);
    rect.setAttribute('height', 10);
    rect.classList.add('next');
    rect.setAttribute('transform', `translate(${nextShape[index] * 10}, ${nextShape[index + 1] * 10})`);
    document.querySelector('.next').appendChild(rect);
  }
}


