import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fresh,play,legal} from '../src/game.ts';
test('tournament opening forces center then outside central five',()=>{
 let g=fresh(); assert.equal(legal(g,0),false); g=play(g,84); g=play(g,85);
 assert.equal(legal(g,86),false); assert.equal(legal(g,87),true);
});
import {replay,restore,serialize,undo, type Game} from '../src/game.ts';
function position(stones:[number,number][],turn:1|2=1,pairs:[number,number]=[0,0]):Game{
 const g=fresh();g.moves=[{at:84,player:1,captured:[]},{at:0,player:2,captured:[]},{at:3,player:1,captured:[]}];g.turn=turn;g.pairs=pairs;
 for(const [at,p] of stones)g.board[at]=p;return g;
}
test('captures simultaneous pairs on opposite rays and diagonals',()=>{
 const g=position([[85,2],[86,2],[87,1],[83,2],[82,2],[81,1],[98,2],[112,2],[126,1]]);
 const n=play(g,84);assert.deepEqual(n.pairs,[3,0]);assert.deepEqual([...n.moves.at(-1)!.captured].sort((a,b)=>a-b),[82,83,85,86,98,112]);assert.equal(g.board[85],2);
});
test('edge does not wrap, triples and self-brackets do not capture',()=>{
 assert.deepEqual(play(position([[12,2],[13,2],[14,1]]),11).pairs,[0,0]);
 assert.deepEqual(play(position([[85,2],[86,2],[87,2],[88,1]]),84).pairs,[0,0]);
 assert.equal(play(position([[81,2],[82,1],[84,2]]),83).board[83],1);
});
test('fifth pair wins and no further moves accepted',()=>{
 const n=play(position([[85,2],[86,2],[87,1]],1,[4,0]),84);assert.equal(n.reason,'capture');assert.equal(n.winner,1);assert.throws(()=>play(n,0));
});
test('overline and combined win resolve after capture',()=>{
 const stones:[number,number][]=[[79,1],[80,1],[81,1],[82,1],[83,1],[97,2],[110,2],[123,1]];
 assert.equal(play(position(stones),84).reason,'line');assert.equal(play(position(stones,1,[4,0]),84).reason,'both');
});
test('replay saves reject malformed, illegal and post-terminal logs',()=>{
 const g=replay([84,85,87,0]);assert.deepEqual(restore(serialize(g,'ai')).game,g);
 for(const raw of ['null','{}','{"version":1,"mode":"ai","moves":[0]}','{"version":1,"mode":"local","moves":[84,84]}','{"version":1,"mode":"ai","moves":[84,"85"]}'])assert.throws(()=>restore(raw));
 const line=[84,0,87,1,85,2,86,3,88];assert.equal(replay(line).reason,'line');assert.throws(()=>restore(JSON.stringify({version:1,mode:'local',moves:[...line,4]})));
});
test('undo cancels pending human ply or completed AI round; local takes one',()=>{
 const g=replay([84,85,87,0]);assert.equal(undo(g,'ai').moves.length,2);assert.equal(undo(g,'local').moves.length,3);assert.equal(undo(replay([84]),'ai').moves.length,0);assert.equal(undo(fresh(),'ai').moves.length,0);
});
test('a whole legal game reaches five pairs and undo restores captured stones',()=>{
 const moves=[84,1,0,2,3,27,26,28,29,53,52,54,55,79,78,80,81,105,104,106,107];const g=replay(moves);
 assert.equal(g.reason,'capture');assert.deepEqual(g.pairs,[5,0]);const previous=undo(g,'local');assert.equal(previous.board[105],2);assert.equal(previous.board[106],2);assert.deepEqual(previous.pairs,[4,0]);
});
test('capture triggers in all eight directions without crossing edges',()=>{
 for(const step of [1,-1,13,-13,14,-14,12,-12]){const g=position([[84+step,2],[84+step*2,2],[84+step*3,1]]);const n=play(g,84);assert.deepEqual(n.pairs,[1,0]);}
});
test('invalid coordinates and repeat actions do not mutate the game',()=>{
 const g=fresh();for(const at of [-1,169,NaN,84.5])assert.throws(()=>play(g,at));const n=play(g,84);assert.throws(()=>play(n,84));assert.equal(n.moves.length,1);assert.equal(g.moves.length,0);
});
