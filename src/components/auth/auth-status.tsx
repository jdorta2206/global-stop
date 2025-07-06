"use client";

import { useAuth } from '@/contexts/auth-context';
import { LogIn, LogOut, Loader2, ShieldAlert, Facebook } from 'lucide-react';
import { useState } from 'react';

// Componente para el ícono de Google
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" className="mr-2">
    <path fill="#4285F4" d="M21.35 11.1h-9.2v2.7h5.3c-.2 1.1-.9 2-2.1 2.7v1.9c2.1-1 3.8-3.1 3.8-5.7 0-.6-.1-1.1-.2-1.6z"/>
    <path fill="#34A853" d="M12.15 21.5c2.5 0 4.6-.8 6.1-2.2l-1.9-1.5c-.8.5-1.9.9-3.2.9-2.5 0-4.6-1.7-5.3-4H2.9v1.9C4.6 19.5 7.9 21.5 12.15 21.5z"/>
    <path fill="#FBBC05" d="M7.85 14.3c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V9H2.9c-.7 1.4-1.2 3-1.2 4.7s.5 3.3 1.2 4.7l4.9-1.9z"/>
    <path fill="#EA4335" d="M12.15 6.5c1.4 0 2.6.5 3.5 1.4l1.8-1.8C15.9 4.6 14.1 3.5 12.15 3.5c-4.2 0-7.5 2.9-9.2 6.6l4.9 1.9c.7-2.2 2.9-3.9 5.3-3.9z"/>
  </svg>
);

export function AuthStatus() {
  const auth = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoginMenuOpen, setIsLoginMenuOpen] = useState(false);
  
  // Verificar que auth no sea null
  if (!auth) {
    return (
      <button 
        disabled 
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-full"
      >
        <Loader2 className="h-5 w-5 animate-spin" />
      </button>
    );
  }

  const { user, loading, signOut } = auth;

  const userName = user?.user_metadata?.full_name || user?.email || 'Usuario';
  const userAvatar = user?.user_metadata?.avatar_url;
  const userEmail = user?.email || "Sin email";

  // Funciones de login (temporales hasta que estén en el context)
  const handleGoogleSignIn = async () => {
    console.log('Google sign in clicked');
    setIsLoginMenuOpen(false);
  };

  const handleFacebookSignIn = async () => {
    console.log('Facebook sign in clicked');
    setIsLoginMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  if (loading) {
    return (
      <button 
        disabled 
        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-full"
      >
        <Loader2 className="h-5 w-5 animate-spin" />
      </button>
    );
  }

  return (
    <div className="flex items-center">
      {user ? (
        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10 rounded-full"
          >
            <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="aspect-square h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </button>
          
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <div className="h-px bg-border my-1"></div>
              <button 
                onClick={handleSignOut}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}
          
          {isUserMenuOpen && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsUserMenuOpen(false)}
            />
          )}
        </div>
      ) : (
        <div className="relative">
          <button 
            onClick={() => setIsLoginMenuOpen(!isLoginMenuOpen)}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Acceder
          </button>
          
          {isLoginMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md z-50">
              <div className="px-2 py-1.5 text-sm">Iniciar sesión con</div>
              <div className="h-px bg-border my-1"></div>
              <button 
                onClick={handleGoogleSignIn}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left"
              >
                <GoogleIcon />
                Google
              </button>
              <button 
                onClick={handleFacebookSignIn}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full text-left"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </button>
              <div className="h-px bg-border my-1"></div>
              <div className="px-2 py-1.5 text-xs text-muted-foreground flex items-center">
                <ShieldAlert className="mr-2 h-3 w-3" />
                Configuración requerida
              </div>
            </div>
          )}
          
          {isLoginMenuOpen && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsLoginMenuOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}