'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/home') // Redirección al Home tras login exitoso
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[#020617] p-6 md:p-10 text-slate-200">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {/* Logo QEOX Actualizado */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Image
              src="/logoqeox.png"
              alt="QEOX"
              width={120}
              height={40}
              priority
              className="object-contain"
            />
          </Link>

          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="text-left">
              <CardTitle className="text-2xl text-white uppercase italic font-black tracking-tighter">
                Login
              </CardTitle>
              <CardDescription className="text-slate-400">
                Enter your credentials to access the execution engine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  className="w-full border-slate-800 bg-black/40 text-white hover:bg-slate-800 hover:text-white transition-all font-bold uppercase tracking-widest text-[10px]"
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isLoading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
                    <span className="bg-[#020617] px-2 text-slate-500 italic">Security Layer</span>
                  </div>
                </div>

                <form onSubmit={handleLogin} className="text-left">
                  <div className="flex flex-col gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-slate-800 bg-black text-white placeholder:text-slate-700 h-12 rounded-xl focus:border-blue-500 transition-all"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-slate-800 bg-black text-white h-12 rounded-xl focus:border-blue-500 transition-all"
                      />
                    </div>
                    {error && <p className="text-xs text-red-500 font-bold bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}
                    <Button
                      type="submit"
                      className="w-full bg-white text-black hover:bg-slate-200 h-12 rounded-xl font-black uppercase tracking-widest text-xs transition-transform active:scale-95"
                      disabled={isLoading}
                    >
                      {isLoading ? 'INITIALIZING...' : 'SIGN IN'}
                    </Button>
                  </div>
                </form>

                <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-2">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/sign-up"
                    className="text-blue-500 underline underline-offset-4 hover:text-blue-400"
                  >
                    Register Entity
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
