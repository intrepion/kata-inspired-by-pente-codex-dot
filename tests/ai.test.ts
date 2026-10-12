import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, play, legal, type Game } from "../src/game.ts";
import { chooseMove } from "../src/ai.ts";
function setup(
  stones: [number, 1 | 2][],
  pairs: [number, number] = [0, 0],
): Game {
  const g = fresh();
  g.turn = 2;
  g.moves = [
    { at: 84, player: 1, captured: [] },
    { at: 0, player: 2, captured: [] },
    { at: 3, player: 1, captured: [] },
  ];
  g.pairs = pairs;
  for (const [i, p] of stones) g.board[i] = p;
  return g;
}
test("AI takes a line win before defense", () => {
  const g = setup([
    [79, 1],
    [80, 2],
    [81, 2],
    [82, 2],
    [83, 2],
    [26, 1],
    [27, 1],
    [28, 1],
    [29, 1],
  ]);
  assert.equal(chooseMove(g), 84);
});
test("AI blocks a single-ended immediate line threat", () => {
  assert.equal(
    chooseMove(
      setup([
        [79, 2],
        [80, 1],
        [81, 1],
        [82, 1],
        [83, 1],
      ]),
    ),
    84,
  );
});
test("AI takes capture victory and defends capture threat", () => {
  assert.equal(
    chooseMove(
      setup(
        [
          [85, 1],
          [86, 1],
          [87, 2],
        ],
        [0, 4],
      ),
    ),
    84,
  );
  const g = setup(
    [
      [85, 2],
      [86, 2],
      [87, 1],
    ],
    [4, 0],
  );
  const n = play(g, chooseMove(g)!);
  assert.equal(n.board[84], 2);
});
test("AI observes opening and terminal legality", () => {
  const g = fresh();
  assert.equal(chooseMove(g), 84);
  const n = play(g, 84);
  assert.equal(legal(n, chooseMove(n)!), true);
  n.reason = "draw";
  assert.equal(chooseMove(n), null);
});
test("AI breaks a two-ended line threat by capturing across it", () => {
  const g = setup([
    [80, 1],
    [81, 1],
    [82, 1],
    [83, 1],
    [95, 1],
    [108, 2],
  ]);
  assert.equal(chooseMove(g), 69);
  const next = play(g, 69);
  assert.deepEqual(next.pairs, [0, 1]);
  assert.equal(next.board[82], 0);
});
