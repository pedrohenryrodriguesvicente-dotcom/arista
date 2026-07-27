"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useAnimEffect } from "@/lib/use-anim-effect";
import { armFailShowing } from "@/lib/anim";

type Errores = Partial<Record<"nombre" | "email" | "mensaje", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TIPOS = ["Presencial", "Videollamada"] as const;
type Tipo = (typeof TIPOS)[number];

export default function Contacto() {
  const root = useRef<HTMLElement>(null);
  const [enviado, setEnviado] = useState(false);
  const [errores, setErrores] = useState<Errores>({});
  const nombreRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const mensajeRef = useRef<HTMLTextAreaElement>(null);
  const [tipo, setTipo] = useState<Tipo>("Presencial");
  const tipoRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Navegación con flechas del control segmentado (patrón radiogroup)
  const onTipoKey = (e: React.KeyboardEvent<HTMLButtonElement>, idx: number) => {
    let next = idx;
    if (e.key === "ArrowRight" || e.key === "ArrowDown")
      next = (idx + 1) % TIPOS.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp")
      next = (idx - 1 + TIPOS.length) % TIPOS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TIPOS.length - 1;
    else return;
    e.preventDefault();
    setTipo(TIPOS[next]);
    tipoRefs.current[next]?.focus();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Formulario decorativo: preventDefault evita cualquier recarga o envío.
    e.preventDefault();
    const next: Errores = {};
    const nombre = nombreRef.current?.value.trim() ?? "";
    const email = emailRef.current?.value.trim() ?? "";
    const mensaje = mensajeRef.current?.value.trim() ?? "";

    if (!nombre) next.nombre = "Indíquenos su nombre.";
    if (!email) next.email = "Indíquenos un email.";
    else if (!EMAIL_RE.test(email)) next.email = "El email no parece válido.";
    if (!mensaje) next.mensaje = "Escríbanos un breve mensaje.";

    setErrores(next);

    if (Object.keys(next).length > 0) {
      // Foco al primer campo inválido
      if (next.nombre) nombreRef.current?.focus();
      else if (next.email) emailRef.current?.focus();
      else if (next.mensaje) mensajeRef.current?.focus();
      return;
    }
    setEnviado(true);
  };

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

        const reveal = Array.from(el.querySelectorAll<HTMLElement>(".js-reveal"));
        gsap.set(reveal, { autoAlpha: 0, y: 18 });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        });
        tl.to(reveal, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 });

        const finalize = () => gsap.set(reveal, { autoAlpha: 1, y: 0 });
        const disarm = armFailShowing(el, () => tl.progress() > 0, finalize);

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
      id="contacto"
      ref={root}
      className="section-y"
      aria-labelledby="contacto-title"
    >
      <div className="shell">
        <div className="grid-12 gap-y-12 lg:gap-y-0">
          {/* Izquierda: texto + datos (cols 1–5) */}
          <div className="col-span-12 lg:col-start-1 lg:col-span-5">
            <p className="js-reveal label text-gris">Contacto</p>
            <h2
              id="contacto-title"
              className="js-reveal mt-4 lg:mt-5 font-display text-h2 text-grafito text-balance"
            >
              Solicite una visita privada.
            </h2>
            <p className="js-reveal mt-6 lg:mt-8 max-w-[46ch] text-lede text-gris">
              Concertamos visitas exclusivas a la residencia, con acompañamiento
              personalizado. Déjenos sus datos y le responderemos en menos de
              veinticuatro horas.
            </p>
            <ul className="js-reveal contacto-datos mt-8 lg:mt-10">
              <li className="contacto-dato label">Teléfono · +34 600 000 000</li>
              <li className="contacto-dato label">Email · info@arista.es</li>
              <li className="contacto-dato label">
                Ubicación · Benahavís, Marbella
              </li>
            </ul>
          </div>

          {/* Derecha: formulario (cols 7–12) */}
          <div className="col-span-12 lg:col-start-7 lg:col-span-6">
            {enviado ? (
              <div className="fade-swap" role="status" aria-live="polite">
                <p className="label text-gris">Solicitud recibida</p>
                <p className="form-gracias mt-5">
                  Gracias. Nos pondremos en contacto en menos de 24 horas.
                </p>
              </div>
            ) : (
              <form
                className="js-reveal"
                onSubmit={onSubmit}
                noValidate
                aria-label="Solicitud de visita"
              >
                <div className="form-grid">
                  <div
                    className="field field-full"
                    data-error={!!errores.nombre}
                  >
                    <label className="field-label label" htmlFor="c-nombre">
                      Nombre y apellidos{" "}
                      <span className="field-req" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      ref={nombreRef}
                      id="c-nombre"
                      name="nombre"
                      type="text"
                      autoComplete="name"
                      required
                      aria-required="true"
                      aria-invalid={!!errores.nombre}
                      aria-describedby={errores.nombre ? "c-nombre-err" : undefined}
                      className="field-control"
                    />
                    {errores.nombre && (
                      <p
                        id="c-nombre-err"
                        className="field-error label"
                        role="alert"
                      >
                        {errores.nombre}
                      </p>
                    )}
                  </div>

                  <div className="field" data-error={!!errores.email}>
                    <label className="field-label label" htmlFor="c-email">
                      Email{" "}
                      <span className="field-req" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <input
                      ref={emailRef}
                      id="c-email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      aria-required="true"
                      aria-invalid={!!errores.email}
                      aria-describedby={errores.email ? "c-email-err" : undefined}
                      className="field-control"
                    />
                    {errores.email && (
                      <p
                        id="c-email-err"
                        className="field-error label"
                        role="alert"
                      >
                        {errores.email}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label className="field-label label" htmlFor="c-tel">
                      Teléfono
                    </label>
                    <input
                      id="c-tel"
                      name="telefono"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      className="field-control"
                    />
                  </div>

                  <div className="field field-full">
                    <span className="field-label label" id="c-tipo-label">
                      Tipo de visita
                    </span>
                    <div
                      className="segmented"
                      role="radiogroup"
                      aria-labelledby="c-tipo-label"
                    >
                      {TIPOS.map((t, i) => (
                        <button
                          key={t}
                          type="button"
                          role="radio"
                          aria-checked={tipo === t}
                          tabIndex={tipo === t ? 0 : -1}
                          ref={(el) => {
                            tipoRefs.current[i] = el;
                          }}
                          onClick={() => setTipo(t)}
                          onKeyDown={(e) => onTipoKey(e, i)}
                          className="seg-option"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className="field field-full"
                    data-error={!!errores.mensaje}
                  >
                    <label className="field-label label" htmlFor="c-mensaje">
                      Mensaje{" "}
                      <span className="field-req" aria-hidden="true">
                        *
                      </span>
                    </label>
                    <textarea
                      ref={mensajeRef}
                      id="c-mensaje"
                      name="mensaje"
                      rows={4}
                      required
                      aria-required="true"
                      aria-invalid={!!errores.mensaje}
                      aria-describedby={
                        errores.mensaje ? "c-mensaje-err" : undefined
                      }
                      className="field-control"
                    />
                    {errores.mensaje && (
                      <p
                        id="c-mensaje-err"
                        className="field-error label"
                        role="alert"
                      >
                        {errores.mensaje}
                      </p>
                    )}
                  </div>

                  <div className="field field-full">
                    <button type="submit" className="pill form-submit mt-2">
                      Agendar visita privada
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
