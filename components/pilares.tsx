"use client";

import { useRef } from "react";
import Image, { type StaticImageData } from "next/image";
// Importaciones estáticas: Next genera en build el blurDataURL de cada foto.
import imgPilar01 from "@/public/img/pilar-01.jpg";
import imgPilar02 from "@/public/img/pilar-02.jpg";
import imgPilar03 from "@/public/img/pilar-03.jpg";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { armFailShowing } from "@/lib/anim";

type Pilar = {
  num: string;
  title: string;
  body: string;
  dato: string;
  img: StaticImageData;
  side: "left" | "right";
  pos: string;
  alt: string;
};

const PILARES: Pilar[] = [
  {
    num: "01",
    title: "Arquitectura",
    body: "Volúmenes limpios de piedra caliza y madera, resueltos con aristas vivas y sombra marcada. La geometría se somete a la luz del sur.",
    dato: "Piedra caliza · Madera de iroko",
    img: imgPilar01,
    side: "right",
    pos: "50% 50%",
    alt: "Esquina de piedra caliza atravesada por una franja de luz dura que dibuja una sombra marcada sobre el muro.",
  },
  {
    num: "02",
    title: "Emplazamiento",
    body: "Sobre una ladera orientada al mar, entre pinos y vegetación mediterránea, con el horizonte siempre a la vista.",
    dato: "Ladera sur · Cota 210 m",
    img: imgPilar02,
    side: "left",
    pos: "50% 42%",
    alt: "Villa de piedra en una ladera mediterránea entre pinos y olivos, con el mar en el horizonte al atardecer.",
  },
  {
    num: "03",
    title: "Interiorismo",
    body: "Materiales naturales, textura y temperatura. El interior prolonga el exterior sin transición perceptible.",
    dato: "Travertino · Madera de iroko",
    img: imgPilar03,
    side: "right",
    pos: "50% 45%",
    alt: "Interior con pared de piedra natural de textura marcada, iluminación cálida rasante y carpintería de madera.",
  },
];

export default function Pilares() {
  const root = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
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

        const timelines: gsap.core.Timeline[] = [];

        // Cabecera
        const head = Array.from(
          el.querySelectorAll<HTMLElement>(".js-head")
        );
        gsap.set(head, { autoAlpha: 0, y: 16 });
        const tlHead = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
        tlHead.to(head, {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.07,
          ease: "power3.out",
        });
        timelines.push(tlHead);

        // Una fila (pilar) por fila, con su propio ScrollTrigger
        const rows = Array.from(el.querySelectorAll<HTMLElement>(".js-row"));
        rows.forEach((row) => {
          const line = row.querySelector<HTMLElement>(".js-line");
          const text = Array.from(
            row.querySelectorAll<HTMLElement>(".js-text > *")
          );
          const frame = row.querySelector<HTMLElement>(".js-frame");
          const img = row.querySelector<HTMLElement>(".js-img");

          gsap.set(line, { scaleX: 0 });
          gsap.set(text, { autoAlpha: 0, y: 20 });
          gsap.set(frame, { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.set(img, { scale: 1.04 });

          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: row, start: "top 90%", once: true },
          });
          tl.to(line, {
            scaleX: 1,
            duration: mobile ? 0.36 : 0.58,
            ease: "power2.inOut",
          })
            .to(
              frame,
              { clipPath: "inset(0% 0% 0% 0%)", duration: mobile ? 0.54 : 0.68 },
              mobile ? ">-0.07" : ">-0.12"
            )
            .to(img, { scale: 1, duration: mobile ? 0.61 : 0.83 }, "<")
            .to(
              text,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.45,
                stagger: mobile ? 0.045 : 0.07,
              },
              mobile ? "<0.07" : "<0.15"
            );
          timelines.push(tl);
        });

        // Salvaguarda "fallar mostrando": si algún reveal no arranca al entrar
        // en pantalla, se fuerza el estado FINAL explícito (imágenes + textos
        // visibles), sin depender de que las timelines existan.
        const finalize = () => {
          gsap.set(head, { autoAlpha: 1, y: 0 });
          rows.forEach((row) => {
            gsap.set(row.querySelector(".js-line"), { scaleX: 1 });
            gsap.set(Array.from(row.querySelectorAll(".js-text > *")), {
              autoAlpha: 1,
              y: 0,
            });
            gsap.set(row.querySelector(".js-frame"), {
              clipPath: "inset(0% 0% 0% 0%)",
            });
            gsap.set(row.querySelector(".js-img"), { scale: 1 });
          });
        };
        const disarm = armFailShowing(
          el,
          () => timelines.some((t) => t.progress() > 0),
          finalize
        );

        return () => {
          disarm();
          timelines.forEach((t) => {
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
      id="pilares"
      ref={root}
      className="section-y"
      aria-labelledby="pilares-title"
    >
      <div className="shell">
        {/* Cabecera de sección, arriba a la derecha (cols 5–12) */}
        <div className="grid-12">
          <div className="col-span-12 lg:col-start-5 lg:col-span-8">
            <p className="js-head label text-gris">Pilares</p>
            <h2
              id="pilares-title"
              className="js-head mt-4 lg:mt-5 font-display text-h2 text-grafito text-balance"
            >
              Tres principios, una misma línea.
            </h2>
          </div>
        </div>

        {/* Filas — separación reducida para que se lean como un bloque */}
        <div className="mt-10 flex flex-col gap-10 lg:mt-14 lg:gap-14">
          {PILARES.map((p) => {
            const textCols =
              p.side === "right"
                ? "lg:col-start-1 lg:col-span-6"
                : "lg:col-start-7 lg:col-span-6";
            const mediaCols =
              p.side === "right"
                ? "lg:col-start-9 lg:col-span-4"
                : "lg:col-start-1 lg:col-span-4";
            return (
              <article key={p.num} className="js-row pilar">
                <span className="js-line hairline" />
                <div className="grid-12 items-center gap-y-6 pt-8 lg:gap-y-0 lg:pt-10">
                  <div
                    className={`js-text col-span-12 ${textCols} lg:row-start-1`}
                  >
                    <p className="label acento">{p.num}</p>
                    <h3 className="mt-4 font-display text-h3 text-grafito">
                      {p.title}
                    </h3>
                    <p className="mt-4 max-w-[46ch] text-lede text-gris">
                      {p.body}
                    </p>
                    <p className="mt-6 label text-gris">{p.dato}</p>
                  </div>
                  <div className={`col-span-12 ${mediaCols} lg:row-start-1`}>
                    <div className="js-frame media-frame aspect-[4/5]">
                      <Image
                        src={p.img}
                        alt={p.alt}
                        fill
                        quality={88}
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) calc(100vw - 96px), calc(100vw - 40px)"
                        placeholder="blur"
                        className="js-img object-cover"
                        style={{ objectPosition: p.pos }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
