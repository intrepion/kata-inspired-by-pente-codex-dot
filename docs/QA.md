# QA evidence — 2026-10-12

## Automated
16 Node tests passed. Rules cases cover tournament opening, all eight capture directions, multiple simultaneous rays, board-edge wrapping, triples, self-bracket placement, five-pair win, overline/combined win, immutable rejection, terminal input, full legal capture game, capture restoration after undo, malformed/illegal/post-terminal saves, and AI/local undo policy. AI cases cover immediate line win before defense, single-ended line block, capture victory/defense, opening/terminal legality, and breaking a two-ended threat by cross-line capture. Two complete simulated games against dispersed moves check legality, termination, conserved stones and save replay every ply.

TypeScript strict typecheck, production build, and npm audit passed; audit found zero vulnerabilities. CI repeats these checks. Browser testing uses production `dist`, not Vite dev mode.

## Supported Chrome verification
Chrome extension remained available; no unlock or security change performed. Actual UI interactions, plus synchronous DOM control clicks through the browser's CDP capability for timing-sensitive cancellation checks. No hidden game state injection was used to complete games.

- Completed local line game with move indices `84,0,87,1,85,2,86,3,88`: Pearl line victory, highlighted five stones, last move, terminal controls, and reload retained victory.
- Completed local capture game `84,1,0,2,3,27,26,28,29,53,52,54,55,79,78,80,81,105,104,106,107`: five pairs, captured coordinates in history, victory and terminal reload retained.
- Played AI opening plus dispersed corner moves `0,12,156,168`: Ink built and won a diagonal by ply 10. Rematch reset successfully.
- Double-click center accepted only one human move; computer answered once (two plies). AI-round undo returned to zero plies.
- Center placement and immediate undo in one synchronous UI task cancelled the pending worker. Subsequent state and reload remained zero moves.
- Center placement, immediate New game and confirmation replaced the pending game; fresh board remained after the old worker had time to respond.
- Reload after a human move restored the game and resumed/completed the computer reply. Restart cancellation retained the two-ply game. Mode change confirmation reset to the requested mode.
- Injected an invalid move-log save solely for validation testing; reload displayed a fresh board and an explicit restoration warning. Subsequent valid play overwrote the test fixture.
- Enter placement, End row navigation and roving board focus verified through Chrome automation. No claims of physical key or touch testing.
- 390×844 viewport override: complete board and controls visible, no horizontal overflow (document width 375 ≤ viewport 390). Full-page screenshot inspected; temporary viewport reset afterward. Production final screenshots include line and capture wins.
- App console produced no own errors in observed logs. Installed browser extensions emitted unrelated warnings.

## Scope limits
No physical touchscreen, physical keyboard, assistive-technology speech, blocked-storage browser configuration, or audio QA. Audio is intentionally absent. The AI is bounded tactical search, not tournament strength. Automated simulations are separate from completed browser games. No public site, paid service, sidebar project registration, or boot/login service was created. Existing repositories and ports 5173–5203 were not changed.

## Artifacts
[Line win](qa/line-win.jpg), [capture win](qa/capture-win.jpg), [mobile](qa/mobile.jpg). Screenshots are real Chrome captures, visually inspected. Final live page/JS/CSS/worker assets verified HTTP 200. Detached server was verified independently of the task terminal.
