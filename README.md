# tetris

[![Build Status](https://travis-ci.org/wendell0316/teris.svg?branch=master)](https://travis-ci.org/wendell0316/teris)

[试玩地址](https://wendell0316.github.io/teris/index.svg "Title").

原生js和svg写的俄罗斯方块

在类`Tetris`中
* `this.position`来记录运动中的方块的位置;
* `this.rotateCoodinate`记录当前方块的旋转点；
在全局中
* `score`记录分数；
在svg中
* `x-field`记录固定的方块的x坐标；
* `y-field`记录固定的方块的y坐标；
## 思路：
* Tetris接受随机传入的方块位置和旋转点；
* 将该方块坐标存入`this.position`;
* 将该方块的旋转点存入`this.rotateCoodinate`;
* `move()`用来移动（除旋转外）方块的位置，将新位置存入`this.position`;
* 使用`draw()`来渲染到页面，即根据`this.position`使用`translate`改变当前移动中方块的位置；
* `rotate()`用来旋转方块，旋转公式`(rX + rY - y, rY - rX + x)`(rX、rY为旋转点坐标，x、y为当前坐标)；
* 当触碰到底部或下方已有固定的方块即固定该方块并使用`x-field`、`y-field`记录该方块的坐标，同时创建新的方块；
* 使用`setInterval`来控制自由下落和暂停恢复及游戏计时；

