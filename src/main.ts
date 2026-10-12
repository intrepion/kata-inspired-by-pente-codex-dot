import './style.css';
import {fresh,play,legal,undo,serialize,restore,coordinate,type Game,type Mode} from './game';
const key='tide-and-stone-v1';
let game:Game=fresh(),mode:Mode='ai',focus=84,worker:Worker|null=null,busy=false,storageMessage='Saved on this device',aiError=false;
try{const saved=localStorage.getItem(key);if(saved){const restored=restore(saved);game=restored.game;mode=restored.mode;storageMessage='Your game is restored';}}catch{storageMessage='Save could not be restored. A fresh board is ready.';}
document.querySelector<HTMLDivElement>('#app')!.innerHTML=`
<header class="masthead"><a class="brand" href="#"><span class="mark" aria-hidden="true">◒</span><span>Tide <i>&</i> Stone<small>A GAME OF LINES & CAPTURES</small></span></a><a class="rules-link" href="#guide">How to play <span aria-hidden="true">↗</span></a></header>
<main><section class="intro"><div><p class="eyebrow">THE QUIET ART OF STRATEGY</p><h1>Make a line.<br><em>Turn the tide.</em></h1></div><p>Five stones connect. Two stones disappear.<br>A small move can change everything.</p></section>
<div class="game-layout"><section class="play-area" aria-label="Game area"><div class="board-top"><span id="turn-label"></span><span class="board-meta">13 × 13 · TOURNAMENT OPENING</span></div><div class="board-frame"><div class="letters" aria-hidden="true">${'ABCDEFGHIJKLM'.split('').map(s=>`<span>${s}</span>`).join('')}</div><div class="board-wrap"><div class="numbers" aria-hidden="true">${Array.from({length:13},(_,i)=>`<span>${13-i}</span>`).join('')}</div><div id="board" role="grid" aria-label="13 by 13 strategy board. Arrow keys navigate; Enter places a stone."></div></div></div><div class="board-bottom"><span><span class="last-key">◇</span> Last move <strong id="last">—</strong></span><span id="move-count">Move 1</span></div><p id="status" role="status" aria-live="polite"></p><div class="actions"><button id="undo">↶ Undo</button><button id="restart">New game</button><button id="retry" hidden>Retry thinking</button><span id="save-note"></span></div></section>
<aside><section class="card match-card"><p class="eyebrow">YOUR TABLE</p><h2>A little friendly rivalry.</h2><label for="mode">Play against</label><select id="mode"><option value="ai">The tide · computer</option><option value="local">A friend · two players</option></select><div class="player-card" id="pearl-card"><span class="sample pearl"></span><div><strong>Pearl</strong><small id="pearl-person">You · first move</small></div><b id="pearl-pairs">0<small>/ 5 PAIRS</small></b></div><div class="player-card" id="ink-card"><span class="sample ink"></span><div><strong>Ink</strong><small id="ink-person">The tide · computer</small></div><b id="ink-pairs">0<small>/ 5 PAIRS</small></b></div><div class="pair-track" aria-hidden="true"><span id="pearl-track"></span><span id="ink-track"></span></div><p class="tip" id="tip"></p></section><section class="card log-card"><div class="section-title"><h2>Captured by the tide</h2><span id="capture-total">0 pairs</span></div><ol id="history"></ol><p class="log-note">Captured intersections become open again.</p></section></aside></div>
<section id="guide" class="guide"><div><p class="eyebrow">A MINUTE TO LEARN</p><h2>Two ways to win.<br>Endless ways to get there.</h2><p>Inspired by Pente. Reimagined for a smaller shore.</p></div><div class="lesson"><b>01</b><h3>Connect five</h3><div class="diagram line-diagram" aria-label="Five Pearl stones in a line">● ● ● ● ●</div><p>Place one stone each turn. Make five or more in a continuous row, column, or diagonal.</p></div><div class="lesson"><b>02</b><h3>Catch a pair</h3><div class="diagram capture-diagram" aria-label="Pearl, Ink, Ink, new Pearl"><span>●</span> <i>● ●</i> <span>◉</span></div><p>Place a stone to bracket exactly two enemy stones. Remove them. Capture five pairs to win.</p></div><details><summary>The opening, captures & controls</summary><p>Pearl starts at G7. On Pearl’s second move, choose outside the shaded central 5×5 area. Ink may start anywhere empty. Later moves may use any open intersection.</p><p>One move can capture in several directions at once. Triples cannot be captured. Playing your own pair between enemy stones does not remove it. Captures resolve before checking victory. A line wins immediately; your opponent gets no extra reply. If both goals happen together, both are celebrated. A full board without a winner is a draw.</p><p>Use arrows to navigate, Home/End for row ends, Ctrl+Home/End for board corners, and Enter or Space to place. Undo takes back one move with a friend, or your last turn and the computer’s reply. New game asks before clearing an active game. Completed games offer a rematch.</p><p>Your game saves automatically in this browser. The computer looks for wins, protects against immediate threats and weighs its next move. It is a tactical practice partner, not a tournament engine.</p></details></section>
</main><footer><span>TIDE & STONE</span><span>Take your time. Find your opening.</span><a href="https://www.pente.org/help/helpWindow.jsp?file=playGameRules#pente" target="_blank" rel="noreferrer">Pente rules ↗</a></footer>
<dialog id="confirm"><form method="dialog"><p class="eyebrow">A FRESH START</p><h2>Leave this game?</h2><p>Your current game will be replaced.</p><div class="actions"><button value="cancel">Keep playing</button><button value="yes" class="primary">Start fresh</button></div></form></dialog>`;
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const board=el('board');
const cells:HTMLButtonElement[]=[];
for(let y=0;y<13;y++){
 const row=document.createElement('div');row.setAttribute('role','row');row.className='board-row';
 for(let x=0;x<13;x++){
  const at=y*13+x,cell=document.createElement('button');cell.className='intersection';cell.type='button';cell.setAttribute('role','gridcell');cell.dataset.at=String(at);
  cell.addEventListener('click',()=>{focus=at;attempt(at);});
  cell.addEventListener('focus',()=>{focus=at;updateFocus();});
  cell.addEventListener('keydown',e=>{
   let target=at;
   if(e.key==='ArrowLeft')target=y*13+Math.max(0,x-1);else if(e.key==='ArrowRight')target=y*13+Math.min(12,x+1);else if(e.key==='ArrowUp')target=Math.max(0,at-13);else if(e.key==='ArrowDown')target=Math.min(168,at+13);else if(e.key==='Home')target=e.ctrlKey?0:y*13;else if(e.key==='End')target=e.ctrlKey?168:y*13+12;else return;
   e.preventDefault();focus=target;updateFocus();cells[target].focus();
  });row.append(cell);cells.push(cell);
 }board.append(row);
}
function updateFocus(){cells.forEach((cell,i)=>cell.tabIndex=i===focus?0:-1);}
function save(){try{localStorage.setItem(key,serialize(game,mode));storageMessage='Saved on this device';}catch{storageMessage='Saving unavailable — keep this tab open.';}}
function cancel(){worker?.terminate();worker=null;busy=false;aiError=false;}
function attempt(at:number){
 if(busy||game.reason||(mode==='ai'&&game.turn===2))return;
 if(!legal(game,at)){el('status').textContent=game.board[at]?'That intersection already has a stone.':'The tournament opening requires the highlighted legal area.';return;}
 game=play(game,at);save();think();render();
}
function think(){
 if(mode!=='ai'||game.turn!==2||game.reason||worker)return;
 busy=true;aiError=false;
 try{
  const current=new Worker(new URL('./worker.ts',import.meta.url),{type:'module'});worker=current;
  current.onmessage=(event:MessageEvent<number|null>)=>{
   if(worker!==current)return;
   cancel();if(event.data!==null&&legal(game,event.data)){game=play(game,event.data);save();}else aiError=true;render();
  };
  current.onerror=()=>{if(worker!==current)return;cancel();aiError=true;render();};current.postMessage(game);
 }catch{cancel();aiError=true;}
}
function render(){
 const last=game.moves.at(-1),player=game.turn===1?'Pearl':'Ink';
 cells.forEach((cell,i)=>{
  const stone=game.board[i],isLegal=legal(game,i);
  cell.dataset.stone=String(stone);cell.classList.toggle('last',last?.at===i);cell.classList.toggle('winning',game.line.includes(i));cell.classList.toggle('opening-zone',game.moves.length===2&&Math.max(Math.abs(i%13-6),Math.abs(Math.floor(i/13)-6))<3);cell.classList.toggle('center',game.moves.length===0&&i===84);
  cell.setAttribute('aria-label',`${coordinate(i)}, ${stone===1?'Pearl':stone===2?'Ink':'empty'}${last?.at===i?', last move':''}${!isLegal&&!stone?', unavailable':''}`);
  cell.setAttribute('aria-disabled',String(!isLegal||busy||(mode==='ai'&&game.turn===2)));
 });updateFocus();
 el('turn-label').innerHTML=`<span class="turn-dot ${game.turn===1?'pearl':'ink'}"></span> ${game.reason?'Game complete':busy?'The tide is thinking…':`${player} to move`}`;
 el('status').textContent=game.reason?(game.winner?`${game.winner===1?'Pearl':'Ink'} wins${game.reason==='both'?' with a line and five captured pairs':game.reason==='line'?' with five in a row':' with five captured pairs'}!`:'A full shore — this game is a draw.') : aiError?'Thinking was interrupted. Retry, undo, or start a new game.':busy?'Ink is considering the board. You can undo or start fresh.':game.moves.length===0?'Your opening: place Pearl at G7, the center.':game.moves.length===2?'Pearl’s second stone goes outside the shaded central square.':`${player}, choose an open intersection.`;
 el('status').classList.toggle('victory',Boolean(game.reason));
 for(const [id,p] of [['pearl',1],['ink',2]] as const){el(`${id}-pairs`).innerHTML=`${game.pairs[p-1]}<small>/ 5 PAIRS</small>`;el(`${id}-card`).classList.toggle('active',!game.reason&&game.turn===p);el(`${id}-track`).innerHTML=Array.from({length:5},(_,i)=>`<i class="${i<game.pairs[p-1]?'filled':''}"></i>`).join('');}
 el('last').textContent=last?`${coordinate(last.at)} · ${last.player===1?'Pearl':'Ink'}`:'—';el('move-count').textContent=`${game.moves.length} moves played`;
 el<HTMLButtonElement>('undo').disabled=game.moves.length===0;el('restart').textContent=game.reason?'Play again':'New game';el('save-note').textContent=storageMessage;
 el<HTMLSelectElement>('mode').value=mode;el('pearl-person').textContent=mode==='ai'?'You · first move':'Player one · first move';el('ink-person').textContent=mode==='ai'?'The tide · computer':'Player two';el('tip').textContent='A pair can be a bridge — or a trap. Protect stones that stand together.';
 const captures=game.moves.filter(m=>m.captured.length);el('capture-total').textContent=`${game.pairs[0]+game.pairs[1]} pairs`;
 el('history').replaceChildren();if(!captures.length){const li=document.createElement('li');li.className='empty-log';li.textContent='No captures yet. The water is still.';el('history').append(li);}
 captures.slice().reverse().forEach(m=>{const li=document.createElement('li');li.textContent=`${m.player===1?'Pearl':'Ink'} at ${coordinate(m.at)} · +${m.captured.length/2} pair${m.captured.length>2?'s':''}`;const small=document.createElement('small');small.textContent=`Removed ${m.captured.map(coordinate).join(', ')}`;li.append(small);el('history').append(li);});
 el('retry').hidden=!aiError;
}
function reset(nextMode=mode){cancel();game=fresh();mode=nextMode;focus=84;save();render();}
const dialog=el<HTMLDialogElement>('confirm');let afterConfirm:(()=>void)|null=null;
function confirmReset(action:()=>void){if(!game.moves.length||game.reason){action();return;}afterConfirm=action;dialog.showModal();}
dialog.addEventListener('close',()=>{const action=afterConfirm;afterConfirm=null;if(dialog.returnValue==='yes')action?.();else el<HTMLSelectElement>('mode').value=mode;});
dialog.addEventListener('cancel',()=>{dialog.returnValue='cancel';});
el('restart').addEventListener('click',()=>confirmReset(()=>reset()));
el('undo').addEventListener('click',()=>{cancel();game=undo(game,mode);save();think();render();});
el<HTMLSelectElement>('mode').addEventListener('change',e=>{const next=(e.target as HTMLSelectElement).value as Mode;el<HTMLSelectElement>('mode').value=mode;confirmReset(()=>reset(next));});
el('retry').addEventListener('click',()=>{think();render();});
think();render();
