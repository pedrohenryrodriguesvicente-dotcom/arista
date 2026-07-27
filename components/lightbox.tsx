"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image, { type StaticImageData } from "next/image";
import { bloquearScroll, liberarScroll } from "@/lib/scroll-lock";

export type FotoVisor = {
  src: StaticImageData;
  cap: string;
  alt: string;
};

type Props = {
  fotos: FotoVisor[];
  indice: number;
  onIr: (i: number) => void;
  onCerrar: () => void;
};

const DURACION_CIERRE = 300; // debe cubrir la transición de opacidad del CSS
const UMBRAL_ARRASTRE = 90; // px hacia abajo para cerrar
const UMBRAL_DESLIZ = 50; // px en horizontal para cambiar de foto

export default function Lightbox({ fotos, indice, onIr, onCerrar }: Props) {
  const raizRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const cierreRef = useRef(0);
  const [listo, setListo] = useState(false);
  const [montado, setMontado] = useState(false);

  const total = fotos.length;
  const foto = fotos[indice];

  // El portal necesita el DOM: sólo se pinta tras el montaje en cliente.
  useEffect(() => setMontado(true), []);

  const pedirCierre = useCallback(() => {
    if (cierreRef.current) return; // ya se está cerrando
    setListo(false); // dispara el fundido y el desescalado de salida
    cierreRef.current = window.setTimeout(onCerrar, DURACION_CIERRE);
  }, [onCerrar]);

  const ir = useCallback(
    (delta: number) => {
      onIr((indice + delta + total) % total);
    },
    [indice, total, onIr]
  );

  // Apertura: bloquear el scroll, llevar el foco al visor y encender la
  // transición en el fotograma siguiente (si se pinta ya con el estado final,
  // no hay transición que ver).
  useEffect(() => {
    bloquearScroll();
    const raf = requestAnimationFrame(() => setListo(true));
    const t = window.setTimeout(() => cerrarRef.current?.focus(), 40);
    return () => {
      liberarScroll();
      cancelAnimationFrame(raf);
      window.clearTimeout(t);
      if (cierreRef.current) window.clearTimeout(cierreRef.current);
    };
    // Sólo al montar y desmontar: el visor vive mientras está abierto.
  }, []);

  // Teclado: Escape cierra, flechas recorren, Tab queda confinado dentro.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        pedirCierre();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        ir(-1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        ir(1);
        return;
      }
      if (e.key !== "Tab") return;
      const raiz = raizRef.current;
      const items = Array.from(
        raiz?.querySelectorAll<HTMLElement>("button") ?? []
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const primero = items[0];
      const ultimo = items[items.length - 1];
      const activo = document.activeElement;
      if (!raiz?.contains(activo)) {
        e.preventDefault();
        (e.shiftKey ? ultimo : primero).focus();
      } else if (e.shiftKey && activo === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && activo === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ir, pedirCierre]);

  // --- Gestos táctiles -------------------------------------------------
  // Se sigue UN solo dedo. En cuanto hay dos, el gesto propio se abandona y
  // el pellizco queda íntegramente en manos del navegador (zoom nativo): no
  // se llama a preventDefault en ningún momento y el CSS declara
  // touch-action: pinch-zoom.
  const punteros = useRef(new Set<number>());
  const origen = useRef<{ id: number; x: number; y: number } | null>(null);
  const eje = useRef<null | "x" | "y">(null);

  const pintarArrastre = (dx: number, dy: number, opacidad: number) => {
    const el = mediaRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    el.style.opacity = String(opacidad);
  };

  const soltarArrastre = () => {
    const el = mediaRef.current;
    if (!el) return;
    el.style.transition = "";
    el.style.transform = "";
    el.style.opacity = "";
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return; // con ratón basta pulsar el fondo
    punteros.current.add(e.pointerId);
    if (punteros.current.size > 1) {
      origen.current = null; // es un pellizco: no interferir
      eje.current = null;
      soltarArrastre();
      return;
    }
    origen.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    eje.current = null;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const o = origen.current;
    if (!o || punteros.current.size !== 1 || e.pointerId !== o.id) return;
    const dx = e.clientX - o.x;
    const dy = e.clientY - o.y;
    if (!eje.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      eje.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
    if (eje.current === "y" && dy > 0) {
      pintarArrastre(0, dy, Math.max(0.35, 1 - dy / 320));
    } else if (eje.current === "x") {
      pintarArrastre(dx * 0.35, 0, 1); // resistencia: sólo insinúa el cambio
    }
  };

  const onPointerEnd = (e: React.PointerEvent) => {
    const o = origen.current;
    punteros.current.delete(e.pointerId);
    if (!o || e.pointerId !== o.id) return;
    const dx = e.clientX - o.x;
    const dy = e.clientY - o.y;
    const ejeFinal = eje.current;
    origen.current = null;
    eje.current = null;
    soltarArrastre();
    if (ejeFinal === "y" && dy > UMBRAL_ARRASTRE) {
      pedirCierre();
    } else if (ejeFinal === "x" && Math.abs(dx) > UMBRAL_DESLIZ) {
      ir(dx < 0 ? 1 : -1);
    }
  };

  // Pulsar el fondo cierra; pulsar la fotografía, no. La caja del <img> ocupa
  // todo el lienzo (encaja con object-fit: contain), así que no basta con
  // mirar el objetivo del evento: hay que calcular el rectángulo realmente
  // pintado a partir de la proporción de la foto.
  const onFondo = (e: React.MouseEvent) => {
    const caja = mediaRef.current?.querySelector("img")?.getBoundingClientRect();
    if (!caja || caja.width === 0) {
      pedirCierre();
      return;
    }
    const relFoto = foto.src.width / foto.src.height;
    const relCaja = caja.width / caja.height;
    const ancho = relCaja > relFoto ? caja.height * relFoto : caja.width;
    const alto = relCaja > relFoto ? caja.height : caja.width / relFoto;
    const cx = caja.left + caja.width / 2;
    const cy = caja.top + caja.height / 2;
    const sobreLaFoto =
      Math.abs(e.clientX - cx) <= ancho / 2 &&
      Math.abs(e.clientY - cy) <= alto / 2;
    if (!sobreLaFoto) pedirCierre();
  };

  if (!montado) return null;

  return createPortal(
    <div
      ref={raizRef}
      className="lightbox"
      data-listo={listo}
      role="dialog"
      aria-modal="true"
      aria-label={`Fotografía ${indice + 1} de ${total}: ${foto.cap}`}
    >
      <div
        className="lightbox-lienzo"
        onClick={onFondo}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <div ref={mediaRef} className="lightbox-media">
          <Image
            key={foto.src.src}
            src={foto.src}
            alt={foto.alt}
            quality={88}
            /* 100vw → el navegador pide la variante mayor disponible, que el
               optimizador topa en el ancho real del archivo. */
            sizes="100vw"
            placeholder="blur"
            loading="eager"
          />
        </div>
      </div>

      <div className="lightbox-barra">
        <p className="lightbox-pie label">{foto.cap}</p>
        <p className="lightbox-indice label">
          {String(indice + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>
      </div>

      <button
        ref={cerrarRef}
        type="button"
        className="lightbox-btn lightbox-cerrar"
        onClick={pedirCierre}
      >
        <span className="sr-only">Cerrar el visor</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 5 L19 19 M19 5 L5 19" />
        </svg>
      </button>

      <button
        type="button"
        className="lightbox-btn lightbox-nav lightbox-prev"
        onClick={() => ir(-1)}
      >
        <span className="sr-only">Fotografía anterior</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 4 L7 12 L15 20" />
        </svg>
      </button>

      <button
        type="button"
        className="lightbox-btn lightbox-nav lightbox-next"
        onClick={() => ir(1)}
      >
        <span className="sr-only">Fotografía siguiente</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 4 L17 12 L9 20" />
        </svg>
      </button>
    </div>,
    document.body
  );
}
