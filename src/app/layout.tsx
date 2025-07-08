import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Stop - Juego de Palabras Online | Multijugador',
  description: 'Juega Stop online con tus amigos. El clásico juego de palabras en tiempo real con categorías como países, animales, nombres y más. ¡Demuestra tu vocabulario!',
  keywords: 'stop, juego de palabras, multijugador, online, categorías, vocabulario, competir',
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
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://tu-dominio.vercel.app',
    title: 'Stop - Juego de Palabras Online',
    description: 'Juega Stop online con tus amigos. El clásico juego de palabras en tiempo real.',
    siteName: 'Stop Game',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Stop - Juego de Palabras',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stop - Juego de Palabras Online',
    description: 'Juega Stop online con tus amigos. El clásico juego de palabras en tiempo real.',
    images: ['/logo.png'],
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
        <meta name="theme-color" content="#dc2626" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Stop Game" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#dc2626" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
