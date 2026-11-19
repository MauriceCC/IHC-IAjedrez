# Cap. 5 — Nuestra visión periférica es pobre

**Idea clave:** solo vemos con nitidez en la **fóvea** (~1 % del campo visual, 1–2 cm de pantalla). La periferia es casi ciega para el detalle, pero **detecta movimiento** y guía la mirada.

## Reglas de diseño

1. **Pon la información nueva, importante o cambiada donde el usuario está mirando:** junto al botón que acaba de pulsar o al campo que la provoca.
2. **Haz que lo importante "resalte" (pop) en la periferia.** Resaltan: **color, negrita/peso de fuente, movimiento, forma distintiva**. La forma de las letras **no** resalta.
3. **Métodos estándar para mensajes de error:**
   - Colócalo cerca de donde mira el usuario y del elemento al que se refiere.
   - Marca el campo con error.
   - Añade un **ícono de error**.
   - **Reserva el rojo para errores** (si la marca usa rojo, usa otro color + ícono).
4. **"Artillería pesada" solo para lo crítico:**
   - **Diálogo modal:** de aplicación solo si se puede perder información; de sistema solo ante fallo grave o riesgo de vida.
   - **Sonido:** solo en contextos controlados (molesta en espacios compartidos; se pierde en ruido).
   - **Vibrar/parpadear:** breve, **0.25–0.5 s**, nunca continuo.
   - El abuso causa **habituación**: el usuario deja de reaccionar.
5. **Íconos distinguibles en la periferia:** color y silueta general distintos; sin exceso de detalle.
6. **Nunca muevas elementos en menús, listas o paletas** (nada de "menús dinámicos"): el usuario aprende posiciones y deja de buscar linealmente.

## Evitar

- Mensajes de error en barras lejanas o en letra pequeña.
- Otros elementos rojos cerca del mensaje de error (la periferia no notará el cambio).
- Pop-ups para errores menores de formulario.
