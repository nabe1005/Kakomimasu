import { Kakomimasu, Board, Action } from "../Kakomimasu.mjs";
import { test, assertEquals } from "../asserts.mjs";
import util from "../util.mjs";

const prepare = () => {
  const w = 3;
  const h = 3;
  const points = [];
  for (let i = 0; i < w * h; i++) {
    points[i] = i;
    // points[i] = i % (16 * 2 + 1) - 16;
    // util.rnd(16 * 2 + 1) - 16;
  }
  const nagent = 9;
  const board = new Board(w, h, points, nagent);

  const kkmm = new Kakomimasu();
  kkmm.appendBoard(board);
  const game = kkmm.createGame(board, 30);
  const p1 = kkmm.createPlayer("test1");
  const p2 = kkmm.createPlayer("test2");
  game.attachPlayer(p1);
  game.attachPlayer(p2);
  game.start();
  return { game, p1, p2 };
}

test("action put", () => {
  const { game, p1 } = prepare();
  p1.setActions(Action.fromJSON([[0, Action.PUT, 0, 0],]));
  game.nextTurn();
  const status = game.getStatusJSON();
  assertEquals(status.field[0], [1, 0]);
});

test("action cant't put", () => {
  const { game, p1 } = prepare();
  p1.setActions(Action.fromJSON([[0, Action.PUT, 1000, 0],]));
  game.nextTurn();
  const status = game.getStatusJSON();
  assertEquals(status.field[0], [0, -1]);
  assertEquals(status.log[0][0][0].res, Action.ERR_ILLEGAL_ACTION);
});

test("action move", () => {
  const { game, p1 } = prepare();
  p1.setActions(Action.fromJSON([[0, Action.PUT, 0, 0],]));
  game.nextTurn();
  p1.setActions(Action.fromJSON([[0, Action.MOVE, 1, 0],]));
  const status = game.getStatusJSON();
  assertEquals(status.field[0], [1, 0]);
});

test("action move series 連なり移動", () => {
  const { game, p1 } = prepare();
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 0, 0],
    [1, Action.PUT, 1, 0],
  ]));
  game.nextTurn();
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 1, 0],
    [1, Action.MOVE, 2, 0],
  ]));
  game.nextTurn();
  assertEquals(game.getStatusJSON().field[2], [1, 0]);
});

test("action cant't move series 連なり移動失敗", () => {
  const { game, p1, p2 } = prepare();
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 0, 0],
    [1, Action.PUT, 1, 0],
  ]));
  game.nextTurn();
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 1, 0],
    [1, Action.MOVE, 2, 0],
  ]));
  p2.setActions(Action.fromJSON([
    [0, Action.PUT, 2, 0 ]
  ]));
  game.nextTurn();
  assertEquals(game.getStatusJSON().field[2], [0, -1]);
});

test("action can't move", () => {
  const { game, p1 } = prepare();
  p1.setActions(Action.fromJSON([[0, Action.PUT, 0, 0],]));
  game.nextTurn();
  p1.setActions(Action.fromJSON([[0, Action.MOVE, 2, 0],]));
  game.nextTurn();
  const status = game.getStatusJSON();
  assertEquals(status.field[2], [0, -1]);
  assertEquals(status.log[1][0][0].res, Action.ERR_ILLEGAL_ACTION);
});

test("fill", () => {
  const { game, p1 } = prepare();
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 0, 0],
    [1, Action.PUT, 1, 0],
    [2, Action.PUT, 2, 0],
    [3, Action.PUT, 0, 1],
    [4, Action.PUT, 2, 1],
    [5, Action.PUT, 0, 2],
    [6, Action.PUT, 1, 2],
    [7, Action.PUT, 2, 2],
  ]));
  game.nextTurn();
  const status = game.getStatusJSON();
  assertEquals(status.field[4], [0, 0]);
});

test("action remove", () => {
  const { game, p1 } = prepare();
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 0, 0],
  ]));
  game.nextTurn();
  assertEquals(game.getStatusJSON().field[0], [1, 0]);
  p1.setActions(Action.fromJSON([
    [0, Action.MOVE, 1, 0],
  ]));
  game.nextTurn();
  p1.setActions(Action.fromJSON([
    [0, Action.REMOVE, 0, 0],
  ]));
  game.nextTurn();
  assertEquals(game.getStatusJSON().field[0], [0, -1]);
});

test("action can't remove", () => {
  const { game, p1 } = prepare();
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 0, 0],
  ]));
  game.nextTurn();
  p1.setActions(Action.fromJSON([
    [0, Action.REMOVE, 1, 0],
  ]));
  game.nextTurn();
  assertEquals(game.getStatusJSON().field[1], [0, -1]);
  assertEquals(game.getStatusJSON().log[1][0][0].res, Action.ERR_ILLEGAL_ACTION);
});

test("wall point", () => {
  const { game, p1 } = prepare();
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 1, 0],
    [1, Action.PUT, 2, 0],
  ]));
  game.nextTurn();
  assertEquals(game.getStatusJSON().points[0], { basepoint: 0, wallpoint: 1 + 2 });
});

test("base point", () => {
  const { game, p1 } = prepare();
  p1.setActions(Action.fromJSON([
    [0, Action.PUT, 0, 0],
    [1, Action.PUT, 1, 0],
    [2, Action.PUT, 2, 0],
    [3, Action.PUT, 0, 1],
    [4, Action.PUT, 2, 1],
    [5, Action.PUT, 0, 2],
    [6, Action.PUT, 1, 2],
    [7, Action.PUT, 2, 2],
  ]));
  game.nextTurn();
  const status = game.getStatusJSON();
  assertEquals(status.field[4], [0, 0]);
  assertEquals(game.getStatusJSON().points[0], { basepoint: 4, wallpoint: 0 + 1 + 2 + 3 + 5 + 6 + 7 + 8 });
});

test("remove on agent エージェントがいるマスの壁はREMOVE不可", () => {
  const { game, p1, p2 } = prepare();
  p1.setActions(Action.fromJSON([[0, Action.PUT, 0, 0],]));
  p2.setActions(Action.fromJSON([[0, Action.PUT, 1, 0],]));
  game.nextTurn();
  p1.setActions(Action.fromJSON([[0, Action.REMOVE, 1, 0],]));
  game.nextTurn();
  assertEquals(game.getStatusJSON().field[1], [1, 1]);
  assertEquals(game.getStatusJSON().log[1][0][0].res, Action.REVERT);
});

test("conflict put", () => {
  const { game, p1, p2 } = prepare();
  p1.setActions(Action.fromJSON([[0, Action.PUT, 0, 0],]));
  p2.setActions(Action.fromJSON([[0, Action.PUT, 0, 0],]));
  game.nextTurn();
  const status = game.getStatusJSON();
  // util.p(status.agents);
  assertEquals(status.field[0], [0, -1]);
  assertEquals(status.log[0][0][0].res, Action.CONFLICT);
  assertEquals(status.log[0][1][0].res, Action.CONFLICT);
});

test("conflict move", () => {
  const { game, p1, p2 } = prepare();
  p1.setActions(Action.fromJSON([[0, Action.PUT, 0, 0],]));
  p2.setActions(Action.fromJSON([[0, Action.PUT, 2, 0],]));
  game.nextTurn();
  p1.setActions(Action.fromJSON([[0, Action.MOVE, 1, 0],]));
  p2.setActions(Action.fromJSON([[0, Action.MOVE, 1, 0],]));
  game.nextTurn();
  const status = game.getStatusJSON();
  // util.p(status.agents);
  assertEquals(status.field[1], [0, -1]);
  assertEquals(status.log[1][0][0].res, Action.CONFLICT);
  assertEquals(status.log[1][1][0].res, Action.CONFLICT);
});

test("conflict remove", () => {
  const { game, p1, p2 } = prepare();
  p1.setActions(Action.fromJSON([[0, Action.PUT, 0, 0],]));
  p2.setActions(Action.fromJSON([
    [0, Action.PUT, 2, 0],
    [1, Action.PUT, 1, 0],
  ]));
  game.nextTurn();
  p2.setActions(Action.fromJSON([[1, Action.MOVE, 1, 1],]));
  assertEquals(game.getStatusJSON().field[1], [1, 1]);
  game.nextTurn();
  p1.setActions(Action.fromJSON([[0, Action.REMOVE, 1, 0],]));
  p2.setActions(Action.fromJSON([[0, Action.REMOVE, 1, 0],]));
  game.nextTurn();
  assertEquals(game.getStatusJSON().field[1], [1, 1]);
  assertEquals(game.getStatusJSON().log[2][0][0].res, Action.CONFLICT);
  assertEquals(game.getStatusJSON().log[2][1][0].res, Action.CONFLICT);
});

test("conflict remove & move 壁がないところの先読みREMOVEは不可、移動が成功する", () => {
  const { game, p1, p2 } = prepare();
  p1.setActions(Action.fromJSON([[0, Action.PUT, 0, 0],]));
  p2.setActions(Action.fromJSON([[0, Action.PUT, 2, 0],]));
  game.nextTurn();
  p1.setActions(Action.fromJSON([[0, Action.REMOVE, 1, 0],]));
  p2.setActions(Action.fromJSON([[0, Action.MOVE, 1, 0],]));
  game.nextTurn();
  assertEquals(game.getStatusJSON().field[1], [1, 1]);
  assertEquals(game.getStatusJSON().log[1][0][0].res, Action.ERR_ILLEGAL_ACTION);
  assertEquals(game.getStatusJSON().log[1][1][0].res, Action.SUCCESS);
});

test("conflict remove & move 壁がないところの先読みREMOVEは不可、PUTが成功する", () => {
  const { game, p1, p2 } = prepare();
  p1.setActions(Action.fromJSON([[0, Action.PUT, 0, 0],]));
  game.nextTurn();
  p1.setActions(Action.fromJSON([[0, Action.REMOVE, 1, 0],]));
  p2.setActions(Action.fromJSON([[0, Action.PUT, 1, 0],]));
  game.nextTurn();
  assertEquals(game.getStatusJSON().field[1], [1, 1]);
  assertEquals(game.getStatusJSON().log[1][0][0].res, Action.ERR_ILLEGAL_ACTION);
  assertEquals(game.getStatusJSON().log[1][1][0].res, Action.SUCCESS);
});
