# Tide & Stone
A polished original Pente-inspired strategy game: connect five, capture pairs, and turn the tide. Play the tactical computer or share a board with a friend.

Private repository: https://github.com/intrepion/kata-inspired-by-pente-codex-dot

## Play locally
Requires Node 24 and npm. Run `npm ci`, then `npm run dev` for development at http://127.0.0.1:5204. For the session-only detached production server, run `npm run build && node restart.cjs`. No login/boot autostart is installed. Logs: `/tmp/tide-stone-5204.log`; PID: `/tmp/tide-stone-5204.pid`. The restart script only terminates a recorded process whose command matches this exact project's server path. A different service occupying 5204 is never stopped.

Installed directory: `/Users/intrepion/Documents/Codex/2026-10-11/task-20/kata-inspired-by-pente-codex-dot`.

Exact restart command:
```sh
cd /Users/intrepion/Documents/Codex/2026-10-11/task-20/kata-inspired-by-pente-codex-dot && npm run build && node restart.cjs
```

## Rules and controls
13×13 board. Pearl starts at G7; Pearl's second stone must be outside the center 5×5. Five or more in a line, or five captured pairs, wins immediately. All captures resolve simultaneously first. Bracket exactly two enemies with a newly placed stone; no self-capture or triple capture. See the illustrated in-game guide and [specification](docs/SPEC.md) for exact semantics and authoritative rules sources.

Arrows navigate the board; Enter/Space place; Home/End jump within a row, Ctrl+Home/End to corners. Undo removes one move locally, or the latest human/computer round in AI mode. Replay-validated local browser saves resume automatically. New game confirms before replacing an active game; rematch clears a completed game.

## Validation
`npm test`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=moderate`. GitHub Actions runs all four checks on pushes and pull requests. See [QA](docs/QA.md), [implementation](docs/IMPLEMENTATION.md), and [independent reviews](docs/REVIEW.md).

The AI is a deterministic tactical practice partner, with exhaustive immediate win/defense checks and bounded reply scoring in a worker. It is not a tournament solver. No online multiplayer, audio, accounts, analytics, public hosting, or external assets. Physical touch/keyboard hardware and screen-reader speech were not tested.

## Play online

[Play the hosted game](https://intrepion.github.io/kata-inspired-by-pente-codex-dot/)
