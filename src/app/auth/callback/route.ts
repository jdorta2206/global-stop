import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      // Solución universal que funciona en todas versiones
      const { data, error } = await supabase.rpc('handle_auth_callback', {
        auth_code: code
      })

      if (error) throw error

      return NextResponse.redirect(requestUrl.origin)
      
    } catch (error) {
      console.error('Error:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=auth_failed`
      )
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/login?error=no_code`)
}