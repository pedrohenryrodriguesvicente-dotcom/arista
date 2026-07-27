"use client";

import { useRef } from "react";
import Image from "next/image";
import imgDeclaracion from "@/public/img/declaracion.jpg";
import { gsap, SplitText } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { afterFonts, armFailShowing } from "@/lib/anim";

export default function Declaracion() {
  const root = useRef<HTMLElement>(null);

  const irAGaleria = () => {
    const target = document.getElementById("galeria");
    if (!target) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  };

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

        const phrase = el.querySelector<HTMLElement>(".js-phrase");
        const cta = el.querySelector<HTMLElement>(".js-cta");
        const label = el.querySelector<HTMLElement>(".js-label");
        const parallax = el.querySelector<HTMLElement>(".js-parallax");

        gsap.set([cta, label], { autoAlpha: 0, y: 16 });

        // Parallax suave (sólo escritorio)
        let twParallax: gsap.core.Tween | null = null;
        if (!mobile && parallax) {
          twParallax = gsap.fromTo(
            parallax,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }

        // Reveal por líneas de la frase (tras cargar la fuente)
        let split: SplitText | null = null;
        let tl: gsap.core.Timeline | null = null;
        let killed = false;
        let revealed = false; // la salvaguarda ya mostró el contenido

        // Estado final visible (usado por la salvaguarda "fallar mostrando")
        const finalize = () => {
          revealed = true;
          gsap.set([cta, label], { autoAlpha: 1, y: 0 });
          if (split) gsap.set(split.lines, { yPercent: 0 });
        };

        afterFonts(() => {
          // Si la salvaguarda ya reveló (fuentes lentas), no volver a ocultar.
          if (killed || revealed || !phrase) return;
          split = new SplitText(phrase, { type: "lines", mask: "lines" });
          gsap.set(split.lines, { yPercent: 110 });

          tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: el, start: "top 70%", once: true },
          });
          tl.to(split.lines, {
            yPercent: 0,
            duration: mobile ? 0.47 : 0.65,
            stagger: mobile ? 0.06 : 0.1,
          })
            .to(cta, { autoAlpha: 1, y: 0, duration: 0.45 }, ">-0.15")
            .to(label, { autoAlpha: 1, y: 0, duration: 0.45 }, "<0.08");
        });

        // Salvaguarda "fallar mostrando": si al entrar en pantalla el reveal no
        // ha arrancado, fuerza el estado final (frase, botón y etiqueta visibles).
        const disarm = armFailShowing(
          el,
          () => (tl ? tl.progress() > 0 : false),
          finalize
        );

        return () => {
          killed = true;
          disarm();
          tl?.scrollTrigger?.kill();
          tl?.kill();
          split?.revert();
          twParallax?.scrollTrigger?.kill();
          twParallax?.kill();
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id="declaracion"
      ref={root}
      className="declaracion"
      aria-labelledby="declaracion-frase"
    >
      {/* Fotografía a sangre + parallax */}
      <div className="js-parallax parallax-layer">
        <Image
          src={imgDeclaracion}
          alt="Terraza de la residencia con la piscina desbordante en primer término y, al fondo, la costa y el Mediterráneo bajo un cielo despejado."
          fill
          quality={88}
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-center"
        />
      </div>

      {/* Velo oscuro para legibilidad */}
      <div className="declaracion-veil" aria-hidden="true" />

      {/* Contenido a la izquierda, sobre la zona en sombra de la foto */}
      <div className="declaracion-inner">
        <div className="shell w-full">
          <div className="grid-12">
            <div className="col-span-12 lg:col-start-1 lg:col-span-6">
              <h2
                id="declaracion-frase"
                className="js-phrase declaracion-frase"
              >
                El mar empieza donde termina la casa.
              </h2>
              <button
                type="button"
                onClick={irAGaleria}
                className="js-cta pill mt-8 lg:mt-10"
              >
                Ver la galería
                <svg
                  className="pill-arrow"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 1.5v9M2.5 7 6 10.5 9.5 7"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Etiqueta discreta */}
      <p className="js-label declaracion-label">Costa del Sol · Mediterráneo</p>
    </section>
  );
}
