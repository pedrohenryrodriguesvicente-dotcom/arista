"use client";

import { useRef } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { useAnimEffect } from "@/lib/use-anim-effect";
import { afterFonts, armFailShowing } from "@/lib/anim";

export default function Esencia() {
  const root = useRef<HTMLElement>(null);

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
        if (cond.reduced) return; // reduced-motion: estado final visible
        const mobile = !!cond.mobile;

        const label = el.querySelector<HTMLElement>(".js-label");
        const line = el.querySelector<HTMLElement>(".js-line");
        const tick = el.querySelector<HTMLElement>(".js-tick");
        const phrase = el.querySelector<HTMLElement>(".js-phrase");

        // Estados iniciales (elemento fuera de pantalla → sin parpadeo)
        gsap.set(label, { autoAlpha: 0, y: 12 });
        gsap.set(line, { scaleX: 0 });
        gsap.set(tick, { scaleY: 0 });
        gsap.set(phrase, { autoAlpha: 0 });

        let split: SplitText | null = null;
        let tl: gsap.core.Timeline | null = null;
        let killed = false;
        let revealed = false; // la salvaguarda ya mostró el contenido

        // Estado final visible (usado por la salvaguarda "fallar mostrando")
        const finalize = () => {
          revealed = true;
          gsap.set(label, { autoAlpha: 1, y: 0 });
          gsap.set(line, { scaleX: 1 });
          gsap.set(tick, { scaleY: 1 });
          gsap.set(phrase, { autoAlpha: 1 });
          if (split) gsap.set(split.lines, { yPercent: 0 });
        };

        afterFonts(() => {
          // Si la salvaguarda ya reveló (fuentes lentas), no volver a ocultar.
          if (killed || revealed || !phrase) return;
          split = new SplitText(phrase, { type: "lines", mask: "lines" });
          gsap.set(phrase, { autoAlpha: 1 });
          gsap.set(split.lines, { yPercent: 110 });

          tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          });
          // 1) etiqueta · 2) la línea se dibuja · 3) marca vertical ·
          // 4) la frase entra por líneas DESPUÉS de la línea
          tl.to(label, { autoAlpha: 1, y: 0, duration: 0.36 })
            .to(
              line,
              { scaleX: 1, duration: mobile ? 0.36 : 0.65, ease: "power2.inOut" },
              0.07
            )
            .to(tick, { scaleY: 1, duration: 0.22 }, ">-0.05")
            .to(
              split.lines,
              {
                yPercent: 0,
                duration: mobile ? 0.4 : 0.55,
                stagger: mobile ? 0.045 : 0.09,
              },
              ">-0.05"
            );
        });

        // Salvaguarda: si al entrar en pantalla el reveal no ha arrancado
        // (fuentes/SplitText/orden de carga), fuerza el estado final visible.
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
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id="esencia"
      ref={root}
      className="esencia"
      aria-labelledby="esencia-frase"
    >
      <div className="shell w-full">
        <div className="grid-12">
          <div className="col-span-12 lg:col-start-3 lg:col-span-8">
            <p className="js-label label text-gris">
              La idea
            </p>
            <h2
              id="esencia-frase"
              className="js-phrase mt-6 font-display text-display text-grafito text-balance"
            >
              Toda casa empieza por una línea. Esta la trazó el horizonte.
            </h2>
          </div>
        </div>

        <div className="grid-12 mt-8 lg:mt-10">
          <div className="col-span-12 lg:col-start-3 lg:col-span-10 line-wrap">
            <span className="js-line hairline" />
            <span className="js-tick hairline-tick" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
