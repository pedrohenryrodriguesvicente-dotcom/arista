import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  // Una 404 no debe competir en el índice con el contenido real del sitio.
  robots: { index: false, follow: true },
};

export default function NoEncontrada() {
  return (
    <main id="contenido" tabIndex={-1} className="pagina-aviso">
      <div className="shell">
        <div className="grid-12">
          <div className="col-span-12 lg:col-start-1 lg:col-span-7">
            <p className="label text-gris">Error 404</p>
            <h1 className="mt-4 lg:mt-5 font-display text-h2 text-grafito text-balance">
              La página que busca no existe.
            </h1>
            <p className="mt-6 lg:mt-8 max-w-[52ch] text-lede text-gris">
              Puede que la dirección haya cambiado o que se haya escrito con
              algún error. Desde el inicio encontrará el proyecto completo.
            </p>
            <div className="mt-10">
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
