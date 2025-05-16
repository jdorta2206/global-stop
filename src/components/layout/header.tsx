import Image from 'next/image';
import Link from 'next/link';
import { AuthStatus } from '@/components/auth/auth-status'; 

export function AppHeader() {
  return (
    <header className="py-3 px-4 md:px-8 border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" aria-label="Página de inicio de Global Stop">
          {/* 
            Asegúrate de colocar tu archivo de logo en la carpeta `public` 
            y nombrarlo `logo.png` para que esta imagen se muestre.
            El tamaño original de la imagen es 256x256, lo escalamos aquí.
          */}
          <Image 
            src="/logo.png" 
            alt="Global Stop Logo" 
            width={150} // Ancho intrínseco para mejorar la carga
            height={45} // Alto intrínseco para mantener la proporción
            className="h-10 md:h-12 w-auto" // Clases de Tailwind para controlar el tamaño visual
            priority // Cargar el logo con prioridad ya que está en el LCP
          />
        </Link>
        <AuthStatus /> {/* Añadir el componente AuthStatus aquí */}
      </div>
    </header>
  );
}
