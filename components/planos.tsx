"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useAnimEffect } from "@/lib/use-anim-effect";
import { armFailShowing } from "@/lib/anim";

// El número va suelto para poder marcarlo en acento; el texto es el mismo.
const NIVELES = [
  { num: "01", resto: "+210 m · Acceso y garaje" },
  { num: "02", resto: "+204 m · Zona de día" },
  { num: "03", resto: "+198 m · Piscina y terraza" },
];

export default function Planos() {
  const root = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

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

        const svg = el.querySelector<SVGSVGElement>(".js-diagram");
        if (!svg) return;

        const grid = svg.querySelector<SVGGElement>(".d-grid");
        const terrain = svg.querySelector<SVGElement>(".js-terrain");
        const vols = Array.from(svg.querySelectorAll<SVGElement>(".js-vol"));
        const cota = Array.from(svg.querySelectorAll<SVGElement>(".js-cota"));
        const horizon = svg.querySelector<SVGElement>(".js-horizon");
        const marks = Array.from(svg.querySelectorAll<SVGElement>(".js-mark")); // textos + guías

        // Elementos añadidos (se dibujan al final, tras las etiquetas)
        const plats = Array.from(svg.querySelectorAll<SVGElement>(".js-plat")); // canto de plataforma
        const drop = Array.from(svg.querySelectorAll<SVGElement>(".js-drop")); // cota total 42 m
        const span = Array.from(svg.querySelectorAll<SVGElement>(".js-span")); // cota parcial 12 m
        const sur = svg.querySelector<SVGElement>(".js-sur"); // marca de orientación
        const pinos = Array.from(svg.querySelectorAll<SVGElement>(".js-pino")); // silueta de pinos
        const eje = svg.querySelector<SVGElement>(".js-eje"); // eje de vista (discontinua)
        const marks2 = Array.from(svg.querySelectorAll<SVGElement>(".js-mark2")); // textos + punta de flecha nuevos

        const draw = [terrain, ...vols, ...cota, horizon].filter(
          Boolean
        ) as SVGElement[];
        // Trazos sólidos nuevos que se dibujan (NO el eje: es discontinuo → se
        // funde, para no pisar su patrón de guiones con el dasharray del dibujo).
        const draw2 = [...plats, ...drop, ...span, sur, ...pinos].filter(
          Boolean
        ) as SVGElement[];
        const fade2 = [eje, ...marks2].filter(Boolean) as SVGElement[];

        // Estados iniciales (sólo desde JS → sin JS el diagrama se ve completo)
        gsap.set(grid, { autoAlpha: 0 });
        gsap.set(draw, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.set(draw2, { strokeDasharray: 1, strokeDashoffset: 1 });
        // Los volúmenes se "afirman": entran algo translúcidos y ganan cuerpo al
        // completar su trazo (leve destello de opacidad progresiva).
        gsap.set(vols, { opacity: 0.4 });
        gsap.set(marks, { autoAlpha: 0 });
        gsap.set(fade2, { autoAlpha: 0 });

        // Estado final explícito para la salvaguarda "fallar mostrando"
        const finalize = () => {
          gsap.set(grid, { autoAlpha: 1 });
          gsap.set(draw, { strokeDashoffset: 0 });
          gsap.set(draw2, { strokeDashoffset: 0 });
          gsap.set(vols, { opacity: 1 });
          gsap.set(marks, { autoAlpha: 1 });
          gsap.set(fade2, { autoAlpha: 1 });
        };

        let played = false;
        let tl: gsap.core.Timeline;

        if (!mobile) {
          // Escritorio: pin + scrub (el dibujo avanza/retrocede con el scroll)
          tl = gsap.timeline({
            // Curvas suaves y simétricas → el dibujado se siente fluido en ambos
            // sentidos del scroll (acelera y frena en cada tramo, no mecánico).
            defaults: { ease: "power1.inOut" },
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "+=180%",
              // Se pinea un div INTERIOR (no la <section>), para que la sección
              // #planos siga siendo un destino de ancla válido (el pin-spacer
              // envuelve al interior, no a la sección).
              pin: pinRef.current,
              scrub: 1, // ligeramente más suave que 0.8
              onUpdate: (self) => {
                if (self.progress > 0) played = true;
              },
            },
          });
          tl.to(grid, { autoAlpha: 1, duration: 0.25 }, 0)
            .to(terrain, { strokeDashoffset: 0, duration: 1.1 }, 0.1)
            .to(vols, { strokeDashoffset: 0, duration: 0.5, stagger: 0.32 }, ">-0.1")
            // El cuerpo del volumen se afirma a la vez que se traza
            .to(vols, { opacity: 1, duration: 0.55, stagger: 0.32, ease: "power2.out" }, "<")
            .to(cota, { strokeDashoffset: 0, duration: 0.45, stagger: 0.06 }, ">-0.05")
            .to(horizon, { strokeDashoffset: 0, duration: 0.5 }, ">-0.05")
            // Cotas y etiquetas: pequeño desfase pulido tras su trazo
            .to(marks, { autoAlpha: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" }, ">-0.02")
            // --- Elementos añadidos (al final, tras las etiquetas) ---
            .to(plats, { strokeDashoffset: 0, duration: 0.4, stagger: 0.06 }, ">-0.02")
            .to(drop, { strokeDashoffset: 0, duration: 0.4, stagger: 0.05 }, ">-0.05")
            .to(span, { strokeDashoffset: 0, duration: 0.35, stagger: 0.05 }, ">-0.06")
            .to(sur, { strokeDashoffset: 0, duration: 0.35 }, ">-0.05")
            .to(pinos, { strokeDashoffset: 0, duration: 0.4, stagger: 0.09 }, ">-0.05")
            .to(eje, { autoAlpha: 1, duration: 0.4 }, ">-0.02")
            .to(marks2, { autoAlpha: 1, duration: 0.4, stagger: 0.06, ease: "power2.out" }, ">-0.08");
        } else {
          // Móvil: sin pin ni scrub. Se dibuja una vez al entrar, más corto.
          tl = gsap.timeline({
            defaults: { ease: "power1.out" },
            scrollTrigger: { trigger: el, start: "top 66%", once: true },
            onStart: () => {
              played = true;
            },
          });
          tl.to(grid, { autoAlpha: 1, duration: 0.33 }, 0)
            .to(terrain, { strokeDashoffset: 0, duration: 0.92 }, 0.07)
            .to(vols, { strokeDashoffset: 0, duration: 0.46, stagger: 0.18 }, ">-0.07")
            .to(vols, { opacity: 1, duration: 0.53, stagger: 0.18, ease: "power2.out" }, "<")
            .to(cota, { strokeDashoffset: 0, duration: 0.4, stagger: 0.05 }, ">-0.07")
            .to(horizon, { strokeDashoffset: 0, duration: 0.4 }, ">-0.07")
            .to(marks, { autoAlpha: 1, duration: 0.4, stagger: 0.04, ease: "power2.out" }, ">-0.07")
            // --- Elementos añadidos ---
            .to(plats, { strokeDashoffset: 0, duration: 0.4, stagger: 0.07 }, ">-0.03")
            .to(drop, { strokeDashoffset: 0, duration: 0.4, stagger: 0.05 }, ">-0.07")
            .to(span, { strokeDashoffset: 0, duration: 0.37, stagger: 0.05 }, ">-0.07")
            .to(sur, { strokeDashoffset: 0, duration: 0.33 }, ">-0.07")
            .to(pinos, { strokeDashoffset: 0, duration: 0.4, stagger: 0.08 }, ">-0.07")
            .to(eje, { autoAlpha: 1, duration: 0.4 }, ">-0.03")
            .to(marks2, { autoAlpha: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }, ">-0.13");
        }

        // Salvaguarda: umbral alto + margen amplio para no revelar antes de que
        // el pin arranque (la sección es visible mucho antes de "top top").
        const disarm = armFailShowing(el, () => played, finalize, {
          // Móvil sube a 3200 como el resto (su disparo pasó a "top 66%").
          // Escritorio se queda en 2400: su trigger es el pin en "top top",
          // que no se ha tocado, así que su margen ya estaba ajustado.
          graceMs: mobile ? 3200 : 2400,
          threshold: mobile ? 0.01 : 0.15,
        });

        return () => {
          disarm();
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id="planos"
      ref={root}
      className="planos"
      data-tono="oscuro"
      aria-labelledby="planos-title"
    >
      <div
        ref={pinRef}
        className="section-y lg:flex lg:min-h-[100svh] lg:flex-col lg:justify-center"
      >
        <div className="shell">
        <div className="grid-12 gap-y-10 lg:gap-y-0 lg:items-center">
          {/* Texto (cols 1–5) */}
          <div className="col-span-12 lg:col-start-1 lg:col-span-5">
            <p className="label planos-eyebrow">El proyecto en sección</p>
            <h2
              id="planos-title"
              className="mt-4 lg:mt-5 font-display text-h2 planos-title text-balance"
            >
              Tres plataformas sobre la ladera.
            </h2>
            <p className="mt-6 lg:mt-8 max-w-[42ch] text-lede planos-lede">
              La parcela desciende cuarenta y dos metros hacia el sur. En lugar
              de nivelarla, la casa la acompaña: tres plataformas escalonadas
              —doce metros entre la primera y la última— que se apoyan en la
              pendiente natural y orientan cada estancia hacia el valle y el
              Mediterráneo.
            </p>
            <ul className="planos-niveles mt-8 lg:mt-10">
              {NIVELES.map((n) => (
                <li key={n.num} className="planos-nivel label">
                  Nivel <span className="acento-claro">{n.num}</span> ·{" "}
                  {n.resto}
                </li>
              ))}
            </ul>
          </div>

          {/* Diagrama SVG (cols 7–12) */}
          <div className="col-span-12 lg:col-start-7 lg:col-span-6">
            <svg
              className="js-diagram planos-diagram"
              viewBox="0 0 600 400"
              role="img"
              aria-label="Sección del terreno: la parcela desciende cuarenta y dos metros en total, del punto más alto al mar. Sobre ella se apoyan tres plataformas escalonadas a las cotas +210, +204 y +198 metros —doce metros entre la primera y la última—, con un volumen en cada una y el horizonte del Mediterráneo al fondo."
            >
              {/* Retícula técnica de fondo */}
              <g className="d-grid" aria-hidden="true">
                {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((y) => (
                  <line key={y} x1="30" y1={y} x2="590" y2={y} />
                ))}
              </g>

              {/* Terreno: perfil COMPLETO de la parcela, de su cabecera (arriba
                  a la izquierda, por encima de la primera plataforma) hasta el
                  mar. Su recorrido vertical total es el que mide la cota de
                  42 m; las plataformas ocupan sólo el tramo central. */}
              <path
                className="d-stroke js-terrain"
                pathLength={1}
                d="M40 22 L95 90 L200 90 L200 140 L380 140 L380 190 L470 190 L590 372"
              />

              {/* Volúmenes apoyados en cada plataforma (02 el más largo) */}
              <rect className="d-stroke js-vol" pathLength={1} x="112" y="52" width="76" height="38" />
              <rect className="d-stroke js-vol" pathLength={1} x="214" y="97" width="150" height="43" />
              <rect className="d-stroke js-vol" pathLength={1} x="392" y="157" width="64" height="33" />

              {/* Línea de cotas y sus marcas */}
              <line className="d-stroke js-cota" pathLength={1} x1="72" y1="78" x2="72" y2="202" />
              <line className="d-stroke js-cota" pathLength={1} x1="64" y1="90" x2="80" y2="90" />
              <line className="d-stroke js-cota" pathLength={1} x1="64" y1="140" x2="80" y2="140" />
              <line className="d-stroke js-cota" pathLength={1} x1="64" y1="190" x2="80" y2="190" />

              {/* Horizonte del mar (cota claramente inferior) */}
              <line className="d-stroke js-horizon" pathLength={1} x1="440" y1="372" x2="596" y2="372" />

              {/* Guías + etiquetas (aparecen al final con un fade) */}
              <line className="d-guide js-mark" x1="150" y1="52" x2="150" y2="41" />
              <line className="d-guide js-mark" x1="289" y1="97" x2="289" y2="86" />
              <line className="d-guide js-mark" x1="424" y1="157" x2="424" y2="146" />

              <text className="label tcota js-mark" x="60" y="90" textAnchor="end" dominantBaseline="middle">+210</text>
              <text className="label tcota js-mark" x="60" y="140" textAnchor="end" dominantBaseline="middle">+204</text>
              <text className="label tcota js-mark" x="60" y="190" textAnchor="end" dominantBaseline="middle">+198</text>

              <text className="label tlabel js-mark" x="150" y="35" textAnchor="middle">01 Acceso</text>
              <text className="label tlabel js-mark" x="289" y="80" textAnchor="middle">02 Día</text>
              <text className="label tlabel js-mark" x="424" y="140" textAnchor="middle">03 Piscina</text>

              <text className="label tlabel js-mark" x="516" y="392" textAnchor="middle">Mediterráneo</text>

              {/* ---- Elementos añadidos (se dibujan al final) ---- */}

              {/* Doble línea en el canto superior de cada plataforma (cuerpo) */}
              <line className="d-stroke js-plat" pathLength={1} x1="95" y1="93" x2="200" y2="93" />
              <line className="d-stroke js-plat" pathLength={1} x1="200" y1="143" x2="380" y2="143" />
              <line className="d-stroke js-plat" pathLength={1} x1="380" y1="193" x2="470" y2="193" />

              {/* Cota TOTAL del desnivel: mide todo el terreno dibujado, de su
                  punto más alto (y=22) al mar (y=372). Los extremos coinciden
                  exactamente con los del perfil, no con las plataformas. */}
              <line className="d-stroke js-drop" pathLength={1} x1="26" y1="22" x2="26" y2="372" />
              <line className="d-stroke js-drop" pathLength={1} x1="20" y1="22" x2="32" y2="22" />
              <line className="d-stroke js-drop" pathLength={1} x1="20" y1="372" x2="32" y2="372" />
              <text
                className="label tcota js-mark2"
                x="13"
                y="197"
                textAnchor="middle"
                transform="rotate(-90 13 197)"
              >
                42 m de desnivel
              </text>

              {/* Cota PARCIAL, deliberadamente menor y con el rótulo en
                  horizontal para que no se confunda con la anterior: sólo el
                  tramo que ocupa la casa, de +210 (y=90) a +198 (y=190). */}
              <line className="d-stroke js-span" pathLength={1} x1="150" y1="90" x2="150" y2="190" />
              <line className="d-stroke js-span" pathLength={1} x1="144" y1="90" x2="156" y2="90" />
              <line className="d-stroke js-span" pathLength={1} x1="144" y1="190" x2="156" y2="190" />
              {/* Desplazado a la derecha del eje del corchete: centrado en x=150
                  el rótulo rozaba la cota «+198» al agrandarse en móvil. */}
              <text className="label tcota2 js-mark2" x="172" y="214" textAnchor="middle">
                12 m entre plataformas
              </text>

              {/* Marca de orientación (pendiente hacia el sur = derecha-abajo) */}
              <path
                className="d-stroke js-sur"
                pathLength={1}
                d="M500 48 L542 60 M542 60 L534 55 M542 60 L536 63"
              />
              <text className="label tcota js-mark2" x="510" y="42" textAnchor="middle">Sur</text>

              {/* Silueta de pinos apoyados EN la recta de la ladera (su base
                  sigue la nueva pendiente 470,190 → 590,372) */}
              <path className="d-stroke js-pino" pathLength={1} d="M476 199 l0 -11 m-8 0 q8 -12 16 0" />
              <path className="d-stroke js-pino" pathLength={1} d="M500 235 l0 -12 m-9 0 q9 -13 18 0" />
              <path className="d-stroke js-pino" pathLength={1} d="M526 275 l0 -10 m-7.5 0 q7.5 -11 15 0" />

              {/* Eje de vista: discontinua desde el nivel de día hacia el mar,
                  por encima de la plataforma de piscina (sin cruzar etiquetas) */}
              <line className="d-dash js-eje" x1="364" y1="110" x2="588" y2="152" />
              <path className="d-stroke js-mark2" d="M588 152 L580 147 M588 152 L582 156" />
              <text className="label tcota js-mark2" x="458" y="102" textAnchor="middle">Eje de vista</text>
            </svg>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
