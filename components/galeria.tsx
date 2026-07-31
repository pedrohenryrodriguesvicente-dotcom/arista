"use client";

import { useCallback, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import dynamic from "next/dynamic";
// Importaciones estáticas: Next genera en build el blurDataURL de cada foto.
import img01 from "@/public/img/galeria-01.jpg";
import img02 from "@/public/img/galeria-02.jpg";
import img03 from "@/public/img/galeria-03.jpg";
import img04 from "@/public/img/galeria-04.jpg";
import img05 from "@/public/img/galeria-05.jpg";
import img06 from "@/public/img/galeria-06.jpg";
import { gsap } from "@/lib/gsap";
import { useAnimEffect } from "@/lib/use-anim-effect";
import { armFailShowing } from "@/lib/anim";

type Foto = {
  src: StaticImageData;
  ratio: string; // aspect-ratio css
  cols: string; // clases de columnas (escritorio)
  offset: string; // desplazamiento vertical (escritorio)
  axis: "v" | "h"; // orientación (parallax + ancho en móvil)
  // Orden de lectura POR DEBAJO DE 768px, donde las tres verticales se
  // emparejan de dos en dos y las horizontales van a ancho completo. Alterna
  // horizontal / pareja para dar ritmo; en escritorio no se aplica.
  orden: number;
  // Sólo hay TRES verticales, así que una se queda sin pareja. En vez de
  // dejarla suelta a la izquierda, se alinea a la derecha: la asimetría se lee
  // como decisión editorial y coincide con el lado que ocupa en escritorio.
  solo?: boolean;
  sizes: string;
  cap: string;
  alt: string;
};

// Fila 1 — díptico: las dos fotos comparten arista, sin calle entre ellas.
// Los anchos (68,085 % / 31,915 %) son los únicos que igualan sus alturas
// respetando sus proporciones nativas → se tocan sin recorte ni deformación.
const DIPTICO: Foto[] = [
  {
    src: img01,
    ratio: "16 / 10",
    cols: "",
    offset: "",
    axis: "h",
    orden: 1,
    sizes: "(min-width: 1024px) 66vw, (min-width: 768px) calc(100vw - 96px), calc(100vw - 40px)",
    cap: "Fachada sur · Acceso principal",
    alt: "Fachada sur de la residencia: dos volúmenes claros de cubierta plana con grandes paños acristalados, celosías de madera y un revestimiento de piedra oscura junto al acceso principal.",
  },
  {
    src: img02,
    ratio: "3 / 4",
    cols: "",
    offset: "",
    axis: "v",
    orden: 2,
    sizes: "(min-width: 1024px) 31vw, (min-width: 768px) calc(100vw - 96px), calc(50vw - 16px)",
    cap: "Escalera central · Luz rasante",
    alt: "Escalera central de la casa iluminada por luz rasante que resbala sobre la piedra y la madera.",
  },
];

// Filas 2 y 3 de la retícula editorial asimétrica
const ROWS: Foto[][] = [
  [
    {
      src: img04,
      ratio: "3 / 4",
      cols: "lg:col-start-1 lg:col-span-4",
      offset: "",
      axis: "v",
      orden: 3,
      sizes: "(min-width: 1024px) 31vw, (min-width: 768px) calc(100vw - 96px), calc(50vw - 16px)",
      cap: "Baño principal · Travertino",
      alt: "Baño principal revestido de travertino, con encimera de piedra maciza y lavabo integrado, espejo de arco y ducha de obra al fondo.",
    },
    {
      src: img03,
      ratio: "16 / 10",
      cols: "lg:col-start-6 lg:col-span-7",
      offset: "lg:mt-20",
      axis: "h",
      orden: 4,
      sizes: "(min-width: 1024px) 56vw, (min-width: 768px) calc(100vw - 96px), calc(100vw - 40px)",
      cap: "Salón · Doble orientación",
      alt: "Salón a doble altura con chimenea, suelo de madera y grandes cristaleras corridas abiertas a la terraza y la piscina.",
    },
  ],
  [
    {
      src: img05,
      ratio: "16 / 10",
      cols: "lg:col-start-1 lg:col-span-7",
      offset: "",
      axis: "h",
      // Cierra la galería en móvil (ver `orden`): así no quedan dos
      // horizontales seguidas ni una vertical suelta al final.
      orden: 6,
      sizes: "(min-width: 1024px) 56vw, (min-width: 768px) calc(100vw - 96px), calc(100vw - 40px)",
      cap: "Cocina · Isla de mármol",
      alt: "Cocina abierta con una gran isla de mármol y carpintería de madera de iroko.",
    },
    {
      src: img06,
      ratio: "3 / 4",
      cols: "lg:col-start-9 lg:col-span-4",
      offset: "lg:mt-24",
      axis: "v",
      orden: 5,
      solo: true,
      sizes: "(min-width: 1024px) 31vw, (min-width: 768px) calc(100vw - 96px), calc(50vw - 16px)",
      cap: "Dormitorio principal · Vista al mar",
      alt: "Dormitorio principal con la cama orientada hacia un ventanal que enmarca el Mediterráneo.",
    },
  ],
];

// El visor sólo hace falta cuando se pulsa una fotografía: cargándolo bajo
// demanda, su código no se evalúa en el arranque (mide 27 ms de TBT).
const Lightbox = dynamic(() => import("@/components/lightbox"), { ssr: false });

// Orden del visor = orden en que se leen las fotos en la página.
const TODAS: Foto[] = [...DIPTICO, ...ROWS.flat()];

export default function Galeria() {
  const root = useRef<HTMLElement>(null);
  const [visor, setVisor] = useState<number | null>(null);
  // Botón desde el que se abrió el visor: al cerrarlo, el foco vuelve ahí.
  const origen = useRef<HTMLButtonElement | null>(null);

  const abrir = useCallback((i: number, boton: HTMLButtonElement) => {
    origen.current = boton;
    setVisor(i);
  }, []);

  const cerrar = useCallback(() => {
    setVisor(null);
    origen.current?.focus();
  }, []);

  useAnimEffect(() => {
    const el = root.current;
    if (!el) return;

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        mobile: "(max-width: 1023.98px)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx: gsap.Context) => {
        const cond = (ctx.conditions ?? {}) as Record<string, boolean>;
        if (cond.reduced) return;
        const mobile = !!cond.mobile;

        const head = Array.from(el.querySelectorAll<HTMLElement>(".js-head"));
        const figures = Array.from(el.querySelectorAll<HTMLElement>(".js-fig"));

        const timelines: gsap.core.Timeline[] = []; // todas (para limpieza)
        const figTimelines: gsap.core.Timeline[] = []; // solo figuras (para isPlayed)
        const tweens: gsap.core.Tween[] = [];

        // --- Cabecera ---
        gsap.set(head, { autoAlpha: 0, y: 16 });
        const tlHead = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 66%", once: true },
        });
        tlHead.to(head, {
          autoAlpha: 1,
          y: 0,
          duration: 0.59,
          stagger: 0.09,
          ease: "power3.out",
        });
        timelines.push(tlHead);

        // --- Cada figura: reveal de máscara + escala, luego filete y pie ---
        figures.forEach((fig) => {
          const frame = fig.querySelector<HTMLElement>(".js-frame");
          const parallax = fig.querySelector<HTMLElement>(".js-parallax");
          const img = fig.querySelector<HTMLElement>(".js-img");
          const capline = fig.querySelector<HTMLElement>(".js-capline");
          const cap = fig.querySelector<HTMLElement>(".js-cap");
          const axis = fig.dataset.axis;

          gsap.set(frame, { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.set(img, { scale: 1.05 });
          gsap.set(capline, { scaleX: 0 });
          gsap.set(cap, { autoAlpha: 0, y: 12 });

          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: frame, start: "top 72%", once: true },
          });
          tl.to(frame, {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: mobile ? 0.73 : 0.95,
          })
            .to(img, { scale: 1, duration: mobile ? 0.92 : 1.19 }, "<")
            .to(
              capline,
              { scaleX: 1, duration: 0.66, ease: "power2.inOut" },
              mobile ? ">-0.26" : ">-0.37"
            )
            .to(cap, { autoAlpha: 1, y: 0, duration: 0.53 }, ">-0.16");
          timelines.push(tl);
          figTimelines.push(tl);

          // Parallax vertical suave (sólo escritorio), distinto por orientación
          if (!mobile && parallax) {
            const amp = axis === "v" ? 6 : 3; // las verticales se mueven más
            tweens.push(
              gsap.fromTo(
                parallax,
                { yPercent: -amp },
                {
                  yPercent: amp,
                  ease: "none",
                  scrollTrigger: {
                    trigger: fig,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                  },
                }
              )
            );
          }
        });

        // Salvaguarda "fallar mostrando"
        const finalize = () => {
          gsap.set(head, { autoAlpha: 1, y: 0 });
          figures.forEach((fig) => {
            gsap.set(fig.querySelector(".js-frame"), {
              clipPath: "inset(0% 0% 0% 0%)",
            });
            gsap.set(fig.querySelector(".js-img"), { scale: 1 });
            gsap.set(fig.querySelector(".js-capline"), { scaleX: 1 });
            gsap.set(fig.querySelector(".js-cap"), { autoAlpha: 1, y: 0 });
          });
        };
        // isPlayed mira sólo las figuras (no la cabecera): si el reveal de las
        // imágenes no arranca, se rescata aunque la cabecera sí haya animado.
        const disarm = armFailShowing(
          el,
          () => figTimelines.some((t) => t.progress() > 0),
          finalize
        );

        return () => {
          disarm();
          timelines.forEach((t) => {
            t.scrollTrigger?.kill();
            t.kill();
          });
          tweens.forEach((t) => {
            t.scrollTrigger?.kill();
            t.kill();
          });
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id="galeria"
      ref={root}
      className="section-y"
      aria-labelledby="galeria-title"
    >
      <div className="shell">
        {/* Cabecera (cols 1–8) */}
        <div className="grid-12">
          <div className="col-span-12 lg:col-start-1 lg:col-span-8">
            <p className="js-head label text-gris">Galería</p>
            <h2
              id="galeria-title"
              className="js-head mt-4 lg:mt-5 font-display text-h2 text-grafito text-balance"
            >
              Seis miradas sobre la misma línea.
            </h2>
            <p className="js-head mt-6 lg:mt-8 max-w-[52ch] text-lede text-gris">
              Piedra caliza, madera de iroko, travertino y vidrio. Los mismos
              cuatro materiales recorren la casa de la entrada a la piscina, y la
              luz del sur se encarga del resto.
            </p>
          </div>
        </div>

        {/* Retícula asimétrica */}
        <div className="gal-lista mt-14 lg:mt-20">
          {/* Fila 1 — díptico continuo (por debajo de 768px el contenedor pasa
              a display:contents y sus fotos entran en la retícula de móvil) */}
          <div className="gal-diptico">
            {DIPTICO.map((f) => (
              <figure
                key={f.src.src}
                data-axis={f.axis}
                data-orden={f.orden}
                className="js-fig gal-figure"
              >
                <button
                  type="button"
                  className="js-frame media-frame gal-boton"
                  style={{ aspectRatio: f.ratio }}
                  aria-label={`Ampliar: ${f.alt}`}
                  onClick={(e) => abrir(TODAS.indexOf(f), e.currentTarget)}
                >
                  <div className="js-parallax parallax-layer">
                    <Image
                      src={f.src}
                      alt=""
                      fill
                      quality={88}
                      sizes={f.sizes}
                      placeholder="blur"
                      className="js-img object-cover"
                    />
                  </div>
                </button>
                <div className="gal-cap line-wrap">
                  <span className="js-capline hairline" />
                  <figcaption className="js-cap label text-gris mt-3">
                    {f.cap}
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>

          {ROWS.map((row, ri) => (
            <div key={ri} className="gal-fila grid-12 gap-y-14 lg:gap-y-0">
              {row.map((f) => (
                <figure
                  key={f.src.src}
                  data-axis={f.axis}
                  data-orden={f.orden}
                  data-solo={f.solo ? "true" : undefined}
                  className={`js-fig gal-figure col-span-12 ${f.cols} ${f.offset}`}
                >
                  <button
                    type="button"
                    className="js-frame media-frame gal-boton"
                    style={{ aspectRatio: f.ratio }}
                    aria-label={`Ampliar: ${f.alt}`}
                    onClick={(e) => abrir(TODAS.indexOf(f), e.currentTarget)}
                  >
                    <div className="js-parallax parallax-layer">
                      <Image
                        src={f.src}
                        alt=""
                        fill
                        quality={88}
                        sizes={f.sizes}
                        placeholder="blur"
                        className="js-img object-cover"
                      />
                    </div>
                  </button>
                  <div className="gal-cap line-wrap">
                    <span className="js-capline hairline" />
                    <figcaption className="js-cap label text-gris mt-3">
                      {f.cap}
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>

      {visor !== null && (
        <Lightbox
          fotos={TODAS}
          indice={visor}
          onIr={setVisor}
          onCerrar={cerrar}
        />
      )}
    </section>
  );
}
