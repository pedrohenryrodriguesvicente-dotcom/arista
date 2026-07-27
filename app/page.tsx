import Header from "@/components/header";
import Hero from "@/components/hero";
import Esencia from "@/components/esencia";
import Vision from "@/components/vision";
import Pilares from "@/components/pilares";
import Declaracion from "@/components/declaracion";
import Planos from "@/components/planos";
import Galeria from "@/components/galeria";
import FichaTecnica from "@/components/ficha-tecnica";
import Entorno from "@/components/entorno";
import Contacto from "@/components/contacto";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Header />
      <main id="contenido" tabIndex={-1}>
        <Hero />
        <Esencia />
        <Vision />
        <Pilares />
        <Declaracion />
        <Planos />
        <Galeria />
        <FichaTecnica />
        <Entorno />
        <Contacto />
      </main>
      <Footer />
    </>
  );
}
