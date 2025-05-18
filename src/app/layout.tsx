
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { LanguageProvider } from '@/contexts/language-context';
import { RoomProvider } from '@/contexts/room-context'; // Import RoomProvider

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
  themeColor: '#C0474A', 
  icons: {
    icon: [{ url: '/logo_stop_game.png', type: 'image/png', sizes: 'any' }],
    shortcut: { url: '/logo_stop_game.png', type: 'image/png' },
    apple: [ 
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
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
            <RoomProvider> {/* Wrap with RoomProvider */}
              {children}
              <Toaster />
            </RoomProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
