import { useEffect, useLayoutEffect, type EffectCallback } from "react";

const useIsomorphic =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * useLayoutEffect en cliente (se ejecuta antes del pintado → sin parpadeo)
 * y useEffect en servidor (evita el warning de SSR de React).
 *
 * Además AÍSLA el montaje de las animaciones: si el bloque lanza —por ejemplo
 * al hidratar sobre un documento incompleto, cuando GSAP no encuentra sus
 * objetivos y ScrollTrigger revienta—, el error se registra pero NO sube a
 * React. Sin esta red, una excepción en un efecto de maquetación desmonta el
 * árbol entero y la página se queda EN BLANCO. Con ella, la sección se queda
 * simplemente sin animar y su contenido sigue visible, que es la misma regla
 * de «fallar mostrando» que sigue el resto del sitio. La función de limpieza
 * se protege igual.
 */
export const useIsomorphicLayoutEffect = (
  effect: EffectCallback,
  deps?: React.DependencyList
) =>
  useIsomorphic(() => {
    let limpiar: ReturnType<EffectCallback>;
    try {
      limpiar = effect();
    } catch (e) {
      if (process.env.NODE_ENV !== "production") console.error(e);
      return;
    }
    return () => {
      try {
        limpiar?.();
      } catch (e) {
        if (process.env.NODE_ENV !== "production") console.error(e);
      }
    };
  }, deps);
