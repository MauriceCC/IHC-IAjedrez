# Mejoras de interfaz según el checklist IHC

Fecha: 19 nov. 2026. Base: `docs/IHC-Checklist.pdf` (columna ANTES) y los resúmenes de `docs/sumup/`.
Esta tabla sirve para completar la columna **DESPUÉS**. Se listan las reglas que **no se cumplían** (☐) y las **resaltadas en amarillo** (✓ mejorable). Las reglas que ya se cumplían se conservaron sin cambios de distribución.

Archivos principales: `IAjedrez_prototipo_interactivo.html` (estructura y estilos, bloque «Mejoras IHC»), `static/ihc-ui.js` (nuevo), `static/review.js`, `static/evaluation-ui.js`, `static/study-ui.js`, `static/home.*`.

## Nuevo submenú de progreso (propuesta del equipo)

Debajo de las pestañas aparece siempre: **`?? Graves 1/4 · ? Errores 0/6 · ?! Imprecisiones 2/7`** y el botón principal **«Revisar 16. e4 →»** (siguiente error pendiente, de mayor a menor pérdida).

- Una jugada con error cuenta como revisada al abrirla en Cadena, en una consulta o en la práctica. En Cadena puede marcarse de nuevo como pendiente.
- Cada contador lleva al siguiente pendiente de su tipo. Un contador completo se vuelve verde con ✓.
- Las jugadas revisadas muestran ✓ en el árbol y la etiqueta «✓ Revisada» / «Pendiente» en las tablas.
- El progreso se guarda por partida en el navegador. El inicio muestra «Revisados 3/17 · 14 pendientes» y el botón cambia a «Continuar la revisión».

Reglas que cubre: 7 (acciones realizadas/pendientes, no recordar pantallas anteriores), 8 (tareas completadas vs. pendientes, progreso, recordatorio de pendientes, avanzar sin explorar), 1 (información visible cuando se necesita).

## 1. Nuestra percepción es sesgada

| Regla | Antes | Cambio |
| --- | --- | --- |
| Íconos comprensibles, no ambiguos | ☐ | Se quitaron los íconos sin texto (⑂, ◌, ⌁, ✦, descarga solo con ícono). Ahora: «Descargar», «2 consultas», «← Historial de partidas», estado «● Stockfish 19 · análisis guardado» (ya no parece botón). |
| Información necesaria visible | ☐ | Submenú de progreso; leyenda de tipos fija bajo cada tabla y en el árbol; ficha de contexto con tipo, pérdida y jugada sugerida; equivalencias de notación R/D/T/A/C ↔ K/Q/R/B/N. |
| Elementos importantes relacionados con la tarea | ☐ | La jugada actual muestra su tipo («?? Error grave · −8,76») en el tablero, el árbol, la tabla y la barra de contexto. |
| Identificar qué hace cada botón | ☐ | Pestañas con nombre + destino («Cadena / paso a paso»). Celdas de tabla ya no son botones invisibles: «▶ Ver en el tablero» explícito y una línea de ayuda. «Reiniciar» → «Reiniciar revisión», con tooltip. |

## 2. Gestalt

| Regla | Antes | Cambio |
| --- | --- | --- |
| Íconos parcialmente visibles reconocibles | ☐ | Íconos de tipo con forma propia (octágono = grave, círculo = error, cuadrado = imprecisión) además del símbolo; se reconocen aunque se recorten o se vean pequeños. |
| Cuadros emergentes mantienen el contexto | ☐ | Leyenda, atajos, ajustes y confirmación de reinicio son *popovers* no modales, sin fondo que tape la pantalla. |
| Sin bordes/cajas innecesarios | ☐ | Se retiraron los separadores verticales de tablas, la caja de «Contexto», el degradado de la cabecera de Aprende, las cajas de cada tema de Aprende y el aviso duplicado de variante en el panel derecho. |

## 3. Estructura visual

| Regla | Antes | Cambio |
| --- | --- | --- |
| Títulos principales destacan más | ☐ | Escala: panel 16 px > vista 17 px/780 > bloque 14,5 px > texto 13 px. Encabezados de Aprende pasan a `h4`. |
| Textos sin repeticiones | ☐ | La nota de método se movió a un desplegable «Cómo se calculó este análisis». Se acortó el pie del compositor. |
| Datos extensos en bloques | ☐ | Evaluación agrupada en bloques «Jugadas 1–10», «11–20», etc., con filtros «Todas / Con error / Sin caída importante». |
| Enlaces descriptivos | ☐ | «Practicar ataques dobles en Lichess ↗» (con aviso accesible de pestaña nueva), «← Historial de partidas». |

## 4. Color

| Regla | Antes | Cambio |
| --- | --- | --- |
| Importante vs. secundario (amarillo) | ✓ | Una acción sólida por pantalla («Revisar …», «Siguiente paso …»). «Enviar consulta» solo se rellena cuando hay texto. El resto de botones va con contorno. |
| Diferencias en escala de grises | ☐ | Gravedad con luminancia oscura / media / clara (#8f1d2a, #f0892c, #f8e07c) + símbolo + forma. Casilla de origen con borde discontinuo y destino con borde continuo. |
| Evitar combinaciones problemáticas (amarillo) | ✓ | Texto oscuro sobre naranja/amarillo; rojo y verde ya no dependen del tono, solo se usan junto con símbolo y forma. |
| Enlaces visitados distinguibles | ☐ | Enlaces visitados en violeta (`#6b3fa0`). |
| Comprobado con simulador de daltonismo | ☐ | Menú **◐ Visualización → Simular visión del color** (protanopía, deuteranopía, tritanopía, grises). También `/?game=entrevista&vision=deuteranopia`. Se revisaron capturas con deuteranopía y escala de grises. |
| Distintas condiciones de iluminación | ☐ | **Contraste alto** (se recuerda entre sesiones): textos y bordes más oscuros, tablero con más contraste. |

## 5. Visión periférica

| Regla | Antes | Cambio |
| --- | --- | --- |
| Errores con íconos reconocibles | ☐ | Avisos de error con «⚠». En práctica, una casilla inválida muestra el aviso **junto al tablero**, no en el compositor. |
| Elementos de listas no cambian de posición | ☐ | Pestañas, progreso, ruta y modo ocupan lugares fijos; los avisos no desplazan el tablero. |
| Errores menores sin ventanas emergentes (amarillo) | ✓ | Sin `alert` ni modales: avisos en línea que permanecen hasta la siguiente acción. |

## 6. Leer no es natural

| Regla | Antes | Cambio |
| --- | --- | --- |
| Tamaño de letra cómodo | ☐ | Mínimos de 12–14 px en escritorio (árbol 14, tablas 13, notas 12). Grises de texto con contraste ≥ 4,5:1 (`--muted:#56657a`). |
| Resumen + ampliar | ☐ | Explicaciones largas: primera oración visible y «Ver más». |
| Conceptos destacados | ☐ | Las jugadas dentro del texto se destacan en negrita (`…Txc3`, `Cg7+`). La pérdida se muestra en negrita junto al tipo. |
| Instrucciones comprensibles sin ayuda | ☐ | Ayudas breves en contexto («Pulsa una jugada para revisarla paso a paso…», «1. Pulsa una pieza blanca. 2. Pulsa un destino marcado.»), atajos opcionales y nota en el inicio sobre la importación no disponible. |

## 7. Atención y memoria

| Regla | Antes | Cambio |
| --- | --- | --- |
| Identificar acciones realizadas (amarillo) / pendientes | ✓ | Submenú de progreso, ✓ en árbol y tablas, pasos de Cadena completados con ✓. |
| No recordar pantallas anteriores | ☐ | Barra de contexto con tipo, pérdida y sugerida en todas las vistas; ruta de navegación. |
| Acción principal por pantalla | ☐ | Resumen: «Revisar …». Cadena: «Siguiente paso: … →». Al final: «Revisar el siguiente error …». |
| Secundarias no compiten | ☐ | Botones secundarios con contorno; tarjetas de preguntas con menos peso visual. |
| Modos especiales identificados (amarillo) | ✓ | El tablero muestra «Modo variante · 3/10» o «Modo práctica», con borde de color y «Salir de … Esc». |
| Navegación sin profundidad innecesaria | ☐ | Ruta «Cadena › 45. Cc7 › Variante» con niveles pulsables y «← Atrás» (Alt+←). |
| Ayudas para recordar datos/procedimientos | ☐ | Leyenda de tipos fija, equivalencias de notación, panel de atajos y progreso persistente. |
| Mensajes de voz | ☐ | No aplica: la interfaz no tiene voz. |

## 8. Atención, pensamiento y acción

| Regla | Antes | Cambio |
| --- | --- | --- |
| Verbos concretos | ☐ | «Enviar consulta», «Mostrar candidata del motor», «Probar otra jugada», «Ver respuesta del rival», «Salir de la práctica», «Practicar una alternativa», «Escribir mi pregunta». |
| Avanzar sin opciones innecesarias (amarillo) | ✓ | Embudo guiado: botón de siguiente pendiente y de siguiente paso. |
| Completadas vs. pendientes (amarillo) | ✓ | Etiquetas «✓ Revisada» / «Pendiente» y contadores completos en verde. |
| Procesos de varios pasos muestran progreso | ☐ | Cadena: «Paso 2 de 4» + barra. Revisión global: «Revisados 5/17» + barra. |
| Retroceder para corregir | ☐ | «← Atrás» con historial de vistas, migas pulsables y «Marcar como pendiente». |
| Atajos para expertos | ☐ | ←/→, Inicio/Fin, 1–4, N, Alt+←, Esc, /, ? (panel «⌨ Atajos»). |
| Recordar pendientes antes de finalizar | ☐ | «Reiniciar revisión» indica cuántos errores siguen pendientes y qué se borraría. Opciones específicas: «Borrar mi progreso» / «Seguir revisando». Si no hay nada que perder, no pide confirmación. |
| Modos regresan al estado normal | ☐ | Esc o «Salir de …» devuelve al análisis; al cambiar de pestaña también se sale del modo. |

## 9. Reconocer es fácil

| Regla | Antes | Cambio |
| --- | --- | --- |
| Opciones visibles al elegir (amarillo) | ✓ | Pestañas con su destino, filtros visibles, sugerencia de consulta junto al campo («¿Qué ocurrió en 45. Cc7?»). |
| Miniaturas de imágenes ya vistas | ☐ | El historial del inicio muestra una miniatura del tablero en el error principal de cada partida y su progreso. |

## Verificación realizada

- `pytest`: 22 pruebas pasan; 8 se omiten porque requieren Stockfish en vivo.
- `tests/ui_evaluation.py` pasa con Edge en las tres partidas, incluida la vista móvil. Se ajustaron sus selectores a las filas de bloque y al nuevo botón de salida.
- Recorrido scriptado sin errores de JavaScript: progreso, Cadena por pasos, modo variante + Esc, práctica con aviso junto al tablero, Atrás, filtros, atajos, confirmación de reinicio, persistencia tras recargar, inicio con miniaturas, 1440×900, 1366×768, 900×900 y 390×844, escala de grises y deuteranopía.
- `tests/ui_interview.py` ya estaba desactualizado antes de estos cambios: espera 5 pestañas y una vista «resources». Además necesita el motor. Solo se actualizaron el título y el botón de salida.
