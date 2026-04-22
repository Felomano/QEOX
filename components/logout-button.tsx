'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      className="border-border text-foreground hover:bg-muted"
    >
      Logout
    </Button>
  )
}
