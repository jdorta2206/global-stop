import * as React from "react";

const MOBILE_BREAKPOINT = 768; // Puedes ajustar este valor según tus necesidades

/**
 * Hook personalizado que detecta si el viewport es móvil
 * @returns {boolean} `true` si el ancho de pantalla es menor al breakpoint
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => 
    typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  React.useEffect(() => {
    // Solo ejecutar en cliente
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Escuchar cambios
    mediaQuery.addEventListener("change", handleResize);
    
    // Inicializar con el valor actual
    handleResize(mediaQuery);

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  return isMobile;
}