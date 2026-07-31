"use client";

import { useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import imgMar from "@/public/img/entorno-mar.jpg";
import { gsap } from "@/lib/gsap";
import { useAnimEffect } from "@/lib/use-anim-effect";
import { armFailShowing } from "@/lib/anim";
import { useVisorSuelto } from "@/lib/use-visor";

// Mismo visor que la Galería, cargado bajo demanda (no pesa en el arranque).
const Lightbox = dynamic(() => import("@/components/lightbox"), { ssr: false });

const PIE_MAR = "El Mediterráneo · Al sur";
const ALT_MAR =
  "El Mediterráneo al frente de la residencia: la costa y el mar abierto vistos desde la ladera, con el horizonte al sur.";

// Una sola foto → el visor se abre sin flechas ni indicador de posición.
const FOTO_MAR = { src: imgMar, cap: PIE_MAR, alt: ALT_MAR };

const TIEMPOS = [
  { n: 10, label: "min · San Pedro de Alcántara" },
  { n: 15, label: "min · Puerto Banús" },
  { n: 25, label: "min · Marbella centro" },
  { n: 50, label: "min · Aeropuerto de Málaga" },
];

export default function Entorno() {
  const root = useRef<HTMLElement>(null);
  const visor = useVisorSuelto();

  useAnimEffect(() => {
    const el = root.current;
    if (!el) return;

    const nums = Array.from(el.querySelectorAll<HTMLElement>(".js-num"));
    const setNumsFinal = () =>
      nums.forEach((n) => {
        n.textContent = n.dataset.target ?? n.textContent;
      });

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        mobile: "(max-width: 1023.98px)",
        reduced: "(prefers-reduced-motion: reduce)",
      },
      (ctx: gsap.Context) => {
        const cond = (ctx.conditions ?? {}) as Record<string, boolean>;
        // Reduced-motion: sin animación; las cifras quedan en su valor final
        // (ya vienen así en el HTML) y todo se ve. No ocultamos nada.
        if (cond.reduced) {
          setNumsFinal();
          return;
        }
        const mobile = !!cond.mobile;

        const head = Array.from(el.querySelectorAll<HTMLElement>(".js-head"));
        const figures = Array.from(el.querySelectorAll<HTMLElement>(".js-fig"));
        const vfiletes = Array.from(el.querySelectorAll<HTMLElement>(".js-vfilete"));
        const tiempos = Array.from(el.querySelectorAll<HTMLElement>(".js-tiempo"));

        const timelines: gsap.core.Timeline[] = [];
        const figTimelines: gsap.core.Timeline[] = [];
        const tweens: gsap.core.Tween[] = [];

        // Cabecera
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

        // Fotografía: reveal de máscara + parallax suave (sólo escritorio)
        figures.forEach((fig) => {
          const frame = fig.querySelector<HTMLElement>(".js-frame");
          const parallax = fig.querySelector<HTMLElement>(".js-parallax");
          const img = fig.querySelector<HTMLElement>(".js-img");
          const cap = fig.querySelector<HTMLElement>(".js-cap");

          gsap.set(frame, { clipPath: "inset(100% 0% 0% 0%)" });
          gsap.set(img, { scale: 1.05 });
          gsap.set(cap, { autoAlpha: 0, y: 12 });

          const tl = gsap.timeline({
            defaults: { ease: "power3.out" },
            // La fotografía va DESPUÉS de la cabecera dentro de la sección, así
            // que su disparo conserva los 8 puntos de retraso que ya tenía
            // sobre ella (66 → 58) y mantiene el orden de la coreografía.
            scrollTrigger: { trigger: el, start: "top 58%", once: true },
          });
          tl.to(frame, {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: mobile ? 0.79 : 1.08,
          })
            .to(img, { scale: 1, duration: mobile ? 0.99 : 1.32 }, "<")
            .to(cap, { autoAlpha: 1, y: 0, duration: 0.53 }, ">-0.42");
          timelines.push(tl);
          figTimelines.push(tl);

          if (!mobile && parallax) {
            tweens.push(
              gsap.fromTo(
                parallax,
                { yPercent: -4 },
                {
                  yPercent: 4,
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

        // Franja de tiempos: filetes verticales se dibujan + contadores 0→valor
        gsap.set(vfiletes, { scaleY: 0 });
        gsap.set(tiempos, { autoAlpha: 0, y: 14 });
        nums.forEach((n) => (n.textContent = "0"));

        const counters: gsap.core.Tween[] = [];
        const tlTiempos = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: el.querySelector(".js-tiempos") ?? el,
            start: "top 70%",
            once: true,
            onEnter: () => {
              nums.forEach((n) => {
                const target = Number(n.dataset.target ?? "0");
                const obj = { v: 0 };
                counters.push(
                  gsap.to(obj, {
                    v: target,
                    duration: 1.1,
                    ease: "power2.out",
                    onUpdate: () => {
                      n.textContent = String(Math.round(obj.v));
                    },
                  })
                );
              });
            },
          },
        });
        tlTiempos
          .to(vfiletes, {
            scaleY: 1,
            duration: mobile ? 0.53 : 0.66,
            stagger: 0.07,
            ease: "power2.inOut",
          })
          .to(
            tiempos,
            { autoAlpha: 1, y: 0, duration: 0.59, stagger: 0.08 },
            "<0.07"
          );
        timelines.push(tlTiempos);

        // Salvaguarda "fallar mostrando"
        const finalize = () => {
          gsap.set(head, { autoAlpha: 1, y: 0 });
          figures.forEach((fig) => {
            gsap.set(fig.querySelector(".js-frame"), {
              clipPath: "inset(0% 0% 0% 0%)",
            });
            gsap.set(fig.querySelector(".js-img"), { scale: 1 });
            gsap.set(fig.querySelector(".js-cap"), { autoAlpha: 1, y: 0 });
          });
          gsap.set(vfiletes, { scaleY: 1 });
          gsap.set(tiempos, { autoAlpha: 1, y: 0 });
          setNumsFinal();
        };
        // isPlayed mira figura + tiempos (no sólo la cabecera)
        const disarm = armFailShowing(
          el,
          () =>
            figTimelines.some((t) => t.progress() > 0) ||
            tlTiempos.progress() > 0,
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
          counters.forEach((t) => t.kill());
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id="entorno"
      ref={root}
      className="section-y"
      aria-labelledby="entorno-title"
    >
      <div className="shell">
        {/* Cabecera (cols 1–9) */}
        <div className="grid-12">
          <div className="col-span-12 lg:col-start-1 lg:col-span-9">
            <p className="js-head label text-gris">El entorno</p>
            <h2
              id="entorno-title"
              className="js-head mt-4 lg:mt-5 font-display text-h2 text-grafito text-balance"
            >
              Entre la sierra y el Mediterráneo.
            </h2>
            <p className="js-head mt-6 lg:mt-8 max-w-[52ch] text-lede text-gris">
              Benahavís combina lo mejor de la Costa del Sol: la montaña a la
              espalda, el mar al frente, y Puerto Banús y Marbella a un corto
              trayecto en coche. Naturaleza y ciudad a la misma distancia.
            </p>
          </div>
        </div>

        {/* Una sola fotografía horizontal, a lo ancho de la retícula */}
        <div className="mt-12 lg:mt-16">
          <figure data-axis="h" className="js-fig gal-figure">
            <button
              type="button"
              className="js-frame media-frame gal-boton"
              style={{ aspectRatio: "16 / 9" }}
              aria-label={`Ampliar: ${ALT_MAR}`}
              onClick={(e) => visor.abrir(FOTO_MAR, e.currentTarget)}
            >
              <div className="js-parallax parallax-layer">
                <Image
                  src={imgMar}
                  alt=""
                  fill
                  quality={88}
                  sizes="(min-width: 1440px) 1344px, (min-width: 768px) calc(100vw - 96px), calc(100vw - 40px)"
                  placeholder="blur"
                  className="js-img object-cover"
                  style={{ objectPosition: "50% 45%" }}
                />
              </div>
            </button>
            <figcaption className="js-cap entorno-cap label text-gris">
              {PIE_MAR}
            </figcaption>
          </figure>
        </div>

        {/* Franja de tiempos con contadores */}
        <div className="js-tiempos entorno-tiempos mt-14 lg:mt-20">
          {TIEMPOS.map((t, i) => (
            <div key={t.label} className="js-tiempo entorno-tiempo">
              {i > 0 && (
                <span className="js-vfilete entorno-vfilete" aria-hidden="true" />
              )}
              <span
                className="js-num entorno-num"
                data-target={String(t.n)}
              >
                {t.n}
              </span>
              <span className="entorno-tiempo-label label">{t.label}</span>
            </div>
          ))}
        </div>
      </div>

      {visor.foto && (
        <Lightbox
          fotos={[visor.foto]}
          indice={0}
          onIr={() => {}}
          onCerrar={visor.cerrar}
        />
      )}
    </section>
  );
}
