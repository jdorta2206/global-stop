
'use client';

import type { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode }
  from 'react';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config'; // Asegúrate que la ruta sea correcta
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "¡Bienvenido!", description: "Has iniciado sesión con Google." });
    } catch (error: any) {
      console.error("Error al iniciar sesión con Google:", error);
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "No se pudo iniciar sesión con Google.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    setLoading(true);
    try {
      // Primero, una advertencia de que necesita configuración adicional.
      toast({
        title: "Configuración Requerida para Facebook Login",
        description: "El inicio de sesión con Facebook necesita configuración adicional en la consola de Firebase y en el portal de desarrolladores de Facebook (App ID, App Secret, etc.). Esta es una implementación base.",
        variant: "default",
        duration: 7000,
      });
      const provider = new FacebookAuthProvider();
      // Aquí Firebase podría lanzar un error si el proveedor no está bien configurado en la consola.
      await signInWithPopup(auth, provider);
      toast({ title: "¡Bienvenido!", description: "Has iniciado sesión con Facebook." });
    } catch (error: any) {
      console.error("Error al iniciar sesión con Facebook:", error);
      // Diferenciar errores comunes
      if (error.code === 'auth/operation-not-allowed') {
         toast({
          title: "Error de Configuración",
          description: "El inicio de sesión con Facebook no está habilitado. Por favor, configúralo en tu consola de Firebase.",
          variant: "destructive",
        });
      } else if (error.code === 'auth/popup-closed-by-user') {
         toast({
          title: "Inicio de sesión cancelado",
          description: "Has cerrado la ventana de inicio de sesión.",
          variant: "default",
        });
      }
      else {
        toast({
          title: "Error de inicio de sesión",
          description: error.message || "No se pudo iniciar sesión con Facebook.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      toast({ title: "Sesión cerrada", description: "Has cerrado tu sesión exitosamente." });
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
      toast({
        title: "Error al cerrar sesión",
        description: error.message || "No se pudo cerrar la sesión.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithFacebook, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
