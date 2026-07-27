"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Límite de error de la ruta. Sin él, cualquier excepción en tiempo de
 * ejecución deja la página EN BLANCO; con él, el visitante ve un aviso sobrio
 * y puede reintentar sin recargar a mano. Mismo tratamiento visual que la 404.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción sólo queda el digest, que es lo que permite localizar el
    // fallo en los registros del servidor sin exponer nada al visitante.
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  return (
    <main id="contenido" tabIndex={-1} className="pagina-aviso">
      <div className="shell">
        <div className="grid-12">
          <div className="col-span-12 lg:col-start-1 lg:col-span-7">
            <p className="label text-gris">Error</p>
            <h1 className="mt-4 lg:mt-5 font-display text-h2 text-grafito text-balance">
              Algo no ha funcionado.
            </h1>
            <p className="mt-6 lg:mt-8 max-w-[52ch] text-lede text-gris">
              Ha ocurrido un problema al mostrar esta página. Puede intentarlo
              de nuevo; si persiste, vuelva al inicio en unos minutos.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <button type="button" onClick={reset} className="pill">
                Reintentar
              </button>
              <Link
                href="/"
                className="link-underline link-acento font-sans text-base font-medium text-grafito"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
