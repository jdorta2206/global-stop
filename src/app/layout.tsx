
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { LanguageProvider } from '@/contexts/language-context';

const geistSans = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ 
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Juego Global Stop',
  description: '¡Juega al clásico juego Stop, multilenguaje, contra la IA o amigos!',
  manifest: '/manifest.json',
  themeColor: '#C0474A', // Color del tema para la barra de estado del navegador en móviles
  icons: {
    icon: { url: '/logo_stop_game.png', type: 'image/png' }, // Para favicons modernos
    shortcut: { url: '/logo_stop_game.png', type: 'image/png' }, // Para navegadores más antiguos y accesos directos
    apple: [ // Para Apple touch icons
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      // Podrías añadir más tamaños específicos para Apple aquí si los tienes, ej:
      // { url: '/icons/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    // Puedes añadir otros iconos aquí si es necesario, por ejemplo, para Android con propósito "maskable"
    // other: [
    //   { rel: 'icon', url: '/icons/icon-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' }
    // ]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es"> {/* Establecido estáticamente a 'es'. LanguageProvider maneja la UI. */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
