import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Delimita la raíz de rastreo al propio proyecto (evita el aviso por
  // detectar otros lockfiles fuera de la carpeta del proyecto).
  outputFileTracingRoot: process.cwd(),
  // No anunciar la pila en las cabeceras
  poweredByHeader: false,
  images: {
    // Calidades usadas por next/image (obligatorio declararlas): 85 en el
    // hero, 88 en el resto de fotografías.
    qualities: [85, 88],
    // Sólo WebP (el valor por defecto de Next). Se probó AVIF —pesa un 20 %
    // menos— pero su codificación bajo demanda es tan lenta que la PRIMERA
    // visita paga medio segundo de LCP y el Speed Index se va de 1,0 a 2,6 s.
    // No compensa: el ahorro de bytes sólo llega a partir de la segunda visita.
    formats: ["image/webp"],
    // Un año de caché en las variantes optimizadas: la URL incluye los
    // parámetros, así que un cambio de imagen genera otra URL.
    minimumCacheTTL: 31536000,
  },
};

export default nextConfig;
