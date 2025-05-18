
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
import { auth, firebaseConfig as appFirebaseConfig } from '@/lib/firebase/config'; // Asegúrate que la ruta sea correcta
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
    const isPlaceholderConfig = appFirebaseConfig.apiKey.startsWith("TU_") ||
                               appFirebaseConfig.authDomain.startsWith("TU_") || 
                               appFirebaseConfig.projectId.startsWith("TU_");   

    if (isPlaceholderConfig) {
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
    let title = `Error de inicio de sesión con ${providerName}`;
    let description = error.message || `No se pudo iniciar sesión con ${providerName}. Revisa la consola del navegador para más detalles y verifica tu configuración de Firebase.`;
    let duration = 9000;

    if (error.code === 'auth/popup-closed-by-user') {
      title = "Inicio de sesión cancelado";
      description = "Has cerrado la ventana de inicio de sesión.";
    } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-blocked') {
      title = "Ventana emergente bloqueada o cerrada";
      description = "El navegador bloqueó la ventana de inicio de sesión o la cerraste demasiado rápido. Asegúrate de permitir ventanas emergentes para este sitio e inténtalo de nuevo.";
    } else if (error.code === 'auth/operation-not-allowed') {
      title = `Inicio de sesión con ${providerName} no habilitado`;
      description = `El inicio de sesión con ${providerName} no está habilitado en tu proyecto Firebase. Ve a Firebase Console > Authentication > Sign-in method y habilita ${providerName}.`;
    } else if (error.code === 'auth/unauthorized-domain') {
      title = "¡ACCIÓN REQUERIDA: Dominio no autorizado!";
      const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'el_dominio_actual_de_tu_app';
      description = `El dominio "${currentHostname}" NO está autorizado en Firebase. DEBES añadirlo a la lista de "Dominios Autorizados" en tu Consola de Firebase: Authentication > Settings. Copia este dominio y añádelo allí.`;
      duration = 15000; // Dar más tiempo para leer este mensaje crítico
    } else if (error.code === 'auth/invalid-api-key') {
      title = "API Key de Firebase Inválida";
      description = `La API Key configurada en 'src/lib/firebase/config.ts' no es válida. Por favor, verifica que sea la correcta de tu proyecto Firebase. Es posible que estés usando una configuración de ejemplo o que no se haya desplegado correctamente.`;
    } else if (error.code === 'auth/project-not-found' || error.code === 'auth/invalid-project-id') {
        title = "Proyecto de Firebase no encontrado o ID Inválido";
        description = `El Project ID configurado en 'src/lib/firebase/config.ts' no corresponde a un proyecto de Firebase válido o existente. Revisa tu configuración. Es posible que estés usando una configuración de ejemplo o que no se haya desplegado correctamente.`;
    } else if (providerName === "Facebook" && (error.message?.includes("Invalid App ID") || error.message?.includes("Identificador de aplicación no válido"))) {
        title = "Error de Configuración de Facebook";
        description = "Facebook indica que el 'Identificador de aplicación' (App ID) no es válido. Verifica que el App ID y el App Secret estén correctamente configurados en Firebase Console (Authentication > Sign-in method > Facebook) y que coincidan con los de tu aplicación en el portal de Facebook Developers.";
    }


    toast({
      title: title,
      description: description,
      variant: "destructive",
      duration: duration,
    });
  };

  const signInWithGoogle = async () => {
    if (appFirebaseConfig.apiKey.startsWith("TU_")) {
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
    if (appFirebaseConfig.apiKey.startsWith("TU_")) {
      setShowConfigErrorDialog(true);
      return;
    }
    
    toast({
      title: "Nota sobre Facebook Login",
      description: "Para que el inicio de sesión con Facebook funcione, asegúrate de haber configurado el App ID y App Secret en tu consola de Firebase y el URI de redirección OAuth en tu app de Facebook. Revisa la consola del navegador si hay errores específicos.",
      variant: "default",
      duration: 10000,
    });

    setLoading(true);
    try {
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
                aún contiene valores de marcador de posición que comienzan con 'TU_' (como 'TU_API_KEY', 'TU_AUTH_DOMAIN', etc.).
                <br /><br />
                Para que el inicio de sesión (Google, Facebook, etc.) funcione correctamente, es <strong>crucial</strong> que reemplaces estos marcadores de posición con las credenciales reales de tu proyecto Firebase. Puedes encontrarlas en la consola de Firebase, en la sección "Configuración del proyecto" (el ícono de engranaje).
                <br /><br />
                Además, asegúrate de haber habilitado los proveedores de inicio de sesión que deseas usar (Google, Facebook) en la sección de "Authentication" &gt; "Sign-in method" dentro de tu consola de Firebase. Para Facebook, también necesitas completar la configuración con el App ID y App Secret desde el portal de desarrolladores de Facebook, y configurar el URI de redireccionamiento OAuth.
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
