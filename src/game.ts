export type Player = 1 | 2;
export type Stone = 0 | Player;
export type Mode = "ai" | "local";
export interface Move {
  at: number;
  player: Player;
  captured: number[];
}
export interface Game {
  board: Stone[];
  turn: Player;
  pairs: [number, number];
  moves: Move[];
  winner: Player | 0;
  reason: "" | "line" | "capture" | "both" | "draw";
  line: number[];
}
export const SIZE = 13;
export const AREA = SIZE * SIZE;
export const CENTER = Math.floor(AREA / 2);
export function inOpeningZone(at: number): boolean {
  return (
    Math.max(
      Math.abs((at % SIZE) - Math.floor(SIZE / 2)),
      Math.abs(Math.floor(at / SIZE) - Math.floor(SIZE / 2)),
    ) < 3
  );
}
export function fresh(): Game {
  return {
    board: Array(AREA).fill(0),
    turn: 1,
    pairs: [0, 0],
    moves: [],
    winner: 0,
    reason: "",
    line: [],
  };
}
export function legal(g: Game, at: number): boolean {
  if (g.reason || !Number.isInteger(at) || at < 0 || at >= AREA || g.board[at])
    return false;
  if (g.moves.length === 0) return at === CENTER;
  if (g.moves.length === 2) return !inOpeningZone(at);
  return true;
}
export function play(g: Game, at: number): Game {
  if (!legal(g, at)) throw new Error("Choose a legal empty intersection.");
  const board = [...g.board],
    player = g.turn,
    enemy = (3 - player) as Player,
    captured: number[] = [];
  board[at] = player;
  const x = at % 13,
    y = Math.floor(at / 13);
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const points = [1, 2, 3].map((n) => [x + dx * n, y + dy * n]);
      if (points.some(([a, b]) => a < 0 || a >= 13 || b < 0 || b >= 13))
        continue;
      const [a, b, c] = points.map(([a, b]) => b * 13 + a);
      if (board[a] === enemy && board[b] === enemy && board[c] === player)
        captured.push(a, b);
    }
  for (const p of captured) board[p] = 0;
  const pairs: [number, number] = [...g.pairs];
  pairs[player - 1] += captured.length / 2;
  let line: number[] = [];
  for (const [dx, dy] of [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ]) {
    const run = [at];
    for (const sign of [-1, 1])
      for (let n = 1; n < 13; n++) {
        const a = x + dx * n * sign,
          b = y + dy * n * sign;
        if (
          a < 0 ||
          a >= 13 ||
          b < 0 ||
          b >= 13 ||
          board[b * 13 + a] !== player
        )
          break;
        run.push(b * 13 + a);
      }
    if (run.length >= 5) line = run;
  }
  const capture = pairs[player - 1] >= 5;
  const reason = line.length
    ? capture
      ? "both"
      : "line"
    : capture
      ? "capture"
      : board.every(Boolean)
        ? "draw"
        : "";
  return {
    board,
    turn: enemy as Player,
    pairs,
    moves: [...g.moves, { at, player, captured }],
    winner: reason && reason !== "draw" ? player : 0,
    reason,
    line,
  };
}
export function replay(moves: number[]): Game {
  return moves.reduce((g, at) => play(g, at), fresh());
}
export function undo(g: Game, mode: Mode): Game {
  const count = mode === "local" ? 1 : g.moves.at(-1)?.player === 2 ? 2 : 1;
  return replay(
    g.moves.slice(0, Math.max(0, g.moves.length - count)).map((m) => m.at),
  );
}
export function serialize(g: Game, mode: Mode): string {
  return JSON.stringify({ version: 1, mode, moves: g.moves.map((m) => m.at) });
}
export function restore(raw: string): { game: Game; mode: Mode } {
  if (raw.length > 20000) throw new Error("Save is too large.");
  const data = JSON.parse(raw);
  if (
    !data ||
    data.version !== 1 ||
    !["ai", "local"].includes(data.mode) ||
    !Array.isArray(data.moves) ||
    data.moves.length > 1000
  )
    throw new Error("Save format is invalid.");
  return { game: replay(data.moves), mode: data.mode };
}
export function coordinate(at: number): string {
  return `${String.fromCharCode(65 + (at % 13))}${13 - Math.floor(at / 13)}`;
}
