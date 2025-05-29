
import type {Metadata, Viewport} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/auth-context';
import { LanguageProvider } from '@/contexts/language-context';
import { RoomGameProvider } from '@/contexts/room-context';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Juego Stop',
  description: '¡Juega al clásico juego Stop, multilenguaje, contra la IA o amigos!',
  manifest: '/manifest.json',
  icons: {
    // Prioritize logo_stop_game.png for modern browsers
    icon: [
      { url: '/logo_stop_game.png', type: 'image/png', sizes: 'any' },
      // Fallback to traditional favicon.ico
      { url: '/favicon.ico', type: 'image/x-icon', sizes: '48x48' },
    ],
    shortcut: '/logo_stop_game.png', // For older browsers
    apple: [ // For Apple touch icons
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#C0474A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <LanguageProvider>
          <AuthProvider>
            <RoomGameProvider>
              {children}
              <Toaster />
            </RoomGameProvider>
          </AuthProvider>
        </LanguageProvider>
        {/* Facebook SDK Scripts */}
        <Script id="fb-sdk-init" strategy="afterInteractive">
          {`
            window.fbAsyncInit = function() {
              FB.init({
                appId      : '130307240847074206491165', // REPLACE WITH YOUR ACTUAL FACEBOOK APP ID
                cookie     : true,
                xfbml      : true,
                version    : 'v19.0' // REPLACE WITH YOUR DESIRED API VERSION
              });
              FB.AppEvents.logPageView();
            };
          `}
        </Script>
        <Script
          id="fb-sdk"
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
