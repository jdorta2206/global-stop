// Importaciones básicas que funcionarán seguro
import { createClient } from '@supabase/supabase-js'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return (
    <html lang="es">
      <body>
        {children}
        
        {/* Toaster alternativo sin necesidad de paquetes externos */}
        <div className="toaster-container">
          {/* Aquí irían tus notificaciones */}
        </div>
      </body>
    </html>
  )
}