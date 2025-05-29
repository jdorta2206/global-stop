
"use client";

import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogIn, LogOut, UserCircle, Loader2, ShieldAlert, Facebook } from 'lucide-react';
import Image from 'next/image'; // Para el ícono de Google

// Icono de Google como componente SVG (más fácil de manejar que un archivo de imagen en este contexto)
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
    <path fill="#4285F4" d="M21.35 11.1h-9.2v2.7h5.3c-.2 1.1-.9 2-2.1 2.7v1.9c2.1-1 3.8-3.1 3.8-5.7 0-.6-.1-1.1-.2-1.6z"></path>
    <path fill="#34A853" d="M12.15 21.5c2.5 0 4.6-.8 6.1-2.2l-1.9-1.5c-.8.5-1.9.9-3.2.9-2.5 0-4.6-1.7-5.3-4H2.9v1.9C4.6 19.5 7.9 21.5 12.15 21.5z"></path>
    <path fill="#FBBC05" d="M7.85 14.3c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V9H2.9c-.7 1.4-1.2 3-1.2 4.7s.5 3.3 1.2 4.7l4.9-1.9z"></path>
    <path fill="#EA4335" d="M12.15 6.5c1.4 0 2.6.5 3.5 1.4l1.8-1.8C15.9 4.6 14.1 3.5 12.15 3.5c-4.2 0-7.5 2.9-9.2 6.6l4.9 1.9c.7-2.2 2.9-3.9 5.3-3.9z"></path>
  </svg>
);


export function AuthStatus() {
  const { user, loading, signInWithGoogle, signInWithFacebook, logout } = useAuth();

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled className="rounded-full">
        <Loader2 className="h-5 w-5 animate-spin" />
      </Button>
    );
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              {user.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName || 'Avatar de usuario'} />
              ) : null}
              <AvatarFallback>
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5" />}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.displayName || "Usuario"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email || "Sin email"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="rounded-md">
          <LogIn className="mr-2 h-4 w-4" />
          Acceder
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Iniciar sesión con</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signInWithGoogle} className="cursor-pointer">
          <GoogleIcon className="mr-2 h-4 w-4" />
          Google
        </DropdownMenuItem>
        <DropdownMenuItem onClick={signInWithFacebook} className="cursor-pointer">
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </DropdownMenuItem>
         <DropdownMenuSeparator />
         <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            <ShieldAlert className="mr-2 h-3 w-3" />
            <span>Facebook necesita config. adicional</span>
         </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
