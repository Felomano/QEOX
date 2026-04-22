import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Por defecto intentamos ir al dashboard, pero la lógica de abajo puede cambiarlo
  let next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.user) {
      // 1. Consultamos el estado del onboarding en la tabla que creamos
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single()

      // 2. Si el perfil no existe o no ha terminado el onboarding, forzamos la ruta
      if (!profile || !profile.onboarding_completed) {
        next = '/home'
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // En caso de error, mandamos al usuario a una página de error controlada
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}