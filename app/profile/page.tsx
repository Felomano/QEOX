'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  User,
  Mail,
  Camera,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    avatar_url: ''
  })

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Intentamos sacar los datos de la tabla profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single()

        setFormData({
          full_name: profile?.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || ''
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        avatar_url: formData.avatar_url // Aquí podrías integrar un upload a Supabase Storage
      })
      .eq('id', user?.id)

    setSaving(false)
    if (!error) {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">

        <Link href="/home" className="flex items-center text-slate-400 hover:text-white transition-colors group w-fit">
          <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Control Center
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Personal Identity
          </h1>
          <p className="text-slate-400">
            Manage your personal information and how you appear in QEOX.
          </p>
        </div>

        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-blue-500/50 bg-slate-800">
                {formData.avatar_url ? (
                  <Image
                    src={formData.avatar_url}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="w-full h-full p-4 text-slate-600" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full text-white hover:bg-blue-500 transition-colors shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <CardTitle className="text-xl">{formData.full_name || 'User Profile'}</CardTitle>
            <CardDescription className="text-slate-500">
              {formData.email}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">

              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-slate-300">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-slate-950 border-slate-800 pl-10 focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2 opacity-60">
                <Label htmlFor="email" className="text-slate-300">Email Address (Read-only)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="bg-slate-900 border-slate-800 pl-10 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> Managed by your Auth Provider
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                {status === 'success' ? (
                  <span className="text-green-400 flex items-center gap-2 text-sm animate-in fade-in slide-in-from-left-2">
                    <CheckCircle2 className="w-4 h-4" /> Profile updated
                  </span>
                ) : <div />}

                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 px-10 transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}