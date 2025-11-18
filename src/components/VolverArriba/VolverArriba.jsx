'use client'
import { useState, useEffect } from "react";

const VolverArriba = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShowButton = scrollY > 500;

      if (shouldShowButton !== isVisible) {
        setIsVisible(shouldShowButton);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isVisible]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
<button
  className="fixed bottom-24 right-9 rounded-md w-10 z-40 active:animate-ping hover:scale-110"
  style={{ visibility: isVisible ? "visible" : "hidden" }}
  onClick={scrollToTop}
  aria-label="Volver arriba"
>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="bg-primary rounded-lg"
    strokeWidth="2.4"
  >
    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
    <g id="SVGRepo_iconCarrier">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 7C12.2652 7 12.5196 7.10536 12.7071 7.29289L19.7071 14.2929C20.0976 14.6834 20.0976 15.3166 19.7071 15.7071C19.3166 16.0976 18.6834 16.0976 18.2929 15.7071L12 9.41421L5.70711 15.7071C5.31658 16.0976 4.68342 16.0976 4.29289 15.7071C3.90237 15.3166 3.90237 14.6834 4.29289 14.2929L11.2929 7.29289C11.4804 7.10536 11.7348 7 12 7Z"
        fill="#000000"
        stroke="#ffffff" // Aquí se establece el color del borde blanco
        strokeWidth="2.4" // Puedes ajustar el grosor del borde aquí
      ></path>
    </g>
  </svg>
</button>


  );
};

export default VolverArriba;
