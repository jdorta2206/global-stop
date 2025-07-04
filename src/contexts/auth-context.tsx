// src/contexts/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import type { Session, User } from '@supabase/supabase-js';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfigError, setShowConfigError] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // Verificar configuración al montar
  useEffect(() => {
    const checkConfig = () => {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || 
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_URL.includes('TU_')) {
        setShowConfigError(true);
      }
    };

    checkConfig();

    // Suscribirse a cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signInWithProvider = async (provider: 'google' | 'github') => {
    if (showConfigError) {
      toast({
        title: 'Configuración requerida',
        description: 'Por favor configura Supabase correctamente',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      toast({
        title: 'Redireccionando...',
        description: `Iniciando sesión con ${provider}`
      });
    } catch (error: any) {
      toast({
        title: 'Error de autenticación',
        description: error.message || 'No se pudo iniciar sesión',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente'
      });
    } catch (error: any) {
      toast({
        title: 'Error al cerrar sesión',
        description: error.message || 'Intenta nuevamente',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithProvider, logout }}>
      {children}
      
      {/* Diálogo de error de configuración */}
      {showConfigError && (
        <AlertDialog open={showConfigError} onOpenChange={setShowConfigError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Configuración de Supabase Requerida</AlertDialogTitle>
              <AlertDialogDescription>
                Para que la autenticación funcione, debes configurar correctamente las variables de entorno:
                <br /><br />
                <code className="bg-muted p-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> y <code className="bg-muted p-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                <br /><br />
                Estas se encuentran en la configuración de tu proyecto Supabase. También asegúrate de habilitar los proveedores de autenticación en la sección de Authentication de Supabase.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>Entendido</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
