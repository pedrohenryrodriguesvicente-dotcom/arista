"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useAnimEffect } from "@/lib/use-anim-effect";
import { armFailShowing } from "@/lib/anim";

const DATOS: [string, string][] = [
  ["Superficie construida", "720 m²"],
  ["Parcela", "2.400 m²"],
  ["Dormitorios", "5 suites"],
  ["Baños", "6"],
  ["Niveles", "3 plataformas"],
  ["Orientación", "Sur"],
  ["Altitud", "210 m sobre el mar"],
  ["Materiales", "Piedra caliza, iroko, travertino, vidrio"],
  ["Eficiencia", "Certificación A"],
  ["Año de construcción", "2026"],
  ["Entrega", "Inmediata"],
  ["Ubicación", "Benahavís, Marbella"],
];

export default function FichaTecnica() {
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
        if (cond.reduced) return;
        const mobile = !!cond.mobile;

        const head = Array.from(el.querySelectorAll<HTMLElement>(".js-head"));
        const filetes = Array.from(el.querySelectorAll<HTMLElement>(".js-filete"));
        const filas = Array.from(el.querySelectorAll<HTMLElement>(".js-fila"));
        const nota = el.querySelector<HTMLElement>(".js-nota");

        // Estados iniciales (sólo desde JS → sin JS la ficha se ve completa)
        gsap.set(head, { autoAlpha: 0, y: 16 });
        gsap.set(filetes, { scaleX: 0 });
        gsap.set([...filas, nota], { autoAlpha: 0, y: 14 });

        const timelines: gsap.core.Timeline[] = [];

        const tlHead = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: el, start: "top 68%", once: true },
        });
        tlHead.to(head, { autoAlpha: 1, y: 0, duration: 0.59, stagger: 0.09 });
        timelines.push(tlHead);

        // Tabla: cada filete se dibuja y su fila entra, con un stagger corto
        const tlTabla = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: el.querySelector(".js-tabla") ?? el,
            start: "top 66%",
            once: true,
          },
        });
        tlTabla
          .to(filetes, {
            scaleX: 1,
            duration: mobile ? 0.53 : 0.66,
            stagger: mobile ? 0.05 : 0.07,
            ease: "power2.inOut",
          })
          .to(
            filas,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.53,
              stagger: mobile ? 0.05 : 0.07,
            },
            "<0.08"
          )
          .to(nota, { autoAlpha: 1, y: 0, duration: 0.53 }, ">-0.13");
        timelines.push(tlTabla);

        const finalize = () => {
          gsap.set(head, { autoAlpha: 1, y: 0 });
          gsap.set(filetes, { scaleX: 1 });
          gsap.set([...filas, nota], { autoAlpha: 1, y: 0 });
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
      id="ficha-tecnica"
      ref={root}
      className="ficha section-y"
      data-tono="oscuro"
      aria-labelledby="ficha-title"
    >
      <div className="shell">
        <div className="grid-12 gap-y-10 lg:gap-y-0">
          {/* Cabecera (cols 1–5) */}
          <div className="col-span-12 lg:col-start-1 lg:col-span-5">
            <p className="js-head label ficha-eyebrow">Ficha técnica</p>
            <h2
              id="ficha-title"
              className="js-head mt-4 lg:mt-5 font-display text-h2 ficha-title text-balance"
            >
              Los datos de la casa.
            </h2>
            <p className="js-head mt-6 lg:mt-8 max-w-[42ch] text-lede ficha-lede">
              Una construcción pensada para durar: materiales nobles, orientación
              optimizada y una relación exacta entre superficie, luz y paisaje.
            </p>
          </div>

          {/* Tabla (cols 7–12) */}
          <div className="col-span-12 lg:col-start-7 lg:col-span-6">
            <ul className="js-tabla ficha-tabla">
              {DATOS.map(([k, v]) => (
                <li key={k} className="ficha-fila">
                  <span className="js-filete ficha-filete" aria-hidden="true" />
                  <span className="js-fila label ficha-etiqueta">{k}</span>
                  <span className="js-fila ficha-valor">{v}</span>
                </li>
              ))}
              {/* Filete de cierre inferior */}
              <li className="ficha-fila" aria-hidden="true" style={{ padding: 0 }}>
                <span className="js-filete ficha-filete" />
              </li>
            </ul>
            <p className="js-nota ficha-nota label">
              Todas las medidas son aproximadas · Proyecto de obra nueva
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
