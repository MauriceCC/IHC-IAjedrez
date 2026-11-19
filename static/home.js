'use strict';
let selection=0;
const byId=id=>document.getElementById(id);
const glyphs={K:'♔',Q:'♕',R:'♖',B:'♗',N:'♘',P:'♙',k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'};
const spanish=s=>String(s).replace(/[KQRBN]/g,c=>({K:'R',Q:'D',R:'T',B:'A',N:'C'}[c]));
const moveLabel=(ply,san)=>`${Math.ceil(ply/2)}${ply%2?'.':'…'} ${spanish(san)}`;
const cache={};
function storedReviewed(game){try{return JSON.parse(localStorage.getItem(`iajedrez:reviewed:${game}`)||'[]');}catch{return [];}}
// Miniatura reconocible de la posición clave (el error con mayor pérdida).
function miniBoard(position,move){
 let html='';
 for(let rank=8;rank>=1;rank--)for(const file of 'abcdefgh'){
  const sq=file+rank,p=position.pieces[sq],dark=('abcdefgh'.indexOf(file)+rank)%2;
  const mark=move&&(move.slice(0,2)===sq?' from':move.slice(2,4)===sq?' to':'');
  html+=`<span class="mini-sq ${dark?'dark':'light'}${mark}">${p?`<span class="${p===p.toUpperCase()?'w':'b'}">${glyphs[p]}</span>`:''}</span>`;
 }
 return `<span class="mini-board" aria-hidden="true">${html}</span>`;
}
async function loadGame(name){
 if(!cache[name]){
  const response=await fetch('/api/review/game?game='+name);
  if(!response.ok)throw Error('No se pudo cargar la partida. Inténtalo nuevamente.');
  cache[name]=await response.json();
 }
 return cache[name];
}
async function decorate(button){
 try{
  const game=await loadGame(button.dataset.game),report=game.report;if(!report)return;
  const errors=report.ranking.filter(r=>r.priority>=50),key=errors[0];
  const done=errors.filter(r=>storedReviewed(button.dataset.game).includes(r.ply)).length;
  const thumb=key?`<span class="thumb">${miniBoard(game.positions[key.ply],game.moves[key.ply-1])}<span class="thumb-caption">Error principal: ${moveLabel(key.ply,game.sans[key.ply-1])}</span></span>`:'';
  button.insertAdjacentHTML('beforeend',`${thumb}<span class="history-progress ${done===errors.length?'complete':''}">${done===errors.length?'✓ Revisión completa':`Revisados ${done}/${errors.length} · ${errors.length-done} pendientes`}</span>`);
 }catch{}
}
document.querySelectorAll('[data-game]').forEach(button=>{decorate(button);button.onclick=async()=>{
 const request=++selection;
 document.querySelectorAll('.history').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-current',b===button?'true':'false');});
 byId('status').textContent='Cargando tu conversación…';
 try{
  const game=await loadGame(button.dataset.game);if(request!==selection)return;
  const first='Hola Chat gpt, eres experto en ajedrez, podrias indicarme cual fue mi error en esta partida por favor?';
  const second='esta es la partida que jugue y necesito que me indiques los momentos en donde cometi errores clave. Paso a paso desde la apertura hasta el final del juego';
  byId('prompt').textContent=game.study_prompt ? game.study_prompt+'\n\n'+game.followups.map((q,i)=>'Consulta '+(i+2)+': '+q).join('\n\n') : button.dataset.game==='mauricio'?first+'\n\n'+game.pgn:game.pgn+'\n\n'+second;
  byId('chat-title').textContent=game.headers.White+' — '+game.headers.Black;
  byId('open-analysis').href='/?game='+button.dataset.game;
  const errors=game.report?game.report.ranking.filter(r=>r.priority>=50):[];
  const done=errors.filter(r=>storedReviewed(button.dataset.game).includes(r.ply)).length;
  byId('open-analysis').textContent=done&&done<errors.length?`Continuar la revisión (${done}/${errors.length}) →`:'Abrir el análisis de la partida →';
  byId('welcome').hidden=true;byId('conversation').hidden=false;byId('status').textContent='';
  document.querySelector('main').scrollTop=0;
 }catch(error){if(request===selection)byId('status').textContent='⚠ '+error.message;}
};});
byId('new-chat').onclick=()=>{selection++;document.querySelector('[name="player-color"][value="white"]').checked=true;byId('welcome').hidden=false;byId('conversation').hidden=true;byId('status').textContent='';document.querySelectorAll('.history').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-current','false');});byId('pgn').focus();};
