import { test } from "node:test";
import assert from "node:assert/strict";
import { fresh, play, legal, restore, serialize } from "../src/game.ts";
import { chooseMove } from "../src/ai.ts";
test("complete AI games against dispersed moves stay legal and round-trip every ply", () => {
  for (const offset of [0, 7]) {
    let g = fresh();
    for (let ply = 0; ply < 185 && !g.reason; ply++) {
      const options = g.board.flatMap((_, i) => (legal(g, i) ? [i] : []));
      const at =
        g.turn === 2
          ? chooseMove(g)
          : options[(ply * 31 + offset) % options.length];
      assert.notEqual(at, null);
      assert.equal(legal(g, at!), true);
      g = play(g, at!);
      assert.deepEqual(restore(serialize(g, "ai")).game, g);
      assert.equal(
        g.board.filter(Boolean).length,
        g.moves.length - 2 * (g.pairs[0] + g.pairs[1]),
      );
    }
    assert.notEqual(g.reason, "");
  }
});
