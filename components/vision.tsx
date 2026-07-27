"use client";

import { useRef } from "react";
import Image from "next/image";
// Importación estática: Next genera en build el blurDataURL del placeholder
// (y conoce las dimensiones reales del archivo).
import imgVision from "@/public/img/vision.jpg";
import { gsap } from "@/lib/gsap";
import { useAnimEffect } from "@/lib/use-anim-effect";
import { armFailShowing } from "@/lib/anim";

const DATOS = [
  "Orientación · Sur",
  "Superficie · 720 m²",
  "Parcela · 2.400 m²",
  "Entrega · Inmediata",
];

export default function Vision() {
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

        const title = el.querySelector<HTMLElement>(".js-title");
        const copy = Array.from(el.querySelectorAll<HTMLElement>(".js-copy"));
        const panel = el.querySelector<HTMLElement>(".js-panel");
        const line = el.querySelector<HTMLElement>(".js-line");
        const frame = el.querySelector<HTMLElement>(".js-frame");
        const parallax = el.querySelector<HTMLElement>(".js-parallax");
        const img = el.querySelector<HTMLElement>(".js-img");

        // --- Estados iniciales ---
        gsap.set(title, { yPercent: 110 });
        gsap.set(copy, { autoAlpha: 0, y: 20 });
        gsap.set(panel, { autoAlpha: 0, y: 30 });
        gsap.set(line, { scaleX: 0 });
        gsap.set(frame, { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(img, { scale: 1.04 });

        const timelines: gsap.core.Timeline[] = [];

        // A) Texto (izquierda + derecha)
        const tlText = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });
        tlText
          .to(title, { yPercent: 0, duration: mobile ? 0.43 : 0.58 })
          .to(
            copy,
            { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.09 },
            mobile ? ">-0.07" : "<0.15"
          );
        timelines.push(tlText);

        // B) Fotografía a sangre: la línea se dibuja, la máscara revela y el
        //    panel de datos se posa encima un poco después (la capa entra la
        //    última, para que se lea como algo apoyado sobre la imagen).
        const tlMedia = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: frame, start: "top 94%", once: true },
        });
        tlMedia
          .to(line, {
            scaleX: 1,
            duration: mobile ? 0.36 : 0.58,
            ease: "power2.inOut",
          })
          .to(
            frame,
            { clipPath: "inset(0% 0% 0% 0%)", duration: mobile ? 0.58 : 0.72 },
            mobile ? ">-0.07" : ">-0.12"
          )
          .to(img, { scale: 1, duration: mobile ? 0.65 : 0.86 }, "<")
          .to(
            panel,
            { autoAlpha: 1, y: 0, duration: mobile ? 0.5 : 0.62 },
            mobile ? ">-0.3" : ">-0.42"
          );
        timelines.push(tlMedia);

        // C) Parallax suave (sólo escritorio): la imagen se desplaza más
        //    despacio que el contenido, dentro del sobre-escaneo del 10%.
        let twParallax: gsap.core.Tween | null = null;
        if (!mobile && parallax) {
          twParallax = gsap.fromTo(
            parallax,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: frame,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }

        // Salvaguarda "fallar mostrando": si el reveal no arranca al entrar en
        // pantalla, se fuerza el estado FINAL explícito (no depende de que las
        // timelines existan → cubre también el fallo de creación de triggers).
        const finalize = () => {
          gsap.set(title, { yPercent: 0 });
          gsap.set([...copy, panel], { autoAlpha: 1, y: 0 });
          gsap.set(line, { scaleX: 1 });
          gsap.set(frame, { clipPath: "inset(0% 0% 0% 0%)" });
          gsap.set(img, { scale: 1 });
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
          twParallax?.scrollTrigger?.kill();
          twParallax?.kill();
        };
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      id="proyecto"
      ref={root}
      className="section-y"
      aria-labelledby="vision-title"
    >
      <div className="shell">
        <div className="grid-12 gap-y-8 lg:gap-y-0">
          {/* Izquierda: titular (cols 1–5) */}
          <div className="col-span-12 lg:col-start-1 lg:col-span-5">
            <h2
              id="vision-title"
              className="reveal-line font-display text-h2 text-grafito text-balance"
            >
              <span className="reveal-inner js-title">
                Una residencia concebida como una sola línea sobre la ladera.
              </span>
            </h2>
          </div>

          {/* Derecha: párrafos + datos (cols 7–11) */}
          <div className="col-span-12 lg:col-start-7 lg:col-span-5">
            <p className="js-copy text-lede text-gris">
              ARISTA nace de una decisión: no interrumpir el paisaje, sino
              continuarlo. Cada volumen se apoya en la pendiente natural del
              terreno, y cada estancia se orienta al sur para que la luz
              mediterránea y el horizonte formen parte de la arquitectura, no de
              su decoración.
            </p>
            <p className="js-copy mt-5 text-lede text-gris">
              La parcela desciende hacia el sur en tres plataformas. Sobre ellas
              se apoya un único volumen alargado, protegido del poniente por
              celosías de madera y abierto por completo al valle y al
              Mediterráneo.
            </p>
          </div>
        </div>

        {/* Filete contenido en la retícula: respeta el grid antes de que la
            imagen lo rompa a sangre */}
        <div className="line-wrap mt-10 lg:mt-14">
          <span className="js-line hairline" />
        </div>
      </div>

      {/* Fotografía a sangre (100vw), con máscara + parallax, y el panel de
          datos superpuesto sobre su esquina superior derecha (escritorio).
          En móvil el panel cae debajo, a ancho de retícula, sin superposición. */}
      <div className="vision-media-wrap mt-6 lg:mt-16">
        <div className="js-frame bleed-media vision-media full-bleed">
          <div className="js-parallax parallax-layer">
            <Image
              src={imgVision}
              alt="Terraza de la residencia con pérgola de madera y grandes cristaleras abiertas al paisaje: vegetación, montañas y el horizonte al fondo."
              fill
              quality={88}
              sizes="100vw"
              placeholder="blur"
              className="js-img object-cover object-center"
            />
          </div>
        </div>

        <div className="vision-panel-layer shell">
          <div className="grid-12">
            <div className="col-span-12 lg:col-start-9 lg:col-span-4">
              <aside className="js-panel vision-panel" aria-label="Datos del proyecto">
                <ul className="vision-datos">
                  {DATOS.map((d) => (
                    <li key={d} className="vision-dato label">
                      {d}
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
