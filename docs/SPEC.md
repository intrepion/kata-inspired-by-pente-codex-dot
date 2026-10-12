# Tide & Stone specification
An original quiet coastal strategy game inspired by Pente. No external assets, accounts, payments, public deployment, or audio.

## Resolved design tree (autonomous Grill with Docs)
User explicitly authorized recommended defaults, so interview and seam confirmation are adapted to recorded decisions.
1. Rules → 13×13 compact board; Pearl goes first at G7; Pearl's second stone outside the central 5×5 square (Chebyshev distance ≥3). Ink's first move unrestricted.
2. Outcome → place, simultaneously remove all bracketed opponent pairs in eight directions, then check mover's line and capture totals. Five or more consecutive stones wins, five or more captured pairs wins; both conditions report a combined win. Immediate terminal state, no Boat-Pente reply. Full post-capture board without a winner draws. No retroactive/self captures.
3. Modes → default human Pearl vs deterministic tactical AI Ink; optional local two-player. No network multiplayer.
4. Actions → undo one ply locally, a whole human/AI round against AI; pending AI cancelled by undo, restart or mode changes. Completed games can be undone for practice. Restart confirmation when moves exist; rematch resets instantly after completion.
5. Persistence → versioned move log replayed through rules. Invalid or oversized saves rejected atomically; localStorage failures visible. Mode and moves saved after every accepted action. Reload resumes pending AI. No arbitrary board deserialization.
6. UX → roving board focus, arrows/Home/End, Enter/Space, visible last stone, captured coordinates and pair totals, responsive scroll-free board, in-page illustrated rules.
7. AI → worker off main thread; exhaustive immediate wins and opponent one-move threats; evaluates all legal moves for safe defense, then bounded positional scoring. Deterministic, tactical, not tournament strength.

## Sources
[Pente.org official game rules](https://www.pente.org/help/helpWindow.jsp?file=playGameRules#pente), accessed 2026-10-12, confirms overlines, pair capture, ten captured stones, no self-capture, and tournament restriction. Center first move follows [Pente.org Gomoku/Pente rules](https://www.pente.org/help/helpWindow.jsp?file=playGameRules). Compact board and combined-win label are our explicit adaptations.

## Public test seams
`play`/`legal`: opening, capture and outcome; `chooseMove`: immediate tactics; `restore`/`serialize`/`undo`: persistence and action policy. UI checked separately in Chrome; no internal mocking required.
