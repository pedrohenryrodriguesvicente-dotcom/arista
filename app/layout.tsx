import type { Metadata } from "next";
import { Instrument_Serif, Geist } from "next/font/google";
import "./globals.css";

// Display — titulares grandes
const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
  fallback: ["Georgia", "Times New Roman", "serif"],
  adjustFontFallback: true,
});

// Texto — cuerpo
const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
  fallback: [
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
  adjustFontFallback: true,
});

// Dominio de marcador: se sustituye por el definitivo al desplegar.
const SITIO = "https://arista.vercel.app";

const DESCRIPCION =
  "Residencia unifamiliar de obra nueva en Benahavís, Marbella: 720 m² en tres plataformas sobre la ladera, orientadas al sur y abiertas al Mediterráneo.";

export const metadata: Metadata = {
  metadataBase: new URL(SITIO),
  title: {
    default: "ARISTA · Residencia de obra nueva en Benahavís, Marbella",
    template: "%s · ARISTA",
  },
  description: DESCRIPCION,
  keywords: [
    "residencia de obra nueva",
    "villa de lujo Benahavís",
    "casa en venta Marbella",
    "obra nueva Costa del Sol",
    "villa con vistas al mar",
    "arquitectura contemporánea Marbella",
    "Benahavís",
  ],
  authors: [{ name: "Vertex Web Design" }],
  creator: "Vertex Web Design",
  publisher: "ARISTA",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "ARISTA",
    title: "ARISTA · Residencia de obra nueva en Benahavís, Marbella",
    description: DESCRIPCION,
    url: SITIO,
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Terraza y piscina desbordante de la residencia ARISTA, con la costa y el Mediterráneo al fondo.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ARISTA · Residencia de obra nueva en Benahavís, Marbella",
    description: DESCRIPCION,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Datos estructurados. Sólo hechos que el propio sitio afirma: nada de precio,
// condiciones ni datos legales inventados.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SingleFamilyResidence",
  name: "ARISTA",
  description: DESCRIPCION,
  url: SITIO,
  image: `${SITIO}/og.jpg`,
  numberOfBedrooms: 5,
  numberOfBathroomsTotal: 6,
  numberOfRooms: 11,
  floorSize: {
    "@type": "QuantitativeValue",
    value: 720,
    unitCode: "MTK",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Benahavís",
    addressRegion: "Málaga",
    addressCountry: "ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-ES"
      className={`${instrumentSerif.variable} ${geistSans.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          // El objeto es una constante del propio módulo, no entrada de usuario.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
