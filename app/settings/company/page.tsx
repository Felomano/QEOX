'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Building2,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  Factory
} from 'lucide-react'
import Link from 'next/link'

export default function CompanyInfoPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // SOLUCIÓN AL REFERENCE ERROR: Declaramos orgId en el scope del componente
  const [orgId, setOrgId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    company_size: '',
    currency: 'USD',
    current_spend: 0,
    monthly_budget: ''
  })

  // Cálculos de presupuesto derivados del estado
  const budget = parseFloat(formData.monthly_budget) || 0
  const spend = formData.current_spend || 0
  const percentage = budget > 0 ? Math.min((spend / budget) * 100, 100) : 0
  const isOverBudget = spend > budget && budget > 0

  useEffect(() => {
    async function loadOrgData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('org_id')
            .eq('id', user.id)
            .single()

          if (profile?.org_id) {
            // Guardamos el ID en el estado para usarlo en handleSave
            setOrgId(profile.org_id)

            const { data: org } = await supabase
              .from('organizations')
              .select('*')
              .eq('id', profile.org_id)
              .single()

            if (org) {
              setFormData({
                name: org.name || '',
                industry: org.industry || '',
                company_size: org.company_size || '',
                currency: org.currency || 'USD',
                current_spend: parseFloat(org.current_spend) || 0,
                monthly_budget: org.monthly_budget?.toString() || '0'
              })
            }
          }
        }
      } catch (error) {
        console.error("Error cargando datos:", error)
      } finally {
        setLoading(false)
      }
    }
    loadOrgData()
  }, [supabase])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!orgId) {
      console.error("No se encontró orgId para actualizar")
      setStatus('error')
      return
    }

    setSaving(true)
    setStatus('idle')

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: formData.name,
          industry: formData.industry,
          company_size: formData.company_size,
          monthly_budget: budget, // Usamos el valor parseado
          updated_at: new Date().toISOString()
        })
        .eq('id', orgId)

      if (error) throw error

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (error: any) {
      console.error("Error al guardar:", error.message)
      setStatus('error')
    } finally {
      setSaving(false)
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
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-2xl mx-auto space-y-8">

        <Link href="/home" className="flex items-center text-slate-500 hover:text-white transition-colors group w-fit no-underline text-[10px] font-black uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Volver al Centro de Control
        </Link>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
            Company <span className="text-blue-500">Governance</span>
          </h1>
          <p className="text-slate-400 text-sm italic">Optimización de infraestructura y límites financieros.</p>
        </div>

        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md border-t-blue-500/30 border-t-2">
          <CardHeader className="pb-6">
            <div className="flex justify-between items-end mb-4">
              <div className="space-y-1">
                <CardTitle className="text-[11px] font-black uppercase tracking-[0.2em] text-white/90 flex items-center gap-2">
                  <TrendingUp size={14} className="text-blue-400" /> Consumo Registrado
                </CardTitle>
                <div className={`text-3xl font-black italic ${isOverBudget ? 'text-red-500' : 'text-white'}`}>
                  {spend.toLocaleString()} <span className="text-sm font-light text-slate-500 not-italic uppercase">{formData.currency}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Presupuesto Máximo</span>
                <span className="text-lg font-bold text-slate-300">${budget.toLocaleString()}</span>
              </div>
            </div>

            <Progress
              value={percentage}
              className={`h-1.5 bg-slate-800 ${isOverBudget ? "[&>div]:bg-red-600" : "[&>div]:bg-blue-500"}`}
            />

            <div className="flex justify-between mt-3">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isOverBudget ? 'text-red-500' : 'text-slate-500'}`}>
                {percentage.toFixed(1)}% de la capacidad financiera
              </span>
              {isOverBudget && (
                <span className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 animate-pulse">
                  <AlertTriangle size={12} /> Exceso de presupuesto detectado
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0 border-t border-slate-800/50 mt-4">
            <form onSubmit={handleSave} className="space-y-6 pt-6">

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Nombre de la Organización</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-950/50 border-slate-800 h-12 italic font-bold"
                  placeholder="e.g. QEOX Labs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <Factory className="w-3 h-3 text-blue-500" /> Industria
                  </Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(v) => setFormData({ ...formData, industry: v })}
                  >
                    <SelectTrigger className="bg-slate-950/50 border-slate-800 h-12 italic font-bold">
                      <SelectValue placeholder="Seleccionar industria" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="Finance">Finance & Risk</SelectItem>
                      <SelectItem value="Logistics">Logistics & Supply</SelectItem>
                      <SelectItem value="Pharma">Pharma & Biotech</SelectItem>
                      <SelectItem value="Energy">Energy Optimization</SelectItem>
                      <SelectItem value="AI">AI & Tech Infrastructure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <Users className="w-3 h-3 text-blue-500" /> Tamaño del Equipo
                  </Label>
                  <Select
                    value={formData.company_size}
                    onValueChange={(v) => setFormData({ ...formData, company_size: v })}
                  >
                    <SelectTrigger className="bg-slate-950/50 border-slate-800 h-12 italic font-bold">
                      <SelectValue placeholder="Seleccionar tamaño" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="1-10">1-10 empleados</SelectItem>
                      <SelectItem value="11-50">11-50 empleados</SelectItem>
                      <SelectItem value="51-200">51-200 empleados</SelectItem>
                      <SelectItem value="201-500">201-500 empleados</SelectItem>
                      <SelectItem value="500+">500+ empleados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/50">
                <div className="space-y-2 max-w-[50%]">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <DollarSign className="w-3 h-3 text-green-500" /> Presupuesto Mensual (Limit)
                  </Label>
                  <Input
                    type="number"
                    value={formData.monthly_budget}
                    onChange={(e) => setFormData({ ...formData, monthly_budget: e.target.value })}
                    className="bg-slate-950/50 border-slate-800 h-12 font-mono text-green-400 font-bold text-lg"
                    placeholder="0.00"
                  />
                  <p className="text-[9px] text-slate-600 uppercase font-bold tracking-tighter">
                    Este valor define el umbral de las alertas de optimización.
                  </p>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between">
                <div>
                  {status === 'success' && (
                    <span className="text-green-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 className="w-4 h-4" /> Organización Sincronizada
                    </span>
                  )}
                  {status === 'error' && (
                    <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">
                      Error en la conexión
                    </span>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={saving || !orgId}
                  className="bg-blue-600 hover:bg-blue-500 px-10 h-12 text-[11px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}