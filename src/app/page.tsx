import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Locales from '@/components/Locales';
import Footer from '@/components/Footer';
import BotonWsp from '@/components/BotonWSP/BotonWsp';
import VolverArriba from '@/components/VolverArriba/VolverArriba';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Locales />
      <Footer />
      <VolverArriba />
      <BotonWsp />
    </div>
  );
}
