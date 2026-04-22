'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Bell,
  Coins,
  Zap,
  ChevronLeft,
  Globe,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

export default function PreferencesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true) // Para la carga inicial
  const [saved, setSaved] = useState(false)
  const [orgId, setOrgId] = useState<string | null>(null)

  const [prefs, setPrefs] = useState({
    currency: 'USD',
    language: 'en',
    email_notifications: true,
    auto_optimize: false,
    high_priority_alerts: true
  })

  // 1. Cargar la moneda actual de la organización
  useEffect(() => {
    async function loadPreferences() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('org_id')
          .eq('id', user.id)
          .single()

        if (profile?.org_id) {
          setOrgId(profile.org_id)

          const { data: org } = await supabase
            .from('organizations')
            .select('currency')
            .eq('id', profile.org_id)
            .single()

          if (org) {
            setPrefs(prev => ({ ...prev, currency: org.currency || 'USD' }))
          }
        }
      }
      setFetching(false)
    }
    loadPreferences()
  }, [supabase])

  // 2. Guardar el cambio en organizations
  const handleSave = async () => {
    if (!orgId) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          currency: prefs.currency,
          updated_at: new Date().toISOString()
        })
        .eq('id', orgId)

      if (error) throw error

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error("Error updating currency:", error)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        <Link href="/home" className="flex items-center text-slate-400 hover:text-white transition-colors group w-fit no-underline text-[10px] font-black uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Control Center
        </Link>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
            System <span className="text-blue-500">Preferences</span>
          </h1>
          <p className="text-slate-400 text-sm italic">
            Customize how QEOX analyzes and reports your infrastructure data.
          </p>
        </div>

        <div className="grid gap-6">

          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" /> Localization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-bold text-slate-200">Display Currency</Label>
                  <p className="text-[11px] text-slate-500 italic">Currency used for cost & savings reports.</p>
                </div>
                <Select
                  value={prefs.currency}
                  onValueChange={(v) => setPrefs({ ...prefs, currency: v })}
                >
                  <SelectTrigger className="w-[120px] bg-slate-950 border-slate-800 font-mono font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* ... resto de las Cards de notificaciones y automatización se mantienen igual ... */}

          <div className="flex items-center justify-end gap-4 pt-4">
            {saved && (
              <span className="text-green-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest animate-fade-in">
                <CheckCircle2 className="w-4 h-4" /> Preferences updated
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={loading || !orgId}
              className="bg-blue-600 hover:bg-blue-500 px-10 h-12 text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Preferences"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}