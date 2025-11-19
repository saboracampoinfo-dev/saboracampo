import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-linear-to-br from-primary-50 via-light-500 to-secondary-50 pt-24 pb-20 dark:from-dark-900 dark:via-dark-800 dark:to-secondary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-dark-900 dark:text-light-500 mb-6 animate-fade-in">
            <span className="bg-linear-to-r from-primary-400 via-primary-600 to-primary-400 bg-clip-text text-transparent"> Sabor a Campo</span>
          </h1>
          <p className="text-xl text-dark-700 dark:text-dark-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Los mejores productos frescos y naturales directo del campo a tu mesa.
            Calidad garantizada en todos nuestros locales.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Link
              href="#locales"
              className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Ver Nuestros Locales
            </Link> */}
            <Link
              href="/register"
              className="bg-surface dark:bg-dark-800 text-primary px-8 py-3 rounded-full font-semibold hover:bg-light-600 dark:hover:bg-dark-700 transition-all duration-300 shadow-lg border-2 border-primary hover:scale-105"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>


      </div>
    </section>
  );
}
