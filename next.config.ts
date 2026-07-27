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
  /**
   * Cabeceras de seguridad. Todas son «pasivas»: restringen lo que el
   * navegador permite hacer con la página, sin condicionar lo que la página
   * puede cargar, así que no pueden romper GSAP, las fuentes ni las imágenes.
   *
   * NO se añade Content-Security-Policy a propósito: Next inyecta estilos y
   * scripts en línea (el JSON-LD, el arranque del runtime, el CSS crítico) y
   * una CSP correcta exigiría nonces por petición, lo que obliga a renderizar
   * en el servidor en cada visita y tira por tierra el prerenderizado estático
   * de todo el sitio. Sin nonces habría que abrir 'unsafe-inline', que deja la
   * CSP sin apenas valor. Para un sitio estático sin formularios que envíen
   * datos ni sesión de usuario, el riesgo que cubriría es mínimo frente a lo
   * que cuesta. Queda anotado como decisión consciente.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Impide que el navegador «adivine» el tipo de un recurso y lo
          // ejecute como algo distinto de lo que declara el Content-Type.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No filtrar la ruta completa a terceros; con el origen basta.
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // El sitio no se embebe en ningún sitio: evita el clickjacking.
          { key: "X-Frame-Options", value: "DENY" },
          // Nada de cámara, micrófono, ubicación, pagos ni sensores: el sitio
          // no usa ninguna de estas API y así no puede hacerlo un tercero.
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=(), xr-spatial-tracking=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
