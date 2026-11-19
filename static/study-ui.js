'use strict';
function typeLegend(){return `<span class="type-help-wrap"><button type="button" class="type-help" aria-label="Ayuda sobre los tipos de jugada" aria-describedby="type-legend" aria-expanded="false">?</button><span id="type-legend" class="type-legend" role="tooltip" popover="manual"><strong>Tipos de jugada</strong><span><b class="legend-grave">??</b> Error grave: pérdida de 2 o más peones de valoración.</span><span><b class="legend-error">?</b> Error: pérdida entre 1 y menos de 2.</span><span><b class="legend-inaccuracy">?!</b> Imprecisión: pérdida entre 0,5 y menos de 1.</span><span><b class="legend-good">✓</b> Buena: pérdida menor de 0,5.</span><span><b class="legend-good">!</b> Excelente: pérdida de hasta 0,1 sin coincidir con la primera candidata.</span><span><b class="legend-good">★</b> Mejor jugada: coincide con la primera candidata de esta búsqueda.</span><span><b>!!</b> Brillante: sacrificio sólido que requiere validación específica. No se deduce solo de una puntuación alta; no hay jugadas certificadas con esta etiqueta en estos informes.</span><span><b>#</b> Permite o pierde un mate forzado: se indica aparte.</span><small>Clasificación didáctica local, no oficial de Chess.com o Lichess. −N peones indica la ventaja perdida frente a la candidata; no una captura material. Barra con tope visual de 5 peones.</small></span></span>`;}

let legendTimer;
function closeTypeLegend(){
 clearTimeout(legendTimer);
 document.querySelector('.type-legend:popover-open')?.hidePopover();
 document.querySelector('.type-help')?.setAttribute('aria-expanded','false');
}
function openTypeLegend(button){
 clearTimeout(legendTimer);
 const tip=document.getElementById('type-legend');if(!tip)return;
 if(!tip.matches(':popover-open'))tip.showPopover();
 button.setAttribute('aria-expanded','true');
 const rect=button.getBoundingClientRect();
 const below=innerHeight-rect.bottom-16,above=rect.top-16;
 tip.style.maxHeight=Math.max(80,Math.max(below,above))+'px';
 const box=tip.getBoundingClientRect();
 tip.style.left=Math.max(8,Math.min(rect.left,innerWidth-box.width-8))+'px';
 tip.style.top=(below>=box.height?rect.bottom+8:Math.max(8,rect.top-box.height-8))+'px';
}
document.addEventListener('pointerover',event=>{
 const button=event.target.closest('.type-help');
 if(button)openTypeLegend(button);
 if(event.target.closest('.type-legend'))clearTimeout(legendTimer);
});
document.addEventListener('pointerout',event=>{
 if(event.target.closest('.type-help,.type-legend')&&!event.relatedTarget?.closest?.('.type-help,.type-legend'))legendTimer=setTimeout(closeTypeLegend,150);
});
document.addEventListener('focusin',event=>{if(event.target.matches('.type-help'))openTypeLegend(event.target);});
document.addEventListener('focusout',event=>{if(event.target.matches('.type-help'))closeTypeLegend();});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeTypeLegend();});
document.addEventListener('click',event=>{
 const button=event.target.closest('.type-help');
 if(button){event.preventDefault();event.stopPropagation();openTypeLegend(button);}
 else if(!event.target.closest('.type-legend'))closeTypeLegend();
},true);
window.addEventListener('resize',closeTypeLegend);
function moveTypeIcon(row){
 // Forma, símbolo y luminancia distintos: se distinguen sin color y en escala de grises.
 const types={
  'Error grave':['??','#8f1d2a','octagon'],
  'Error':['?','#f0892c','circle','#1d1000'],
  'Imprecisión':['?!','#f8e07c','square','#4a3800'],
  'Permite mate':['#','#6a2d80','octagon'],
  'Pierde mate forzado':['#','#6a2d80','octagon'],
  'Línea de mate':['#','#6a2d80','circle'],
  'Sin caída importante':['✓','#287b65','circle'],
  'Buena':['✓','#287b65','circle'],'Excelente':['!','#287b65','circle'],'Mejor jugada':['★','#1f6a56','circle'],'Brillante':['!!','#168e9c','circle']
 };
 const [symbol,color,shape,ink='#fff']=types[row.kind]||['•','#63758b','circle'];
 const outline=shape==='octagon'?'<polygon points="11,1 25,1 35,11 35,25 25,35 11,35 1,25 1,11" fill="'+color+'"/>':shape==='square'?'<rect x="2" y="2" width="32" height="32" rx="7" fill="'+color+'" stroke="#8a6d00" stroke-width="1.5"/>':'<circle cx="18" cy="18" r="17" fill="'+color+'"/>';
 return `<span tabindex="0" class="move-icon" role="img" title="${esc(row.kind)}" aria-label="${esc(row.kind)}"><svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true" focusable="false">${outline}<text x="18" y="24" text-anchor="middle" fill="${ink}" font-family="Arial, sans-serif" font-weight="800" font-size="${symbol.length>1?17:22}">${symbol}</text></svg></span>`;
}
function priorityTable(){return evaluationTable(true);}
function studyLearning(){
 if(!report)return summary();
 const topics=isGemini?GeminiUI.topics:isInterview?[
  ['Defensa Semieslava · D31',5,'La apertura indicada en tu PGN: 1.d4 c6 2.c4 d5 3.Cc3 e6. Explora cómo se construye el centro antes de la ruptura e4.','https://lichess.org/opening/Semi-Slav_Defense','Explorar la apertura y partidas modelo'],
  ['Ataque doble con peón',31,'Tras 16.e4, revisa la variante de Stockfish: si continúa …Txc3 Dxc3 dxe4, el peón ataca al alfil de d3 y al caballo de f3. Es una posibilidad calculada, no la continuación jugada.','https://lichess.org/training/fork','Practicar ataques dobles'],
  ['Seguridad del caballo',89,'En la partida, 45.Cc7 permitió …Cxc7. Compara Cg7+ y Cc5 con el motor antes de elegir una retirada.','https://lichess.org/training/hangingPiece','Practicar piezas sin defensa']
 ]:[
  ['Apertura de peón de rey',3,'Tu partida comienza 1.e4 e5 2.d3. Estudia desarrollo y control central antes del avance f4; esta referencia corresponde a la familia general de la apertura.','https://lichess.org/opening/Kings_Pawn_Game','Explorar la apertura y partidas modelo'],
  ['Seguridad del rey',17,'Después de 9.Cd2 llegó …Dxg3+ y 10.Re2 fue la única respuesta legal. Revisa cómo los jaques impidieron enrocar y compara las alternativas del motor. En el recurso externo, empieza por patrones de mate y jaques dobles.','https://lichess.org/practice','Estudiar patrones de mate y táctica']
 ];
 return contextBar()+(isGemini?GeminiUI.cards():'')+`<div class="view-intro"><h3>Aprende de tu partida</h3><span class="hint">${topics.length} temas vinculados a tus jugadas</span></div><p class="table-help">Cada tema enlaza una posición de tu partida: «Ver en mi partida» la muestra en el tablero y «Practicar desde aquí» te deja probar otra jugada.</p>`+topics.map(([title,ply,text,url,link])=>{const row=report.rows.find(r=>r.ply===ply);return `<article class="topic-card"><h4>${esc(title)} <span class="topic-move">${esc(label(ply))}</span></h4><p>${brief(text)}</p><p class="topic-meta">Candidata calculada: <strong class="san">${esc(es(row.best.san[0]))}</strong> · ${esc(score(row.best))}</p><div class="lesson-actions">${button('Ver en mi partida',`data-topic-position="${ply}"`)}${button('Practicar desde aquí',`data-topic-practice="${ply}"`)}<a class="ext-link" href="${url}" target="_blank" rel="noopener">${esc(link)} en Lichess<span class="sr-only"> (abre una pestaña nueva)</span> ↗</a></div></article>`;}).join('');
}
