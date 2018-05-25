# teris

[![Build Status](https://travis-ci.org/wendell0316/teris.svg?branch=master)](https://travis-ci.org/wendell0316/teris)

原生js和svg写的俄罗斯方块

在类`Tetris`中
* `this.position`来记录运动中的方块的位置;
* `this.rotateCoodinate`记录当前方块的旋转点；
在全局中
* `score`记录分数；
## 思路：
* Tetris接受随机传入的方块位置和旋转点；
* 将该方块坐标存入`this.position`;
* 将该方块的旋转点存入`this.rotateCoodinate`;
* `move()`用来移动（除旋转外）方块的位置，将新位置存入`this,position`;
* 使用`draw()`来渲染到页面，即根据`this.position`使用`translate`改变当前移动中方块的位置；

