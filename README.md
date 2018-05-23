# teris
原生js和svg写的俄罗斯方块
在类`Teris`中
* `this.position`来记录运动中的方块的位置;
* `this.shape`记录当前方块的形状；
在全局中
* `stopMark`来记录已固定的方块；
* `score`记录分数；
## 思路：
* Teris接受随机传入的方块；
* 将该方块坐标存入`this.position`、`this.shape`;
* `move()`用来移动（除旋转外）方块的位置，将新位置存入`this,position`;
* 使用`draw()`来渲染到页面，即根据`this.position`使用`translate`改变当前移动中方块的位置；

