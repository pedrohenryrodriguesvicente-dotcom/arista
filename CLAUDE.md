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
| Página 404 · límite de error | `app/not-found.tsx` · `app/error.tsx` (clase `.pagina-aviso`) |
| Favicon | **Pequeños** (icono geométrico propio): `public/favicon.svg` + `favicon.ico` (16/32/48) + `favicon-16x16.png` + `favicon-32x32.png`. **Grandes** (ilustración): `apple-touch-icon.png` 180 · `android-chrome-192x192.png` · `android-chrome-512x512.png` · `site.webmanifest`. Todo se declara en `metadata.icons` de `app/layout.tsx` |

Lib:

| Qué | Archivo |
|---|---|
| Registro de GSAP y plugins | `lib/gsap.ts` |
| `armFailShowing`, `afterFonts` | `lib/anim.ts` |
| Bloqueo de scroll (menú y visor) | `lib/scroll-lock.ts` |
| Visor para una foto suelta (Entorno y los tres pilares) | `lib/use-visor.ts` |
| Montaje de animaciones **tras** el primer pintado (9 secciones) | `lib/use-anim-effect.ts` |
| Hook de layout effect blindado — **sólo el hero** | `lib/use-isomorphic-layout-effect.ts` |

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
- **Cortes limpios** entre secciones: prohibidos degradados, viñetas, máscaras y overlays **decorativos** sobre las imágenes (probados dos veces y descartados). Excepción, y sólo esa: los cuatro *scrims* de contraste que hacen falta para AA sobre fotografía (`.hero-toplift`, `.declaracion-veil` en sus dos versiones y `.declaracion-label`). No son decorativos: sin ellos el texto no cumple.
- **Rendimiento**: las animaciones de las nueve secciones bajo el pliegue se montan **después** del primer pintado (`lib/use-anim-effect.ts`). Sólo el hero monta en pre-pintado, porque su animación de entrada sí se ve. No devolver las nueve a `useLayoutEffect`: costaba 1,7 s de *Style & Layout* en el camino crítico del LCP.
- Nombres de archivo en minúsculas, sin espacios ni dobles extensiones. Todo en UTF-8.
- **Verificar siempre en el navegador real con un build de producción**, no con el servidor de desarrollo: su optimizador de imágenes bajo demanda da falsos negativos (fotos en `[pending]` o pixeladas).
- Limpiar ScrollTrigger, listeners y canvas al desmontar.

## Repositorio

`https://github.com/pedrohenryrodriguesvicente-dotcom/arista` — público, rama `main`, remoto `origin`. Pensado para importarse en Vercel sin configuración adicional: no hay variables de entorno.

## Pendientes conocidos

- ⚠️ **ANTES DE DESPLEGAR**: sustituir el dominio marcador `https://arista.vercel.app` en `app/layout.tsx` (`SITIO`), `app/robots.ts` y `app/sitemap.ts`. Afecta a `metadataBase`, canonical, Open Graph, JSON-LD, `robots.txt` y `sitemap.xml`.
- Lighthouse (build de producción, medido 2026-07-27): **escritorio 99/100/100/100** · **móvil 86/100/100/100** (LCP 3,8 s · CLS 0 · TBT 170 ms). Lo que queda del LCP móvil es evaluación de GSAP, que el hero necesita de inmediato.
- «Aviso legal» y «Política de privacidad» del pie son **enlaces inertes** (`preventDefault`): faltan las páginas legales.
- `npm audit`: 12 avisos altos, todos transitivos y sólo de build/desarrollo (`postcss` y `sharp` vía Next; `minimatch`/`brace-expansion` vía ESLint). Ninguno llega al paquete del navegador. No hay arreglo sin salto mayor: npm propone bajar a `next@9.3.3`, y `next@15.5.22` fija exactamente las mismas versiones.
- Sin **Content-Security-Policy** a propósito: exigiría nonces por petición y tiraría el prerenderizado estático. Razonado en `next.config.ts`.
- Verificado **sólo en Chrome**. Sin Firefox ni Safari en la máquina: pendiente de comprobar en un dispositivo real (ver el bloque de compatibilidad del informe).

---

Documentación ampliada del estudio en `vertex-vault/`. **No la leas salvo petición expresa**: consume mucho contexto.
