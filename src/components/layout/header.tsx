import Image from 'next/image';
import Link from 'next/link';
import { AuthStatus } from '@/components/auth/auth-status'; 

export function AppHeader() {
  return (
    <header className="py-3 px-4 md:px-8 border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity" aria-label="Página de inicio de Global Stop">
          {/* 
            Asegúrate de colocar tu nuevo archivo de logo en la carpeta `public` 
            y nombrarlo `new_logo.png` (o el nombre que uses) para que esta imagen se muestre.
            Ajusta width y height si las dimensiones de tu nuevo logo son diferentes.
          */}
          <Image 
            src="/new_logo.png" 
            alt="Global Stop Logo" 
            width={150} // Ajusta este valor si es necesario
            height={45}  // Ajusta este valor si es necesario
            className="h-10 md:h-12 w-auto" 
            priority 
          />
        </Link>
        <AuthStatus /> {/* Añadir el componente AuthStatus aquí */}
      </div>
    </header>
  );
}
