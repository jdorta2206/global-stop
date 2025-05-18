
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
            y nombrarlo `logo_stop_game.png` (o el nombre que uses) para que esta imagen se muestre.
            La imagen original es de 200x200. 
            La clase h-10 (40px) y md:h-12 (48px) controlará la altura, y w-auto mantendrá la proporción.
          */}
          <Image 
            src="/logo_stop_game.png" 
            alt="Global Stop Game Logo" 
            width={48} // Proporcionar un width base, la altura es controlada por className
            height={48} // Proporcionar un height base, la altura es controlada por className
            className="h-10 md:h-12 w-auto" // w-auto para mantener proporción
            priority 
            data-ai-hint="game logo"
          />
        </Link>
        <AuthStatus /> {/* Añadir el componente AuthStatus aquí */}
      </div>
    </header>
  );
}
