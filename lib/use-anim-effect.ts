"use client";

import { useEffect, type EffectCallback } from "react";

/**
 * Monta las animaciones de una sección DESPUÉS del primer pintado.
 *
 * Por qué existe. El montaje de GSAP es caro: medir las líneas con SplitText y
 * calcular las posiciones de ~30 ScrollTrigger costaba 1,7 s de «Style &
 * Layout» en móvil, y al hacerse dentro de useLayoutEffect ocurría ANTES del
 * primer pintado, así que el navegador no podía pintar la fotografía del hero
 * hasta terminarlo: 2,5 s de render delay sobre el LCP.
 *
 * Por qué es seguro aquí y no en el hero. El hero mide 100svh, de modo que
 * TODAS las secciones que usan este hook están bajo el pliegue en el primer
 * pintado: aplicarles su estado inicial oculto un fotograma más tarde no puede
 * verse. El hero sigue con `useIsomorphicLayoutEffect` (pre-pintado), porque
 * su animación de entrada sí arranca a la vista y ahí un fotograma de retraso
 * sería un parpadeo.
 *
 * Degradación. Si el requestAnimationFrame no llega a ejecutarse (pestaña en
 * segundo plano, navegador sin rAF), el efecto simplemente no monta: como el
 * CSS base nunca oculta nada, la sección queda visible en su estado final. Es
 * la misma regla de «fallar mostrando» del resto del sitio, un paso más
 * conservadora que antes.
 *
 * Aísla los errores igual que `useIsomorphicLayoutEffect`: una excepción al
 * montar deja la sección sin animar, pero visible, en vez de tumbar el árbol
 * de React y dejar la página en blanco.
 */
export const useAnimEffect = (
  effect: EffectCallback,
  deps?: React.DependencyList
) =>
  useEffect(() => {
    let limpiar: ReturnType<EffectCallback>;
    let raf = 0;
    let cancelado = false;

    raf = requestAnimationFrame(() => {
      raf = 0;
      if (cancelado) return;
      try {
        limpiar = effect();
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.error(e);
      }
    });

    return () => {
      cancelado = true;
      if (raf) cancelAnimationFrame(raf);
      try {
        limpiar?.();
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.error(e);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
