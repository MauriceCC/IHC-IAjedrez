'use strict';
// Teaching labels built from saved evidence, not official platform classifications.
function teachingType(row){
 if(row.loss_cp===null||row.loss_cp>=50)return row.kind;
 if(row.best.pv[0]===row.move)return 'Mejor jugada';
 return row.loss_cp<=10?'Excelente':'Buena';
}
function moveReason(row){
 const specific={
  entrevista:{31:'Abre la posibilidad de …Txc3 y después …dxe4, con ataque simultáneo al alfil de d3 y al caballo de f3.',41:'La maniobra Te4–e2–c2–c6 busca actividad en la columna abierta. El tiempo consumido se evalúa aparte.',57:'Permite …Dh1+ por la diagonal b7–h1. La línea calculada incluye la captura de h3.',89:'El caballo se retira a c7, casilla controlada por el caballo negro de d5: …Cxc7 pierde la pieza.'},
  gemini:{23:'El caballo captura d5 y el peón e6 puede responder …exd5. Comprueba la pérdida de material.',49:'El enroque permite la táctica …Axf3 contra el caballo y la dama. Las negras jugaron otra respuesta en la partida.',51:'Cxg5 captura la dama, pero …Axd1 captura también la tuya: hay que contar toda la secuencia.'},
  mauricio:{17:'Permite …Dxg3+; el rey debe ir a e2 y pierde el derecho a enrocar.',37:'La torre ataca la dama, pero el rival conserva recursos tácticos. Compara la respuesta calculada con …Td2+, que ocurrió.'}
 };
 if(specific[studyId]?.[row.ply])return specific[studyId][row.ply];
 const reply=row.played.san[1],follow=row.played.san.slice(1,4).map(es).join(' → ');
 if(row.played.mate_white!==null)return `La variante calculada contiene ${score(row.played).toLowerCase()}. Recorre los jaques antes de valorar solo el material.`;
 if(row.loss_cp<50)return `Mantiene una valoración cercana a la candidata del motor.${reply?' La continuación calculada empieza '+follow+'.':''}`;
 if(reply?.includes('x'))return `El rival puede responder ${es(reply)}, una captura${reply.includes('+')?' con jaque':''}. La secuencia ${follow} explica la pérdida de valoración frente a la alternativa.`;
 if(reply?.includes('+'))return `El rival obtiene un jaque con ${es(reply)}. Compara la continuación ${follow} con la defensa de la línea sugerida.`;
 return `Tras esta decisión, el motor encuentra ${follow||'una continuación más favorable al rival'}. La valoración empeora frente a la candidata; recorre ambas líneas para comparar la actividad y el material.`;
}
function suggestionReason(row){
 const reply=row.best.san[1];
 return row.best.pv[0]===row.move?'Coincide con tu jugada.':reply?`Respuesta calculada: ${es(reply)}.`:'';
}
function typeCell(row){
 const kind=teachingType(row);
 return `${moveTypeIcon({...row,kind})}<small class="type-name">${esc(kind)}</small>${row.loss_cp>0?`<small class="loss-value" title="Ventaja perdida frente a la candidata del motor">−${(row.loss_cp/100).toFixed(2)} peones</small>`:''}`;
}
function reviewTag(row){
 if(!severityOf(row))return '';
 return reviewed.has(row.ply)?'<span class="review-tag done">✓ Revisada</span>':'<span class="review-tag">Pendiente</span>';
}
function evaluationTable(){
 const all=report.rows,errors=errorRows(),filter=state.filter;
 const rows=filter==='errors'?errors:filter==='good'?all.filter(row=>!severityOf(row)):all;
 const filters=`<div class="filter-chips" role="group" aria-label="Filtrar jugadas">${[['all','Todas',all.length],['errors','Con error',errors.length],['good','Sin caída importante',all.length-errors.length]].map(([id,name,n])=>`<button type="button" class="filter-chip ${filter===id?'chosen':''}" data-filter="${id}" aria-pressed="${filter===id}">${name} <b>${n}</b></button>`).join('')}</div>`;
 let block=-1;
 const body=rows.map(row=>{
  const reason=moveReason(row),suggestion=suggestionReason(row);
  const moveNo=Math.ceil(row.ply/2),group=Math.floor((moveNo-1)/10);
  const header=filter!=='errors'&&group!==block?`<tr class="group-row"><th colspan="4">Jugadas ${group*10+1}–${group*10+10}</th></tr>`:'';block=group;
  const selected=focusPly()===row.ply;
  const real=`<button class="cell-move" type="button" data-jump="${row.ply}" ${selected?'aria-current="true"':''} title="Revisar ${esc(row.label)} paso a paso">${esc(row.label)}<small class="eval-score">${esc(score(row.played))}</small></button>${reviewTag(row)}`;
  const seeBoard=`<button type="button" class="see-board" data-preview="${row.ply}" aria-label="Ver la sugerencia para ${esc(row.label)} en el tablero">▶ Ver en el tablero</button>`;
  const recommended=`<b class="san">${esc(es(row.best.san[0]))}</b> <small class="eval-score">${esc(score(row.best))}</small>`;
  const explanation=`<div class="cell-text desktop-explanation">${brief(reason)}</div><details class="mobile-explanation"><summary>Ver explicación<span class="sr-only"> de ${esc(row.label)}</span></summary><div class="cell-text">${fmt(reason)}${suggestion?`<p>${fmt(suggestion)}</p>`:''}</div></details>`;
  const advice=`<div class="cell-text">${recommended}${suggestion?`<div class="suggestion-response">${fmt(suggestion)}</div>`:''}${seeBoard}</div>`;
  return `${header}<tr class="${selected?'highlight-row':''}"><td>${real}</td><td>${typeCell(row)}</td><td>${advice}</td><td>${explanation}</td></tr>`;
 }).join('');
 return `${filters}${filter==='errors'?'<p class="evaluation-order">De mayor a menor pérdida de ventaja</p>':''}<div class="table-wrap" tabindex="0" role="region" aria-label="Tabla desplazable de evaluación"><table class="results-table evaluation-table" aria-label="Evaluar jugadas de blancas"><thead><tr><th scope="col">Jugada</th><th scope="col">Tipo ${typeLegend()}</th><th scope="col">Consejo</th><th scope="col">Explicación</th></tr></thead><tbody>${body||'<tr><td colspan="4">No hay jugadas en este filtro.</td></tr>'}</tbody></table></div>`;
}
function showErrorInEvaluation(ply){
 jump(ply,'evaluate',true,'errors');
 showMobilePanel('right-panel');
 const move=$('results').querySelector(`[data-jump="${ply}"]`);
 move?.focus({preventScroll:true});
 if(move){
  const results=$('results');
  const viewport=results.getBoundingClientRect();
  const row=move.closest('tr').getBoundingClientRect();
  if(row.top<viewport.top||row.bottom>viewport.bottom)results.scrollTop+=row.top-viewport.top-results.clientTop;
 }
}
async function previewSuggestion(ply){
 const row=report.rows.find(r=>r.ply===ply);if(!row)return;
 const scroll=$('results').scrollTop;
 if(state.line)restoreLine();
 state.cursor=ply;
 await openLine({base:ply-1,moves:row.best.pv,name:'Sugerencia para '+row.label,illustrated:true});
 $('results').scrollTop=scroll;
 revealSelection();
}
function boardArrows(){
 const l=state.line;if(!l?.illustrated)return '';
 // Each arrow is a move in the calculated line; it is not a complete attack map.
 const previous=l.offset>0?l.moves[l.offset-1]:null,next=l.moves[l.offset];
 const point=s=>[('abcdefgh'.indexOf(s[0])+.5)*100,(8-Number(s[1])+.5)*100];
 const arrow=(uci,color,id,dashed)=>{
  if(!uci)return '';const [x1,y1]=point(uci.slice(0,2)),[x2,y2]=point(uci.slice(2,4));
  // Knight paths are bent to make their movement legible.
  const knight=Math.abs(x2-x1)*Math.abs(y2-y1)===20000;
  const path=knight?`M${x1},${y1} L${x1},${y2} L${x2},${y2}`:`M${x1},${y1} L${x2},${y2}`;
  return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10Z" fill="${color}"/></marker></defs><path d="${path}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" opacity=".85" ${dashed?'stroke-dasharray="18 12"':''} marker-end="url(#${id})"/>`;
 };
 return `<svg class="board-arrows" viewBox="0 0 800 800" aria-hidden="true">${arrow(previous,'#185bd5','played-arrow',false)}${arrow(next,'#ce6324','reply-arrow',true)}</svg>`;
}
