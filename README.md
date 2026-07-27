# ARISTA

Landing page de una sola página para una residencia unifamiliar de obra nueva
en Benahavís (Marbella, Costa del Sol). El sitio está construido alrededor de
una idea: la casa es una línea sobre la ladera, y esa línea se dibuja sola a
medida que el visitante baja por la página.

En español de España.

## Stack

| | |
|---|---|
| Framework | Next.js 15 · App Router |
| UI | React 19 · TypeScript |
| Estilos | Tailwind CSS 4 (tokens en `@theme`) |
| Animación | GSAP 3 · ScrollTrigger · SplitText |
| Tipografía | Instrument Serif · Geist Sans (`next/font`) |

## Características

- **Diagrama de sección en SVG que se traza con el scroll.** El perfil del
  terreno, las tres plataformas, las cotas y el eje de vista se dibujan con
  `stroke-dashoffset` sincronizado al scroll (`pin` + `scrub`) en escritorio, y
  de una pasada en móvil.
- **Visor de fotografías a pantalla completa.** Diez imágenes ampliables: las
  seis de la galería navegan entre sí con flechas, teclado y deslizamiento; las
  cuatro sueltas (Entorno y los tres pilares) abren en modo de foto única. Cierre
  por aspa, fondo, arrastre vertical y `Escape`, con el foco confinado y devuelto
  al botón de origen.
- **Animaciones que fallan mostrando.** El CSS base nunca oculta nada: los
  estados iniciales se aplican solo desde JavaScript, y una salvaguarda con
  `IntersectionObserver` revela el contenido si un disparador no llega a
  ejecutarse. Verificado anulando el `requestAnimationFrame`: sin animación, las
  once secciones se leen completas.
- **Diseño responsive** verificado a 375, 414, 768, 1024 y 1440 px. En móvil la
  galería empareja las fotografías verticales de dos en dos y los pilares
  colocan fotografía y texto en la misma fila.
- **Accesibilidad.** Recorrido completo por teclado, foco visible también sobre
  los fondos oscuros, jerarquía de encabezados sin saltos, textos alternativos
  reales y contraste AA medido sobre fotografía y sobre grafito.
- **Rendimiento.** Las animaciones de las secciones bajo el pliegue se montan
  después del primer pintado, para no bloquear el LCP.
- **SEO y metadatos.** Open Graph, Twitter Card, datos estructurados JSON-LD
  (`SingleFamilyResidence`), `robots.txt`, `sitemap.xml` y manifest de aplicación.

## Lighthouse

Medido sobre un build de producción servido en local (Lighthouse 12).

| | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| Escritorio | 99 | 100 | 100 | 100 |
| Móvil | 86 | 100 | 100 | 100 |

Métricas web esenciales: **CLS 0** en ambos. LCP 1,0 s en escritorio y 3,8 s en
móvil (emulación con CPU limitada 4×).

## Instalación

Requiere Node.js 18.18 o superior.

```bash
git clone https://github.com/pedrohenryrodriguesvicente-dotcom/arista.git
cd arista
npm install
```

```bash
npm run dev     # desarrollo en http://localhost:3000
npm run build   # build de producción
npm start       # sirve el build de producción
npm run lint    # ESLint
npx tsc --noEmit  # comprobación de tipos
```

El proyecto **no necesita ninguna variable de entorno**.

> Al verificar, hazlo siempre contra un build de producción: el optimizador de
> imágenes bajo demanda del servidor de desarrollo da falsos negativos.

## Estructura

```
app/            Rutas, metadatos y la totalidad del CSS
  layout.tsx      Metadatos, Open Graph, JSON-LD, fuentes, iconos
  page.tsx        Orden de las once secciones
  globals.css     Tokens de diseño (@theme) y todos los estilos
  not-found.tsx   Página 404
  error.tsx       Límite de error en tiempo de ejecución
components/     Una sección por archivo, más header, pie y visor
lib/            GSAP, salvaguarda de «fallar mostrando», bloqueo de scroll,
                y los hooks de montaje de animaciones
public/         Fotografías, Open Graph, favicons y manifest
```

## Despliegue

Pensado para Vercel: se importa el repositorio y se despliega sin configuración
adicional. Tras el primer despliegue hay que fijar el dominio definitivo en
`app/layout.tsx`, `app/robots.ts` y `app/sitemap.ts`, donde ahora figura un
marcador.

---

Diseño y desarrollo: **Vertex Web Design**
