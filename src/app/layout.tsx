import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Juego Stop - Multijugador Online | Contra IA y Amigos',
  description: '¡Juega al clásico juego Stop, multilenguaje, contra la IA o amigos! Demuestra tu vocabulario en categorías como países, animales, nombres y más.',
  keywords: 'stop, juego de palabras, multijugador, online, IA, categorías, vocabulario, competir, multilenguaje',
  authors: [{ name: 'Stop Game Team' }],
  creator: 'Stop Game',
  publisher: 'Stop Game',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://tu-dominio.vercel.app'), // Cambia por tu dominio
  alternates: {
    canonical: '/',
    languages: {
      'es-ES': '/es',
      'en-US': '/en',
      'fr-FR': '/fr',
      'pt-PT': '/pt',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://tu-dominio.vercel.app',
    title: 'Juego Stop - Multijugador Online',
    description: '¡Juega al clásico juego Stop, multilenguaje, contra la IA o amigos!',
    siteName: 'Stop Game',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 1200,
        height: 630,
        alt: 'Stop - Juego de Palabras',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Juego Stop - Multijugador Online',
    description: '¡Juega al clásico juego Stop, multilenguaje, contra la IA o amigos!',
    images: ['/icons/icon-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'tu-codigo-google-verification', // Opcional
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#29ABE2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Juego Stop" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#29ABE2" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
