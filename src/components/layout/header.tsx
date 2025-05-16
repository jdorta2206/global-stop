import { Globe } from 'lucide-react';
import Link from 'next/link';
import { AuthStatus } from '@/components/auth/auth-status'; // Importar AuthStatus

export function AppHeader() {
  return (
    <header className="py-4 px-4 md:px-8 border-b border-border bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-primary hover:opacity-80 transition-opacity">
          <Globe className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Global<span className="text-foreground">Stop</span>
          </h1>
        </Link>
        <AuthStatus /> {/* Añadir el componente AuthStatus aquí */}
      </div>
    </header>
  );
}
