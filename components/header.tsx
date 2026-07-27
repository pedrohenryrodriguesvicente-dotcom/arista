"use client";

import { useEffect, useRef, useState } from "react";
import ScrollProgress from "@/components/scroll-progress";
import { bloquearScroll, liberarScroll } from "@/lib/scroll-lock";

type NavItem = { label: string; href: string };

const NAV: NavItem[] = [
  { label: "El proyecto", href: "#proyecto" },
  { label: "Planos", href: "#planos" },
  { label: "Galería", href: "#galeria" },
  { label: "Entorno", href: "#entorno" },
  { label: "Contacto", href: "#contacto" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fondo del header que aparece de forma sutil al bajar
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Bloqueo de scroll, Escape y CONFINAMIENTO DEL FOCO mientras el menú
  // está desplegado. Es un diálogo modal (role="dialog" aria-modal), así que
  // el tabulador no debe poder salirse a la página que hay detrás.
  useEffect(() => {
    if (!open) return;
    const panel = menuRef.current;
    bloquearScroll();

    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const primero = items[0];
      const ultimo = items[items.length - 1];
      const activo = document.activeElement;
      // Ciclo: del último al primero y viceversa; si el foco se ha escapado
      // fuera del panel, se devuelve al extremo que corresponda.
      if (!panel?.contains(activo)) {
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
    // Mueve el foco al primer enlace del menú
    const t = window.setTimeout(() => firstLinkRef.current?.focus(), 60);
    return () => {
      liberarScroll();
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  // Al cerrar con el aspa o el velo, el foco vuelve al botón. Al cerrar
  // pulsando un enlace NO: ahí el foco debe seguir al destino del ancla.
  const closeMenu = (devolverFoco = true) => {
    setOpen(false);
    if (devolverFoco) toggleRef.current?.focus();
  };

  // Scroll suave por JS a las anclas. El scroll-behavior de CSS entra en
  // conflicto con el pin de ScrollTrigger (la sección Planos), así que se
  // gestiona el desplazamiento a mano descontando la altura del header.
  const onNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const headerH =
      document.querySelector(".site-header")?.getBoundingClientRect().height ??
      76;
    const top = window.scrollY + target.getBoundingClientRect().top - (headerH + 16);
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", href);
  };

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="shell flex h-full items-center justify-between">
        {/* Wordmark */}
        <a
          href="#inicio"
          aria-label="ARISTA — Ir al inicio"
          className="font-display text-wordmark text-grafito"
        >
          ARISTA
        </a>

        {/* Navegación (escritorio) */}
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => onNavClick(e, item.href)}
                  className="link-underline nav-label text-grafito"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Botón de menú (móvil) — el icono se convierte en aspa al abrir */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center lg:hidden"
        >
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
          <span aria-hidden="true" className="relative block h-3 w-6">
            <span
              className="absolute left-0 block h-px w-6 bg-grafito transition-transform duration-300 ease-out"
              style={{
                top: "3px",
                transform: open ? "translateY(3px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="absolute left-0 block h-px w-6 bg-grafito transition-transform duration-300 ease-out"
              style={{
                top: "9px",
                transform: open ? "translateY(-3px) rotate(-45deg)" : "none",
              }}
            />
          </span>
        </button>
      </div>

      {/* Barra de progreso de lectura (colgada del borde inferior del header) */}
      <ScrollProgress />

      {/* Velo sobre el resto de la página: al pulsarlo, cierra */}
      <div
        className="mobile-veil lg:hidden"
        data-open={open}
        aria-hidden="true"
        onClick={() => closeMenu()}
      />

      {/* Menú móvil: panel desplegable con la altura justa de su contenido */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className="mobile-menu lg:hidden"
        data-open={open}
        inert={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <div className="mobile-menu-panel">
          <nav aria-label="Navegación móvil" className="shell py-2">
            <ul className="mobile-menu-lista">
              {NAV.map((item, i) => (
                <li key={item.href}>
                  <a
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={item.href}
                    onClick={() => closeMenu(false)}
                    className="mobile-menu-link"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mobile-menu-pie label mt-5 mb-4">
              Benahavís · Marbella · Costa del Sol
            </p>
          </nav>
        </div>
      </div>
    </header>
  );
}
