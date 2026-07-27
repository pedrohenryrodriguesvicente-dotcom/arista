"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, SplitText } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const aristaRef = useRef<HTMLSpanElement>(null); // vertical (escritorio)
  const aristaHRef = useRef<HTMLSpanElement>(null); // horizontal (móvil)
  const tickRef = useRef<HTMLSpanElement>(null); // marca que cruza la arista
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const paraRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const dataRef = useRef<HTMLParagraphElement>(null);
  const scrollHintRef = useRef<HTMLSpanElement>(null);

  // El indicador de scroll cumple su función una sola vez: en cuanto el
  // visitante baja, se desvanece y no vuelve (repetirlo sería insistente).
  useEffect(() => {
    const el = scrollHintRef.current;
    if (!el) return;
    if (window.scrollY > 24) {
      el.dataset.oculto = "true";
      return;
    }
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (window.scrollY <= 24) return;
        el.dataset.oculto = "true";
        window.removeEventListener("scroll", onScroll);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context: gsap.Context) => {
          const conditions = (context.conditions ?? {}) as Record<
            string,
            boolean
          >;
          const isDesktop = !!conditions.isDesktop;
          const reduced = !!conditions.reduced;

          // Sitúa la marca horizontal a la altura de la línea base del titular.
          const positionTick = () => {
            const tick = tickRef.current;
            const title = titleRef.current;
            if (!tick || !title) return;
            const tr = title.getBoundingClientRect();
            const rr = root.getBoundingClientRect();
            const fs = parseFloat(getComputedStyle(title).fontSize);
            tick.style.top = `${tr.bottom - rr.top - fs * 0.22}px`;
          };

          const afterFonts = (fn: () => void) => {
            if (document.fonts && document.fonts.status !== "loaded") {
              document.fonts.ready.then(fn);
            } else {
              fn();
            }
          };

          // Recoloca la marca al redimensionar (el titular se recentra).
          let onResize: (() => void) | null = null;
          if (isDesktop && tickRef.current) {
            onResize = () => positionTick();
            window.addEventListener("resize", onResize);
          }

          // Reduced motion: estado final visible, sin movimiento.
          if (reduced) {
            if (isDesktop) afterFonts(positionTick);
            return () => {
              if (onResize) window.removeEventListener("resize", onResize);
            };
          }

          const arista = isDesktop ? aristaRef.current : aristaHRef.current;
          const titleInners = titleRef.current
            ? Array.from(
                titleRef.current.querySelectorAll<HTMLElement>(".reveal-inner")
              )
            : [];
          const small = [
            eyebrowRef.current,
            ctaRef.current,
            dataRef.current,
          ].filter(Boolean) as HTMLElement[];
          const paraEl = paraRef.current;

          // --- Estados iniciales (se aplican antes del pintado → sin parpadeo) ---
          if (arista) {
            gsap.set(arista, isDesktop ? { scaleY: 0 } : { scaleX: 0 });
          }
          if (isDesktop && tickRef.current) {
            gsap.set(tickRef.current, { xPercent: -50, scaleX: 0 });
          }
          gsap.set(titleInners, { yPercent: 115 });
          gsap.set(small, { autoAlpha: 0, y: 18 });
          if (paraEl) gsap.set(paraEl, { autoAlpha: 0 });

          let split: SplitText | null = null;

          const build = () => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            // 1) La arista se dibuja (de arriba abajo en escritorio, 1,2s)
            if (arista) {
              tl.to(
                arista,
                {
                  ...(isDesktop ? { scaleY: 1 } : { scaleX: 1 }),
                  duration: isDesktop ? 0.85 : 0.65,
                  ease: "power2.inOut",
                },
                0
              );
            }

            // La etiqueta entra durante el trazo de la línea
            tl.to(eyebrowRef.current, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.15);

            // 2) Titular por líneas, DESPUÉS de que la arista termine
            tl.to(
              titleInners,
              { yPercent: 0, duration: 0.65, stagger: 0.09 },
              isDesktop ? ">-0.05" : 0.3
            );

            // 3) Párrafo — por líneas en escritorio, en bloque (aligerado) en móvil
            if (paraEl && isDesktop) {
              gsap.set(paraEl, { autoAlpha: 1 });
              split = new SplitText(paraEl, {
                type: "lines",
                mask: "lines",
                linesClass: "reveal-inner",
                // SplitText, por defecto, pone un aria-label en el elemento
                // partido y oculta los trozos. En un <p> (rol «paragraph»)
                // aria-label es un atributo PROHIBIDO por ARIA. Al desactivarlo
                // el lector de pantalla lee los <span> de las líneas, que
                // conservan las palabras enteras, así que el texto se anuncia
                // igual y desaparece la infracción.
                aria: "none",
              });
              gsap.set(split.lines, { yPercent: 115 });
              tl.to(
                split.lines,
                { yPercent: 0, duration: 0.58, stagger: 0.07 },
                "<0.15"
              );
            } else if (paraEl) {
              gsap.set(paraEl, { y: 18 });
              tl.to(paraEl, { autoAlpha: 1, y: 0, duration: 0.5 }, "<0.1");
            }

            // 4) La marca horizontal cruza la arista, justo después del trazo
            if (isDesktop && tickRef.current) {
              positionTick();
              tl.to(
                tickRef.current,
                { scaleX: 1, duration: 0.36, ease: "power2.out" },
                0.95
              );
            }

            // 5) CTA y dato técnico
            tl.to(ctaRef.current, { autoAlpha: 1, y: 0, duration: 0.45 }, "<0.1");
            tl.to(dataRef.current, { autoAlpha: 1, y: 0, duration: 0.45 }, "<0.08");
          };

          // Espera a las fuentes para que las líneas midan bien (sin reflow)
          afterFonts(build);

          return () => {
            split?.revert();
            if (onResize) window.removeEventListener("resize", onResize);
          };
        }
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="inicio"
      ref={rootRef}
      className="hero"
      aria-label="ARISTA — residencia de obra nueva en Benahavís"
    >
      {/* Columna de texto (5/12) */}
      <div className="hero-text">
        <p
          ref={eyebrowRef}
          className="label text-gris"
        >
          Benahavís · Marbella
        </p>

        <div className="hero-copy">
          <h1 ref={titleRef} className="hero-title">
            <span className="reveal-line">
              <span className="reveal-inner">Donde la montaña</span>
            </span>
            <span className="reveal-line">
              <span className="reveal-inner">encuentra el mar.</span>
            </span>
          </h1>

          <p ref={paraRef} className="mt-6 max-w-[42ch] text-lede text-gris">
            Una residencia de obra nueva concebida como una línea limpia sobre la
            ladera: luz, piedra y horizonte en cada estancia.
          </p>

          <div ref={ctaRef} className="mt-10">
            <a
              href="#contacto"
              className="link-underline link-acento font-sans text-base font-medium text-grafito"
            >
              Solicitar información
            </a>
          </div>
        </div>

        <p
          ref={dataRef}
          className="hero-data label text-gris"
        >
          720 m² construidos · Parcela 2.400 m² · Llave en mano
        </p>

        {/* Indicador de que la página continúa: filete con un segmento que
            lo recorre en bucle lento. Decorativo. */}
        <span ref={scrollHintRef} className="hero-scroll" aria-hidden="true">
          <span className="hero-scroll-seg" />
        </span>
      </div>

      {/* Columna de imagen (7/12) — sangra hasta el borde derecho */}
      <div className="hero-media">
        <Image
          src="/img/hero.jpg"
          alt="Fachada de la residencia ARISTA en Benahavís: volumen de piedra caliza clara recortado contra el cielo azul mediterráneo, con celosías de madera."
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          quality={85}
          className="object-cover hero-img"
        />
        {/* Lift claro superior: legibilidad de la navegación en grafito (escritorio) */}
        <div className="hero-toplift" aria-hidden="true" />
        {/* Arista horizontal — sólo visible en móvil */}
        <span ref={aristaHRef} className="hero-arista-h" aria-hidden="true" />
      </div>

      {/* Arista vertical — la línea que se dibuja al cargar (escritorio) */}
      <span ref={aristaRef} className="hero-arista" aria-hidden="true" />
      {/* Marca horizontal que cruza la arista en la línea base del titular */}
      <span ref={tickRef} className="hero-arista-tick" aria-hidden="true" />
    </section>
  );
}
