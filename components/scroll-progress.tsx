"use client";

import { useEffect, useRef } from "react";

/**
 * Barra de progreso de lectura, colgada del borde inferior del header fijo.
 *
 * - Avanza SÓLO con transform: scaleX (nunca width) → ni reflujo ni CLS.
 * - Lectura de scroll en un listener pasivo agrupado con requestAnimationFrame
 *   (un único fotograma por frame, sin lag de suavizado).
 * - El color cambia a hueso cuando la franja del header cae sobre una sección
 *   marcada con data-tono="oscuro" (Ficha técnica y pie).
 * - Decorativa: aria-hidden y sin elementos enfocables.
 */
export default function ScrollProgress() {
  const wrap = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapEl = wrap.current;
    const barEl = bar.current;
    if (!wrapEl || !barEl) return;

    const doc = document.documentElement;
    let raf = 0;
    let oscuro = false;

    const update = () => {
      raf = 0;

      // --- Todas las LECTURAS primero (nunca una lectura tras una escritura:
      //     eso forzaría un recálculo de maquetación síncrono cada fotograma).
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      // ¿La barra está sobre una sección oscura? (data-sobre en el envoltorio,
      // nunca data-tono: si no, el propio envoltorio entraría en la consulta)
      const y = wrapEl.getBoundingClientRect().top + 1;
      let sobreOscuro = false;
      for (const s of document.querySelectorAll<HTMLElement>(
        '[data-tono="oscuro"]'
      )) {
        const r = s.getBoundingClientRect();
        if (r.top <= y && r.bottom >= y) {
          sobreOscuro = true;
          break;
        }
      }

      // --- Y después las ESCRITURAS
      barEl.style.transform = `scaleX(${p})`;
      if (sobreOscuro !== oscuro) {
        oscuro = sobreOscuro;
        wrapEl.dataset.sobre = sobreOscuro ? "oscuro" : "claro";
      }
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrap} className="progress" data-sobre="claro" aria-hidden="true">
      <div ref={bar} className="progress-bar" />
    </div>
  );
}
