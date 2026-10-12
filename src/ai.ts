import {legal,play,type Game,type Player} from './game';
const weights=[0,3,24,220,5000,200000];
function value(g:Game,p:Player):number{
 let score=g.pairs[p-1]*450;
 for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]])for(let y=0;y<13;y++)for(let x=0;x<13;x++){
  const ex=x+4*dx,ey=y+4*dy;if(ex<0||ex>=13||ey<0||ey>=13)continue;
  let count=0,blocked=false;
  for(let n=0;n<5;n++){const stone=g.board[(y+n*dy)*13+x+n*dx];if(stone===p)count++;else if(stone)blocked=true;}
  if(!blocked)score+=weights[count];
 }
 return score;
}
function available(g:Game):number[]{return g.board.flatMap((_,i)=>legal(g,i)?[i]:[]);}
function wins(g:Game):number[]{return available(g).filter(at=>play(g,at).winner===g.turn);}
export function chooseMove(g:Game):number|null{
 const moves=available(g);if(!moves.length)return null;
 const win=wins(g);if(win.length)return win[0];
 const enemy=(3-g.turn) as Player;
 const threats=wins({...g,turn:enemy});
 const ranked=moves.map(at=>{
  const next=play(g,at);
  const center=12-Math.abs(at%13-6)-Math.abs(Math.floor(at/13)-6);
  return {at,next,score:value(next,g.turn)-value(next,enemy)*1.15+center,unsafe:threats.length?wins(next).length:0};
 }).sort((a,b)=>a.unsafe-b.unsafe||b.score-a.score||a.at-b.at);
 // Every legal defense is examined, including captures that break multiple threats.
 if(threats.length)return ranked[0].at;
 // A bounded reply search avoids gifting a capture or an immediate line win.
 let best=ranked[0].at,bestScore=-Infinity;
 for(const candidate of ranked.slice(0,12)){
  let worst=Infinity;
  for(const reply of available(candidate.next)){
   const next=play(candidate.next,reply);
   const score=next.winner===enemy?-1e9:value(next,g.turn)-value(next,enemy)*1.15;
   worst=Math.min(worst,score);
  }
  const score=worst+candidate.score*.2;
  if(score>bestScore){bestScore=score;best=candidate.at;}
 }
 return best;
}
