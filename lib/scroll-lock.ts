/**
 * Bloqueo de scroll compartido por el menú móvil y el visor de galería.
 *
 * Lleva la cuenta de cuántas capas lo tienen pedido: si el visor se abre
 * desde una página que ya lo tenía bloqueado, al cerrarse no lo suelta antes
 * de tiempo.
 *
 * Compensa el hueco que deja la barra de desplazamiento clásica (en táctil es
 * superpuesta y la compensación vale 0), y devuelve la página EXACTAMENTE a la
 * posición en la que estaba: `overflow: hidden` la conserva, pero Safari en
 * iOS no siempre, así que se restituye a mano.
 */

let bloqueos = 0;
let posicionGuardada = 0;

export function bloquearScroll() {
  if (typeof document === "undefined") return;
  if (bloqueos++ > 0) return;

  posicionGuardada = window.scrollY;
  const hueco = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty("--sb-comp", `${hueco}px`);
  document.documentElement.dataset.scrollBloqueado = "true";
}

export function liberarScroll() {
  if (typeof document === "undefined") return;
  if (bloqueos === 0) return;
  if (--bloqueos > 0) return;

  delete document.documentElement.dataset.scrollBloqueado;
  document.documentElement.style.removeProperty("--sb-comp");
  // "instant" es imprescindible: el html lleva scroll-behavior: smooth, y un
  // scrollTo suavizado devolvería la página con una animación y a una posición
  // aproximada en lugar de exactamente donde estaba.
  window.scrollTo({ top: posicionGuardada, left: 0, behavior: "instant" });
}
