
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
import { auth, firebaseConfig as appFirebaseConfig } from '@/lib/firebase/config'; 
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

interface FacebookAuthResponse {
  status: 'connected' | 'not_authorized' | 'unknown';
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
    grantedScopes?: string;
  };
}

function statusChangeCallback(response: FacebookAuthResponse) {
  console.log('Facebook statusChangeCallback response:', response);
  if (response.status === 'connected') {
    console.log('Facebook user is connected. UserID:', response.authResponse?.userID);
  } else if (response.status === 'not_authorized') {
    console.log('Facebook user logged into Facebook, but not authorized for this app.');
  } else {
    console.log('Facebook user not logged into Facebook.');
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function checkLoginState() {
  if (typeof window !== 'undefined' && window.FB) {
    window.FB.getLoginStatus(function(response: FacebookAuthResponse) {
      statusChangeCallback(response);
    });
  } else {
    console.warn('FB SDK not loaded or window.FB not available.');
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfigErrorDialog, setShowConfigErrorDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const isPlaceholderConfig =
      !appFirebaseConfig ||
      (appFirebaseConfig.apiKey?.startsWith("TU_")) ||
      (appFirebaseConfig.authDomain?.startsWith("TU_")) ||
      (appFirebaseConfig.projectId?.startsWith("TU_"));

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
    let description = "";
    let duration = 9000;
    const currentHostname = typeof window !== 'undefined' ? window.location.hostname : 'el_dominio_actual_de_tu_app';

    switch (error.code) {
      case 'auth/popup-closed-by-user':
        title = "Inicio de sesión cancelado";
        description = "Has cerrado la ventana de inicio de sesión.";
        break;
      case 'auth/cancelled-popup-request':
      case 'auth/popup-blocked':
        title = "Ventana emergente bloqueada o cerrada";
        description = "El navegador bloqueó la ventana de inicio de sesión o la cerraste demasiado rápido. Asegúrate de permitir ventanas emergentes para este sitio e inténtalo de nuevo.";
        break;
      case 'auth/operation-not-allowed':
        title = `Inicio de sesión con ${providerName} no habilitado`;
        description = `El inicio de sesión con ${providerName} no está habilitado en tu proyecto Firebase. Ve a Firebase Console > Authentication > Sign-in method y habilita ${providerName}.`;
        break;
      case 'auth/unauthorized-domain':
        title = "¡ACCIÓN REQUERIDA: Dominio no autorizado!";
        description = `El dominio "${currentHostname}" NO está autorizado en Firebase. DEBES añadirlo a la lista de "Dominios Autorizados" en tu Consola de Firebase: Authentication > Settings. Copia este dominio y añádelo allí.`;
        duration = 15000;
        break;
      case 'auth/invalid-api-key':
        title = "API Key de Firebase Inválida";
        description = `La API Key configurada en 'src/lib/firebase/config.ts' no es válida. Por favor, verifica que sea la correcta de tu proyecto Firebase.`;
        break;
      case 'auth/project-not-found':
      case 'auth/invalid-project-id':
        title = "Proyecto de Firebase no encontrado o ID Inválido";
        description = `El Project ID configurado en 'src/lib/firebase/config.ts' no corresponde a un proyecto de Firebase válido o existente. Revisa tu configuración.`;
        break;
      default:
        if (providerName === "Facebook" && (error.message?.includes("Invalid App ID") || error.message?.includes("Identificador de aplicación no válido") || error.message?.includes("App Not Set Up"))) {
          title = "Error de Configuración de Facebook";
          description = "Facebook indica un problema con la configuración de tu aplicación (App ID inválido o App no configurada). Verifica el App ID y App Secret en Firebase Console y en Facebook Developers, y el URI de redireccionamiento OAuth.";
        } else {
          // Mensaje genérico mejorado
          description = `No se pudo iniciar sesión con ${providerName}. Detalles: ${error.message || 'Error desconocido.'} 
          \nREVISA: 
          \n1. La consola de tu navegador para errores más detallados.
          \n2. Que el proveedor (${providerName}) esté HABILITADO en Firebase Console (Authentication > Sign-in method).
          \n3. Que el dominio actual (${currentHostname}) esté en "Dominios Autorizados" en Firebase Console (Authentication > Settings).
          \n4. Que tu configuración en 'src/lib/firebase/config.ts' sea la correcta.
          \n5. (Para Facebook) Que el App ID, App Secret y URI de redirección OAuth estén correctos en Firebase y Facebook Developers.`;
        }
        break;
    }

    toast({
      title: title,
      description: description,
      variant: "destructive",
      duration: duration,
    });
  };

  const signInWithGoogle = async () => {
    if (!appFirebaseConfig || appFirebaseConfig.apiKey?.startsWith("TU_")) {
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
    if (!appFirebaseConfig || appFirebaseConfig.apiKey?.startsWith("TU_")) {
      setShowConfigErrorDialog(true);
      return;
    }
    
    setLoading(true);
    try {
      const provider = new FacebookAuthProvider();
      // provider.addScope('email'); // Opcional: solicitar email
      // provider.setCustomParameters({ 'display': 'popup' }); // Opcional
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

declare global {
  interface Window {
    FB: any; 
    fbAsyncInit: () => void;
  }
}
