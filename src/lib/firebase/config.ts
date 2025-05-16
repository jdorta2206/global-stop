// Importa las funciones que necesitas de los SDKs que necesitas
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
// import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"; // Descomenta si usas Firestore

// TODO: Agrega aquí la configuración de tu proyecto Firebase
// MUY IMPORTANTE: Reemplaza esto con la configuración real de tu proyecto Firebase.
// Puedes encontrarla en la consola de Firebase > Configuración del proyecto.
export const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
  measurementId: "TU_MEASUREMENT_ID" // Opcional, para Google Analytics
};

// Inicializar Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
// const db = getFirestore(app); // Descomenta si usas Firestore

// Si estás en desarrollo y quieres usar los emuladores:
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Comprueba si el emulador ya está conectado para evitar errores de "ya conectado"
  // @ts-ignore Property '_isInitialized' does not exist on type 'Auth'. Esta es una forma de verificar si el emulador ya está conectado.
  if (!auth._isInitialized) {
    // connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true }); // Descomenta para usar emulador de Auth
  }
  // if (!db._settingsFrozen) { // Verifica si Firestore ya está configurado para el emulador
    // connectFirestoreEmulator(db, 'localhost', 8080); // Descomenta para usar emulador de Firestore
  // }
}

export { app, auth }; // Exporta 'db' también si lo usas
// firebaseConfig ya se exporta individualmente arriba con 'export const firebaseConfig = ...'
// por lo que no es necesario añadirlo aquí de nuevo.
