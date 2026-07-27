"use client";

import { useEffect, useRef } from "react";
import { afterFonts } from "@/lib/anim";

const INDICE = [
  { label: "El proyecto", href: "#proyecto" },
  { label: "Planos", href: "#planos" },
  { label: "Galería", href: "#galeria" },
  { label: "Entorno", href: "#entorno" },
  { label: "Contacto", href: "#contacto" },
];

const FIRMA = "Vertex Web Design";

export default function Footer() {
  const vertexRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Scroll suave a las anclas (mismo criterio que el header: descuenta el header)
  const onNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const headerH =
      document.querySelector(".site-header")?.getBoundingClientRect().height ??
      56;
    const top =
      window.scrollY + target.getBoundingClientRect().top - (headerH + 16);
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", href);
  };

  // Firma Vertex — efecto Vaporize (partículas que se ensamblan en el texto)
  useEffect(() => {
    const wrap = vertexRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = canvas.getContext("2d");

    // Sin canvas 2D o con reduced-motion → el texto HTML queda visible (fade CSS)
    if (!ctx || reduce) return;

    let raf = 0;
    let started = false;
    let disposed = false;
    let particles: {
      sx: number;
      sy: number;
      tx: number;
      ty: number;
      d: number; // desfase de arranque [0..~0.4]
    }[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const buildAndRun = () => {
      if (disposed) return;
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      // Muestreo del texto en un lienzo fuera de pantalla
      const off = document.createElement("canvas");
      off.width = canvas.width;
      off.height = canvas.height;
      const octx = off.getContext("2d");
      if (!octx) {
        // Degradación elegante: se muestra el texto HTML nítido
        return;
      }
      const fontPx = Math.min(h * 0.62, w * 0.11) * dpr;
      octx.fillStyle = "#000";
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.font = `400 ${fontPx}px "Instrument Serif", Georgia, serif`;
      octx.fillText(FIRMA, off.width / 2, off.height / 2);

      const data = octx.getImageData(0, 0, off.width, off.height).data;
      // Menos partículas en pantallas pequeñas (rendimiento)
      const gap = Math.max(3, Math.round((w < 640 ? 6 : 4) * dpr));
      particles = [];
      for (let y = 0; y < off.height; y += gap) {
        for (let x = 0; x < off.width; x += gap) {
          const alpha = data[(y * off.width + x) * 4 + 3];
          if (alpha > 130) {
            // Desfase con una onda suave de izquierda a derecha (el texto se
            // "escribe") más una pizca de aleatoriedad → arranque orgánico.
            const wave = 0.3 * (x / off.width);
            particles.push({
              sx: Math.random() * canvas.width,
              sy: Math.random() * canvas.height,
              tx: x,
              ty: y,
              d: wave + Math.random() * 0.12,
            });
          }
        }
      }

      // Sin puntos muestreados (fuente aún no lista, etc.) → texto HTML nítido
      if (particles.length === 0) return;

      wrap.dataset.particles = "true";
      const size = Math.max(1, Math.round(dpr));
      const dur = 2000;
      const t0 = performance.now();

      // Salida suave (quinta) → convergencia fluida con aterrizaje muy delicado
      const easeOutQuint = (p: number) => 1 - Math.pow(1 - p, 5);

      const frame = (now: number) => {
        if (disposed) return;
        const elapsed = now - t0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Partículas en tono claro (hueso) para leerse con fuerza sobre el
        // fondo grafito del footer.
        ctx.fillStyle = "#f5f3ef";
        let done = true;
        for (const p of particles) {
          const local = (elapsed / dur - p.d) / (1 - p.d);
          const prog = local <= 0 ? 0 : local >= 1 ? 1 : easeOutQuint(local);
          if (prog < 1) done = false;
          const x = p.sx + (p.tx - p.sx) * prog;
          const y = p.sy + (p.ty - p.sy) * prog;
          // Aparecen tenues y se afirman al converger (curva suave)
          ctx.globalAlpha = 0.12 + 0.88 * (prog * prog);
          ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;
        if (done) {
          // Ensamblado completo → CSS funde el texto HTML nítido sobre el canvas
          wrap.dataset.done = "true";
          return;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (started || disposed) return;
      started = true;
      afterFonts(buildAndRun);
    };

    // Arranca cuando la firma entra en pantalla
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              start();
              io?.disconnect();
            }
          }
        },
        { threshold: 0.4 }
      );
      io.observe(wrap);
    } else {
      start();
    }

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
    };
  }, []);

  return (
    <footer
      id="pie"
      className="footer"
      data-tono="oscuro"
      aria-label="Pie de página"
    >
      <div className="shell section-y">
        {/* Wordmark */}
        <a
          href="#inicio"
          onClick={(e) => onNavClick(e, "#inicio")}
          className="footer-wordmark inline-block"
          aria-label="ARISTA — Ir al inicio"
        >
          ARISTA
        </a>

        {/* Columnas: navegación · contacto · cierre */}
        <div className="grid-12 gap-y-10 mt-12 lg:mt-16">
          <nav
            aria-label="Índice del sitio"
            className="col-span-6 lg:col-span-3"
          >
            <p className="footer-col-title label">Navegación</p>
            <ul className="footer-index flex flex-col gap-3">
              {INDICE.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => onNavClick(e, item.href)}
                    className="link-underline label"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-6 lg:col-span-3">
            <p className="footer-col-title label">Contacto</p>
            <ul className="footer-contacto flex flex-col gap-3">
              <li className="label">+34 600 000 000</li>
              <li className="label">info@arista.es</li>
              <li className="label">Benahavís · Marbella</li>
            </ul>
          </div>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <p className="footer-cierre">
              Una casa concebida como una sola línea sobre la ladera, entre la
              sierra y el Mediterráneo.
            </p>
            <ul className="footer-legal-links label">
              <li>
                <a href="#pie" onClick={(e) => e.preventDefault()}>
                  Aviso legal
                </a>
              </li>
              <li>
                <a href="#pie" onClick={(e) => e.preventDefault()}>
                  Política de privacidad
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-sep mt-14 lg:mt-20" />

        {/* Firma Vertex — Vaporize */}
        <div
          ref={vertexRef}
          className="vertex mt-12 lg:mt-16"
          aria-label="Vertex Web Design"
        >
          <canvas ref={canvasRef} className="vertex-canvas" aria-hidden="true" />
          <p className="vertex-word">{FIRMA}</p>
        </div>

        <p className="footer-legal label mt-8">
          Diseño y desarrollo · Vertex Web Design · 2026
        </p>
      </div>
    </footer>
  );
}
