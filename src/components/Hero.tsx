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
            <Link
              href="#locales"
              className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Ver Nuestros Locales
            </Link>
            <Link
              href="/register"
              className="bg-surface dark:bg-dark-800 text-primary px-8 py-3 rounded-full font-semibold hover:bg-light-600 dark:hover:bg-dark-700 transition-all duration-300 shadow-lg border-2 border-primary hover:scale-105"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-surface dark:bg-dark-800 p-6 rounded-lg shadow-md hover:shadow-xl text-center transition-all duration-300 hover:-translate-y-1 border border-dark-200 dark:border-dark-700">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark-900 dark:text-light-500 mb-2">Productos Frescos</h3>
            <p className="text-dark-600 dark:text-dark-400">
              Seleccionamos los mejores productos del campo cada día
            </p>
          </div>

          <div className="bg-surface dark:bg-dark-800 p-6 rounded-lg shadow-md hover:shadow-xl text-center transition-all duration-300 hover:-translate-y-1 border border-dark-200 dark:border-dark-700">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <svg className="w-8 h-8 text-secondary dark:text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark-900 dark:text-light-500 mb-2">Múltiples Ubicaciones</h3>
            <p className="text-dark-600 dark:text-dark-400">
              Encuentranos en diferentes puntos de la ciudad
            </p>
          </div>

          <div className="bg-surface dark:bg-dark-800 p-6 rounded-lg shadow-md hover:shadow-xl text-center transition-all duration-300 hover:-translate-y-1 border border-dark-200 dark:border-dark-700">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-dark-900 dark:text-light-500 mb-2">Horario Extendido</h3>
            <p className="text-dark-600 dark:text-dark-400">
              Abierto de lunes a domingo para tu comodidad
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
