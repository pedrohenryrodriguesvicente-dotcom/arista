"use client";

import { useCallback, useRef, useState } from "react";
import type { FotoVisor } from "@/components/lightbox";

/**
 * Abre y cierra el visor para UNA fotografía suelta, fuera de la secuencia de
 * la Galería (hoy: Entorno y los tres pilares). Guarda el botón desde el que
 * se abrió para devolverle el foco al cerrar, igual que hace la Galería.
 *
 * Guarda además QUÉ fotografía se abrió, para que una misma sección con varias
 * imágenes ampliables (Pilares) comparta un solo visor sin duplicar estado.
 *
 * El visor en sí es siempre `components/lightbox`: aquí sólo vive el estado.
 */
export function useVisorSuelto() {
  const [foto, setFoto] = useState<FotoVisor | null>(null);
  const origen = useRef<HTMLButtonElement | null>(null);

  const abrir = useCallback((f: FotoVisor, boton: HTMLButtonElement) => {
    origen.current = boton;
    setFoto(f);
  }, []);

  const cerrar = useCallback(() => {
    setFoto(null);
    origen.current?.focus();
  }, []);

  return { foto, abrir, cerrar };
}
