
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
import { firebaseConfig as appFirebaseConfig } from '@/lib/firebase/config'; // Importar para la verificación
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  const [showConfigErrorDialog, setShowConfigErrorDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar si la configuración de Firebase sigue usando placeholders
    if (
      appFirebaseConfig.apiKey === "TU_API_KEY" ||
      appFirebaseConfig.authDomain === "TU_AUTH_DOMAIN" ||
      appFirebaseConfig.projectId === "TU_PROJECT_ID"
    ) {
      setShowConfigErrorDialog(true);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignInError = (error: any, providerName: string) => {
    console.error(`Error al iniciar sesión con ${providerName}:`, error);
    if (error.code === 'auth/operation-not-allowed') {
      toast({
        title: "Error de Configuración",
        description: `El inicio de sesión con ${providerName} no está habilitado. Por favor, configúralo en tu consola de Firebase.`,
        variant: "destructive",
        duration: 7000,
      });
    } else if (error.code === 'auth/popup-closed-by-user') {
      toast({
        title: "Inicio de sesión cancelado",
        description: "Has cerrado la ventana de inicio de sesión.",
        variant: "default",
      });
    } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-blocked') {
      toast({
        title: "Ventana emergente bloqueada o cerrada",
        description: "El navegador bloqueó la ventana de inicio de sesión o la cerraste demasiado rápido. Asegúrate de permitir ventanas emergentes para este sitio.",
        variant: "destructive",
        duration: 7000,
      });
    }
    else {
      toast({
        title: `Error de inicio de sesión con ${providerName}`,
        description: error.message || `No se pudo iniciar sesión con ${providerName}. Revisa la configuración.`,
        variant: "destructive",
      });
    }
  };

  const signInWithGoogle = async () => {
    if (appFirebaseConfig.apiKey === "TU_API_KEY") { // Re-chequear por si acaso
      setShowConfigErrorDialog(true);
      return;
    }
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "¡Bienvenido!", description: "Has iniciado sesión con Google." });
    } catch (error: any) {
      handleSignInError(error, "Google");
    } finally {
      setLoading(false);
    }
  };

  const signInWithFacebook = async () => {
    if (appFirebaseConfig.apiKey === "TU_API_KEY") { // Re-chequear por si acaso
      setShowConfigErrorDialog(true);
      return;
    }
    setLoading(true);
    try {
      toast({
        title: "Configuración Adicional Requerida para Facebook",
        description: "Recuerda que el inicio de sesión con Facebook necesita que hayas configurado el App ID y App Secret en Firebase y en el portal de desarrolladores de Facebook.",
        variant: "default",
        duration: 9000,
      });
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      toast({ title: "¡Bienvenido!", description: "Has iniciado sesión con Facebook." });
    } catch (error: any) {
      handleSignInError(error, "Facebook");
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
      {showConfigErrorDialog && (
        <AlertDialog open={showConfigErrorDialog} onOpenChange={setShowConfigErrorDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¡Configuración de Firebase Requerida!</AlertDialogTitle>
              <AlertDialogDescription>
                Parece que la configuración de Firebase en el archivo 
                <code className="mx-1 p-1 bg-muted rounded text-foreground">src/lib/firebase/config.ts</code> 
                aún contiene valores de marcador de posición (como 'TU_API_KEY', 'TU_AUTH_DOMAIN', o 'TU_PROJECT_ID').
                <br /><br />
                Para que el inicio de sesión (Google, Facebook, etc.) funcione correctamente, es <strong>crucial</strong> que reemplaces estos marcadores de posición con las credenciales reales de tu proyecto Firebase. Puedes encontrarlas en la consola de Firebase, en la sección "Configuración del proyecto" (el ícono de engranaje).
                <br /><br />
                Además, asegúrate de haber habilitado los proveedores de inicio de sesión que deseas usar (Google, Facebook) en la sección de "Authentication" &gt; "Sign-in method" dentro de tu consola de Firebase. Para Facebook, también necesitas completar la configuración con el App ID y App Secret desde el portal de desarrolladores de Facebook.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setShowConfigErrorDialog(false)}>Entendido</AlertDialogAction>
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
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
