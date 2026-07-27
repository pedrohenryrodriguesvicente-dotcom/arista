# ARISTA

Landing page de una sola página para una residencia unifamiliar de lujo de obra nueva en Benahavís (Marbella). En español de España. Estudio: Vertex Web Design.

**Stack**: Next.js 15 (App Router) · React 19 · Tailwind 4 · GSAP 3 (ScrollTrigger + SplitText) · TypeScript.

## Mapa de archivos

Secciones, en el orden de `app/page.tsx`:

| # | Sección | Ancla | Archivo |
|---|---|---|---|
| 1 | Hero | `#inicio` | `components/hero.tsx` |
| 2 | Esencia | `#esencia` | `components/esencia.tsx` |
| 3 | Visión | `#proyecto` | `components/vision.tsx` |
| 4 | Pilares | `#pilares` | `components/pilares.tsx` |
| 5 | Declaración | `#declaracion` | `components/declaracion.tsx` |
| 6 | Planos (oscuro, pin+scrub) | `#planos` | `components/planos.tsx` |
| 7 | Galería | `#galeria` | `components/galeria.tsx` |
| 8 | Ficha técnica (oscuro) | `#ficha-tecnica` | `components/ficha-tecnica.tsx` |
| 9 | Entorno | `#entorno` | `components/entorno.tsx` |
| 10 | Contacto | `#contacto` | `components/contacto.tsx` |
| — | Pie + firma Vertex (oscuro) | `#pie` | `components/footer.tsx` |

Transversales:

| Elemento | Archivo |
|---|---|
| Header + menú móvil desplegable | `components/header.tsx` |
| Barra de progreso de lectura | `components/scroll-progress.tsx` |
| Visor de galería (lightbox) | `components/lightbox.tsx` |
| Indicador de scroll del hero | `components/hero.tsx` (`.hero-scroll`) |

App:

| Qué | Archivo |
|---|---|
| Tokens de diseño (`@theme`) y TODO el CSS | `app/globals.css` |
| Metadatos, OG, JSON-LD, fuentes, enlace de salto | `app/layout.tsx` |
| Orden de secciones | `app/page.tsx` |
| Robots / sitemap | `app/robots.ts` · `app/sitemap.ts` |
| Favicon | `app/icon.svg` · `app/apple-icon.png` |

Lib:

| Qué | Archivo |
|---|---|
| Registro de GSAP y plugins | `lib/gsap.ts` |
| `armFailShowing`, `afterFonts` | `lib/anim.ts` |
| Bloqueo de scroll (menú y visor) | `lib/scroll-lock.ts` |
| Hook de layout effect blindado | `lib/use-isomorphic-layout-effect.ts` |

Imágenes: `public/img/` (13 fotos: `hero`, `vision`, `declaracion`, `entorno-mar`, `galeria-01..06`, `pilar-01..03`) · Open Graph: `public/og.jpg`.

Config: `next.config.ts` (qualities 85/88, WebP, cacheTTL) · `eslint.config.mjs` · `postcss.config.mjs`.

## Comandos

```bash
npm run dev            # desarrollo (puerto 3000)
npm run build          # build de producción
npx next start -p 3100 # servir producción para verificar
npx next lint          # lint
npx tsc --noEmit       # tipos
```

## Reglas del proyecto

- **Trabajo quirúrgico**: tocar solo lo pedido. Nunca refactorizar de más.
- Animar **solo** con `transform`, `opacity`, `clip-path` y `stroke-dashoffset`. **Nunca** `width`, `height`, `top` ni `left`.
- **Nada depende de hover**: en táctil todo se activa por scroll o por pulsación.
- Las animaciones **fallan mostrando**, nunca escondiendo: si un trigger no se dispara, el contenido queda visible en su estado final. El CSS base nunca oculta; ocultar es solo vía `gsap.set` en JS, con salvaguarda `armFailShowing`.
- **Contraste AA medido** en todos los textos, incluidos los que van sobre fotografía y sobre fondo oscuro. Sobre oscuro, el anillo de foco debe ser claro.
- Los cuatro fondos oscuros (Planos, Ficha técnica, panel de Visión, pie) usan **el mismo token de grafito**, sin variantes. Regla única en `globals.css`.
- **Cortes limpios** entre secciones: prohibidos degradados, viñetas, máscaras y overlays sobre las imágenes (probados dos veces y descartados).
- Nombres de archivo en minúsculas, sin espacios ni dobles extensiones. Todo en UTF-8.
- **Verificar siempre en el navegador real con un build de producción**, no con el servidor de desarrollo: su optimizador de imágenes bajo demanda da falsos negativos (fotos en `[pending]` o pixeladas).
- Limpiar ScrollTrigger, listeners y canvas al desmontar.

## Pendientes conocidos

- Sustituir el dominio marcador `https://arista.vercel.app` en `app/layout.tsx`, `app/robots.ts` y `app/sitemap.ts` **antes de desplegar**.
- Lighthouse móvil en 63: ~30 ScrollTriggers y la medición de SplitText se montan antes del primer pintado (`useLayoutEffect`). Escritorio 99-100.
- El proyecto todavía no tiene repositorio git.

---

Documentación ampliada del estudio en `vertex-vault/`. **No la leas salvo petición expresa**: consume mucho contexto.
