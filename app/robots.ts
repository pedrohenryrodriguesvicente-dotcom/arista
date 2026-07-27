import type { MetadataRoute } from "next";

const SITIO = "https://arista.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITIO}/sitemap.xml`,
    host: SITIO,
  };
}
