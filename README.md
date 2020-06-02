# Kakomimasu
 #procon31 競技部門 コアモジュール for Deno/Node.js

[![esmodules](https://taisukef.github.com/denolib/esmodulesbadge.svg)](https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Modules)
[![deno](https://taisukef.github.com/denolib/denobadge.svg)](https://deno.land/)

## 利用方法

for Deno or ブラウザ
```
import { Kakomimasu, Board, Action } from "https://taisukef.github.io/kakomimasu/Kakomimasu.mjs";
const kkmm = new Kakomimasu();
```

for Deno or Node.js
```
$ git close 
```
main.mjs を編集（そのままでも動きます）
```
import { Kakomimasu, Board, Action } from "../Kakomimasu.mjs";

const kkmm = new Kakomimasu();

const w = 8;
const h = 8;
const points = [];
for (let i = 0; i < w * h; i++) {
  points[i] = i;
}
const nagent = 6;
const board = new Board(w, h, points, nagent);
kkmm.appendBoard(board);

const nturn = 10;
const game = kkmm.createGame(board, nturn);
const p1 = kkmm.createPlayer("test1");
const p2 = kkmm.createPlayer("test2");
game.attachPlayer(p1);
game.attachPlayer(p2);
game.start();
for (;;) {
  const st = game.getStatusJSON();
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 1, 1],
    [0, Action.MOVE, 2, 2],
  ]));
  p2.setActions(Action.fromJSON([
    [0, Action.PUT, 1, 1],
    [1, Action.PUT, 1, 2],
  ]));
  if (!game.nextTurn()) {
    break;
  }
}
console.log(game.getStatusJSON());

```
コンソールにて
```
$ deno run main.mjs
```
or 
```
$ node main.mjs
```


## テスト

```
$ cd test
$ deno test *
```