export default function Locales() {
  const locales = [
    {
      id: 1,
      nombre: 'Sabor a Campo Centro',
      direccion: 'Av. Principal 1234, Centro',
      telefono: '+54 11 1234-5678',
      email: 'centro@saboracampo.com',
      horario: 'Lun - Sáb: 8:00 - 20:00 | Dom: 9:00 - 14:00',
      mapa: 'https://maps.google.com',
    },
    {
      id: 2,
      nombre: 'Sabor a Campo Norte',
      direccion: 'Calle Libertad 567, Zona Norte',
      telefono: '+54 11 2345-6789',
      email: 'norte@saboracampo.com',
      horario: 'Lun - Sáb: 8:00 - 20:00 | Dom: 9:00 - 14:00',
      mapa: 'https://maps.google.com',
    },
    {
      id: 3,
      nombre: 'Sabor a Campo Sur',
      direccion: 'Av. del Campo 890, Zona Sur',
      telefono: '+54 11 3456-7890',
      email: 'sur@saboracampo.com',
      horario: 'Lun - Sáb: 8:00 - 20:00 | Dom: 9:00 - 14:00',
      mapa: 'https://maps.google.com',
    },
  ];

  return (
    <section id="locales" className="py-20 bg-base dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Nuestros Locales
          </h2>
          <p className="text-xl text-dark-700 dark:text-dark-300 max-w-2xl mx-auto">
            Visitanos en cualquiera de nuestras sucursales. Estamos cerca de ti.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locales.map((local) => (
            <div
              key={local.id}
              className="bg-surface dark:bg-dark-800 border-2 border-primary-200 dark:border-primary-900 rounded-lg p-6 hover:shadow-2xl hover:border-primary transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-primary dark:text-primary-400 mb-2">
                  {local.nombre}
                </h3>
                <div className="w-16 h-1 bg-linear-to-r from-primary to-secondary rounded-full"></div>
              </div>

              <div className="space-y-4">
                {/* Dirección */}
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-primary mr-3 mt-1 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-dark-900 dark:text-light-500">Dirección</p>
                    <p className="text-dark-600 dark:text-dark-400">{local.direccion}</p>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-secondary dark:text-secondary-400 mr-3 mt-1 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-dark-900 dark:text-light-500">Teléfono</p>
                    <a
                      href={`tel:${local.telefono}`}
                      className="text-secondary dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors"
                    >
                      {local.telefono}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-primary mr-3 mt-1 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-dark-900 dark:text-light-500">Email</p>
                    <a
                      href={`mailto:${local.email}`}
                      className="text-primary hover:text-primary-700 transition-colors"
                    >
                      {local.email}
                    </a>
                  </div>
                </div>

                {/* Horario */}
                <div className="flex items-start">
                  <svg
                    className="w-6 h-6 text-secondary dark:text-secondary-400 mr-3 mt-1 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-dark-900 dark:text-light-500">Horario</p>
                    <p className="text-dark-600 dark:text-dark-400 text-sm">{local.horario}</p>
                  </div>
                </div>
              </div>

              {/* Botón Ver en Mapa */}
              <a
                href={local.mapa}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block w-full text-center bg-primary text-white py-3 rounded-lg hover:bg-primary-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-105"
              >
                Ver en Mapa
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
