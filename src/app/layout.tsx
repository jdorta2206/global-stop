import { createClient } from '@/utils/supabase/server'; // Archivo que crearemos

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  return (
    <html lang="es">
      <body className={`${inter.variable} ${robotoMono.variable} antialiased`}>
        <LanguageProvider>
          {/* Reemplazamos AuthProvider por SupabaseProvider */}
          <SupabaseProvider client={supabase}>
            <RoomGameProvider>
              {children}
              <Toaster />
            </RoomGameProvider>
          </SupabaseProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
