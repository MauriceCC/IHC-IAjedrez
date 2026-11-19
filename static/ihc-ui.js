'use strict';
// Apoyos de interfaz derivados del checklist IHC (docs/IHC-Checklist.pdf):
// progreso de revisión, ruta de navegación, modos visibles, atajos y ajustes de visualización.

/* ---------- Clasificación y progreso de revisión ---------- */
const SEVERITY=[
 {id:'grave',name:'Errores graves',short:'Graves',symbol:'??'},
 {id:'error',name:'Errores',short:'Errores',symbol:'?'},
 {id:'inacc',name:'Imprecisiones',short:'Imprecisiones',symbol:'?!'}
];
function severityOf(row){
 if(!row||row.priority<50)return null;
 if(row.kind==='Imprecisión')return 'inacc';
 if(row.kind==='Error')return 'error';
 return 'grave';
}
const storeKey=name=>`iajedrez:${name}:${studyId}`;
function readStore(name,fallback){try{const v=localStorage.getItem(storeKey(name));return v?JSON.parse(v):fallback;}catch{return fallback;}}
function writeStore(name,value){try{localStorage.setItem(storeKey(name),JSON.stringify(value));}catch{}}
const reviewed=new Set();// se carga en initDisplaySettings, cuando studyId ya existe
let lastReviewed=null,progressTotals=null;
function errorRows(){return report?report.ranking.filter(r=>r.priority>=50):[];}
function markReviewed(ply){
 const row=report?.rows.find(r=>r.ply===ply);
 if(!severityOf(row)||reviewed.has(ply))return;
 reviewed.add(ply);lastReviewed=ply;writeStore('reviewed',[...reviewed]);
}
function toggleReviewed(ply){if(reviewed.has(ply)){reviewed.delete(ply);writeStore('reviewed',[...reviewed]);}else markReviewed(ply);}
function nextPending(category){return errorRows().find(r=>!reviewed.has(r.ply)&&(!category||severityOf(r)===category));}
function progressCounts(){
 const rows=errorRows();
 return SEVERITY.map(s=>{const list=rows.filter(r=>severityOf(r)===s.id);return {...s,total:list.length,done:list.filter(r=>reviewed.has(r.ply)).length};}).filter(s=>s.total);
}
function renderProgress(){
 const box=$('progress');if(!box)return;
 if(!report){box.innerHTML='';return;}
 const counts=progressCounts(),total=counts.reduce((a,c)=>a+c.total,0),done=counts.reduce((a,c)=>a+c.done,0);
 const next=nextPending(),pulse=lastReviewed;lastReviewed=null;
 const pulsing=pulse&&severityOf(report.rows.find(r=>r.ply===pulse));
 box.innerHTML=`<div class="progress-strip"><div class="progress-chips">${counts.map(c=>`<button type="button" class="progress-chip sev-${c.id} ${c.done===c.total?'complete':''} ${pulsing===c.id?'pulse':''}" data-next-cat="${c.id}" title="${c.done===c.total?'Ver un error revisado en Evaluar':'Ver el siguiente pendiente en Evaluar'}" aria-label="${c.name}: ${c.done} de ${c.total} revisados. Ver en Evaluar"><span class="sev-symbol" aria-hidden="true">${c.symbol}</span>${c.short} <b>${c.done}/${c.total}</b>${c.done===c.total?' <span aria-hidden="true">✓</span>':''}</button>`).join('')}</div>${next?`<button type="button" class="next-pending" data-next-pending title="Atajo: N">Revisar ${esc(next.label)} →</button>`:`<span class="all-done">✓ Todo revisado</span>`}</div>`;
 progressTotals={done,total};
}

/* ---------- Historial de navegación (Atrás) ---------- */
const backStack=[];
function remember(){
 if(!game)return;
 backStack.push({state:clone(state),scrollTop:$('results').scrollTop,returnLine:returnLine&&clone(returnLine),returnLearn:returnLearn&&clone(returnLearn)});
 if(backStack.length>40)backStack.shift();
}
function goBack(){
 const snap=backStack.pop();if(!snap)return;
 state=snap.state;returnLine=snap.returnLine;returnLearn=snap.returnLearn;selected='';
 render();revealSelection();$('results').scrollTop=snap.scrollTop;
}

/* ---------- Ruta de navegación ---------- */
const VIEW_TITLES={evaluate:'Evaluar',chain:'Concatenar',learn:'Aprender',resources:'Referencias'};
function renderCrumbs(){
 const nav=$('crumbs');if(!nav||!game)return;
 const items=[];
 const deeper=state.secondary||state.line||state.practice||(focusPly()>0&&['chain','learn'].includes(state.view));
 items.push(deeper?`<button type="button" data-crumb-view="${state.view}">${VIEW_TITLES[state.view]}</button>`:`<span aria-current="page">${VIEW_TITLES[state.view]}</span>`);
 if(focusPly()>0&&deeper){
  const sub=state.secondary||state.line||state.practice;
  items.push(sub?`<button type="button" data-crumb-move="${focusPly()}">${esc(label(focusPly()))}</button>`:`<span aria-current="page">${esc(label(focusPly()))}</span>`);
 }
 if(state.practice)items.push('<span aria-current="page">Práctica</span>');
 else if(state.line)items.push(`<span aria-current="page">Variante: ${esc(state.line.name)}</span>`);
 else if(state.secondary)items.push(`<span aria-current="page">Tu consulta</span>`);
 const t=progressTotals;
 nav.innerHTML=`<button type="button" class="back-button" data-go-back ${backStack.length?'':'disabled'} title="Volver a la vista anterior (Alt + ←)">← Atrás</button><ol>${items.map(i=>`<li>${i}</li>`).join('')}</ol>${t?`<span class="crumb-progress">Revisados <b>${t.done}/${t.total}</b><span class="mini-bar" aria-hidden="true"><span style="width:${t.total?t.done/t.total*100:100}%"></span></span></span>`:''}`;
}

/* ---------- Modo especial visible en el tablero ---------- */
function renderMode(){
 const panel=document.querySelector('.board-panel'),bar=$('mode-bar'),title=$('board-title');if(!panel||!bar)return;
 const mode=state.practice?'practice':state.line?'line':'';
 panel.classList.toggle('mode-practice',mode==='practice');panel.classList.toggle('mode-line',mode==='line');
 bar.hidden=!mode;title.hidden=!!mode;
 if(mode)bar.innerHTML=`<span class="mode-pill">${mode==='practice'?'Modo práctica':`Modo variante · ${state.line.offset}/${state.line.moves.length}`}</span><button type="button" class="mode-exit" data-exit-mode>${mode==='practice'?'Salir de la práctica':'Salir de la variante'} <kbd>Esc</kbd></button>`;
}
function exitMode(){
 if(busy)return false;
 if(state.practice&&returnLearn){state=returnLearn.state;returnLine=returnLearn.lineReturn;returnLearn=null;selected='';render();return true;}
 if(state.line){restoreLine();return true;}
 return false;
}
function boardWarning(text){const hint=$('board-mode-hint');hint.hidden=false;hint.classList.add('warn');hint.textContent='⚠ '+text;}

/* ---------- Formato de texto: jugadas destacadas y resumen ampliable ---------- */
const SAN_PATTERN=/(^|[\s(«"'→,;])((?:\d+\.(?:\.\.|…)?\s?)?(?:…|\.\.\.)?(?:O-O(?:-O)?|[RDTAC][a-h1-8]?x?[a-h][1-8]|[a-h]x[a-h][1-8]|[a-h][1-8])(?:=[DTAC])?[+#]?)(?=$|[\s.,;:)»"'!?→])/g;
function fmt(text){return esc(text).replace(SAN_PATTERN,'$1<strong class="san">$2</strong>');}
function brief(text){
 const m=String(text).match(/^(.+?[.!?])\s+(\S.*)$/s);
 if(!m||m[1].length<40)return fmt(text);
 return `${fmt(m[1])} <details class="more"><summary>Ver más</summary>${fmt(m[2])}</details>`;
}
function severityBadge(row,link=false){
 const sev=severityOf(row);
 if(!row)return '';
 const sym=sev?SEVERITY.find(s=>s.id===sev).symbol:'✓';
 const classes=`sev-badge sev-${sev||'ok'}`;
 const content=`<span aria-hidden="true">${sym}</span> ${esc(teachingType(row))}`;
 if(link&&sev)return `<button type="button" class="${classes} board-error-link" data-error-ply="${row.ply}" aria-label="Ver ${esc(row.kind)} de ${esc(row.label)} en Evaluar">${content}</button>`;
 return `<span class="${classes}">${content}</span>`;
}

/* ---------- Ajustes de visualización: contraste alto y simulación de color ---------- */
const VISION_FILTERS={
 protanopia:'0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0',
 deuteranopia:'0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0',
 tritanopia:'0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0'
};
function applyVision(kind){
 const root=document.documentElement;
 root.style.filter=kind==='grayscale'?'grayscale(1)':VISION_FILTERS[kind]?`url(#vision-${kind})`:'';
}
function initDisplaySettings(){
 readStore('reviewed',[]).forEach(ply=>reviewed.add(ply));
 const svg=`<svg width="0" height="0" style="position:absolute" aria-hidden="true">${Object.entries(VISION_FILTERS).map(([k,m])=>`<filter id="vision-${k}"><feColorMatrix type="matrix" values="${m}"/></filter>`).join('')}</svg>`;
 document.body.insertAdjacentHTML('beforeend',svg);
 const hc=$('high-contrast'),vision=$('vision-sim');
 let pref=false;try{pref=localStorage.getItem('iajedrez:contrast')==='1';}catch{}
 hc.checked=pref;document.documentElement.classList.toggle('hc',pref);
 hc.onchange=()=>{document.documentElement.classList.toggle('hc',hc.checked);try{localStorage.setItem('iajedrez:contrast',hc.checked?'1':'0');}catch{}};
 const param=new URLSearchParams(location.search).get('vision');
 if(param&&[...vision.options].some(o=>o.value===param))vision.value=param;
 applyVision(vision.value);vision.onchange=()=>applyVision(vision.value);
}

/* ---------- Reinicio con confirmación específica (solo si se pierde progreso) ---------- */
function resetSummary(){
 const done=errorRows().filter(r=>reviewed.has(r.ply)).length,pending=errorRows().length-done;
 return {done,pending,queries:threads.length};
}
function requestReset(){
 const {done,pending,queries}=resetSummary();
 if(!done&&!queries){performReset();return;}
 const box=$('reset-confirm');
 box.innerHTML=`<strong>¿Reiniciar la revisión?</strong><p>Se ${done+queries===1?'borrará':'borrarán'} ${done?`${done} ${done===1?'jugada revisada':'jugadas revisadas'}`:''}${done&&queries?' y ':''}${queries?`${queries} ${queries===1?'consulta':'consultas'}`:''}. ${pending?`Aún te ${pending===1?'queda 1 error pendiente':`quedan ${pending} errores pendientes`}.`:'Ya revisaste todos los errores.'}</p><div class="confirm-actions"><button type="button" class="danger-action" data-confirm-reset>Borrar mi progreso</button><button type="button" class="small-button" data-cancel-reset>Seguir revisando</button></div>`;
 box.showPopover();
 const r=$('reset').getBoundingClientRect();
 box.style.top=(r.bottom+8)+'px';box.style.left=Math.max(8,r.right-box.offsetWidth)+'px';
 box.querySelector('[data-cancel-reset]').focus();
}
function performReset(){
 reviewed.clear();writeStore('reviewed',[]);backStack.length=0;chainSeen={};
 threads=[];nextThread=1;$('question').value='';notice('');jump(0,'evaluate',false,'all');document.querySelector('.tree-scroll').scrollTop=0;
}

/* ---------- Atajos de teclado ---------- */
function initShortcuts(){
 document.addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey)return;
  const typing=e.target.closest('input,textarea,select,[contenteditable]');
  if(e.key==='Escape'){if(!typing&&exitMode())e.preventDefault();return;}
  if(typing||!game)return;
  if(e.altKey){if(e.key==='ArrowLeft'){e.preventDefault();goBack();}return;}
  const click=id=>{const el=$(id);if(el&&!el.disabled){e.preventDefault();el.click();}};
  if(e.key==='ArrowLeft')click('prev');
  else if(e.key==='ArrowRight')click('next');
  else if(e.key==='Home')click('first');
  else if(e.key==='End')click('last');
  else if(/^[1-3]$/.test(e.key)){e.preventDefault();document.querySelectorAll('[data-view]')[Number(e.key)-1]?.click();}
  else if(e.key==='n'||e.key==='N'){const b=document.querySelector('[data-next-pending]');if(b){e.preventDefault();b.click();}}
  else if(e.key==='/'){e.preventDefault();$('question').focus();}
  else if(e.key==='?'){e.preventDefault();const p=$('shortcuts');p.matches(':popover-open')?p.hidePopover():p.showPopover();}
 });
}
