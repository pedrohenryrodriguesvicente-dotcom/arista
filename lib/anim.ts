/**
 * Ejecuta `fn` cuando las fuentes están cargadas, para que SplitText mida
 * las líneas con la tipografía real (sin reflujo). Si ya están listas, o no
 * hay soporte, ejecuta de inmediato.
 */
export function afterFonts(fn: () => void): void {
  if (
    typeof document !== "undefined" &&
    document.fonts &&
    document.fonts.status !== "loaded"
  ) {
    document.fonts.ready.then(fn);
  } else {
    fn();
  }
}

/**
 * Salvaguarda "fallar mostrando" (fail-safe reveal).
 *
 * Los estados iniciales OCULTOS de una sección se aplican sólo desde JS (nunca
 * desde el CSS base), de modo que si el JS no corre el contenido ya es visible.
 * Esta salvaguarda cubre el caso restante: el JS oculta el contenido pero el
 * ScrollTrigger NO llega a dispararse (fallo de matchMedia, error en
 * SplitText, orden de carga, navegación directa a un ancla, captura
 * automatizada…). Observa la sección con IntersectionObserver y, si entra en
 * el viewport y pasado `graceMs` la animación sigue sin haber arrancado
 * (`isPlayed()` === false), fuerza el estado final visible con `finalize()`.
 *
 * Sólo actúa ante un fallo real (sección visible pero sin animar); nunca revela
 * de forma prematura contenido que aún está bajo el pliegue, así que no rompe
 * el reveal normal. Devuelve una función de limpieza (quitar en el unmount).
 */
export function armFailShowing(
  root: Element,
  isPlayed: () => boolean,
  finalize: () => void,
  opts: { graceMs?: number; threshold?: number } = {}
): () => void {
  const { graceMs = 1400, threshold = 0.01 } = opts;

  if (typeof IntersectionObserver === "undefined") {
    // Sin soporte: revela de inmediato si aún no ha animado (nunca esconder).
    if (!isPlayed()) finalize();
    return () => {};
  }

  let timer: ReturnType<typeof setTimeout> | null = null;
  let finished = false;

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const cleanup = () => {
    finished = true;
    clearTimer();
    io.disconnect();
  };
  const settle = () => {
    if (finished) return;
    if (!isPlayed()) finalize(); // el trigger no disparó → revelar
    cleanup();
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting && timer === null && !finished) {
          timer = setTimeout(settle, graceMs);
        }
      }
    },
    { threshold }
  );
  io.observe(root);

  return cleanup;
}
