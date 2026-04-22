'use client'

import { useState, useMemo, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Cloud, Cpu, Zap, ChevronLeft, ShieldCheck,
  Loader2, Settings2, Server, ShieldAlert, Trash2, Info, Star,
  DollarSign, HardDrive
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ... (Mantenemos PROVIDERS_CONFIG igual que lo tienes)
const PROVIDERS_CONFIG = [
  { id: 'aws', name: 'Amazon Web Services', computeType: 'Classical', category: 'General Cloud', auth: 'key_secret', icon: Cloud, color: 'text-orange-500', badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { id: 'gcp', name: 'Google Cloud', computeType: 'Classical', category: 'General Cloud', auth: 'key_secret', icon: Cloud, color: 'text-blue-400', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'azure', name: 'Microsoft Azure', computeType: 'Classical', category: 'General Cloud', auth: 'key_secret', icon: Cloud, color: 'text-blue-600', badgeColor: 'bg-blue-600/10 text-blue-400 border-blue-600/20' },
  { id: 'nvidia', name: 'NVIDIA H100 / CUDA', computeType: 'Hybrid', category: 'GPU AI Compute', auth: 'api_key', icon: Zap, color: 'text-green-500', badgeColor: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { id: 'lambda', name: 'Lambda Labs', computeType: 'Hybrid', category: 'GPU AI Compute', auth: 'api_key', icon: Zap, color: 'text-purple-500', badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'coreweave', name: 'CoreWeave', computeType: 'Hybrid', category: 'GPU AI Compute', auth: 'api_key', icon: Zap, color: 'text-indigo-500', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'ibm_hpc', name: 'IBM HPC Cluster', computeType: 'Classical', category: 'Classic HPC', auth: 'ssh', icon: Server, color: 'text-blue-500', badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'oracle_hpc', name: 'Oracle Cloud HPC', computeType: 'Classical', category: 'Classic HPC', auth: 'key_secret', icon: Server, color: 'text-red-500', badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { id: 'ionq', name: 'IonQ Aria/Forte', computeType: 'Quantum', category: 'Quantum QPU', auth: 'api_key', icon: Cpu, color: 'text-cyan-400', badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  { id: 'pasqal', name: 'Pasqal (Neutral Atoms)', computeType: 'Quantum', category: 'Quantum QPU', auth: 'api_key', icon: Cpu, color: 'text-red-400', badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20' },
  { id: 'dwave', name: 'D-Wave (Annealing)', computeType: 'Quantum', category: 'Quantum QPU', auth: 'api_key', icon: Cpu, color: 'text-indigo-400', badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'quantinuum', name: 'Quantinuum', computeType: 'Quantum', category: 'Quantum QPU', auth: 'api_key', icon: Cpu, color: 'text-blue-300', badgeColor: 'bg-blue-300/10 text-blue-300 border-blue-300/20' },
]

export default function ProvidersPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [connectedProviders, setConnectedProviders] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string | null>(null)

  // ESTADO EXTENDIDO CON COST CONFIG
  const [formData, setFormData] = useState<any>({
    apiKey: '', apiSecret: '', clientId: '', clientSecret: '', endpoint: '',
    billing_type: 'on-demand',
    priority_level: 1,
    unit_price: '0.00',
    setup_fee: '0.00',
    deployment: 'Cloud'
  })

  const fetchProviders = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('providers')
      .select('*') // Seleccionamos todo para traer los costos
      .eq('user_id', user.id)

    if (data) setConnectedProviders(data)
  }

  useEffect(() => {
    fetchProviders()
  }, [supabase])

  const hasPrimary = useMemo(() => connectedProviders.some(p => p.priority_level === 1), [connectedProviders])
  const hasSecondary = useMemo(() => connectedProviders.some(p => p.priority_level === 2), [connectedProviders])

  const handleOpenConfig = async (provider: any) => {
    setSelectedProvider(provider)
    setErrors(null)
    setLoading(true)

    const existing = connectedProviders.find(p => p.provider_id === provider.id)

    if (existing) {
      setFormData({
        ...existing.credentials,
        billing_type: existing.billing_type || 'on-demand',
        priority_level: existing.priority_level || 1,
        unit_price: existing.unit_price || '0.00',
        setup_fee: existing.setup_fee || '0.00',
        deployment: existing.deployment || 'Cloud'
      })
    } else {
      const autoPriority = !hasPrimary ? 1 : 2;
      setFormData({
        apiKey: '', apiSecret: '', clientId: '', clientSecret: '',
        endpoint: '', billing_type: provider.computeType === 'Quantum' ? 'per-shot' : 'on-demand',
        priority_level: autoPriority,
        unit_price: '0.00',
        setup_fee: '0.00',
        deployment: 'Cloud'
      })
    }

    setLoading(false)
    setIsModalOpen(true)
  }

  const saveProvider = async () => {
    setErrors(null)
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { billing_type, priority_level, unit_price, setup_fee, deployment, ...credentials } = formData;

      if (priority_level === 1 && hasPrimary && !connectedProviders.find(p => p.provider_id === selectedProvider.id && p.priority_level === 1)) {
        throw new Error("A Primary provider already exists. Please set this as Secondary.")
      }

      const { error } = await supabase.from('providers').upsert({
        user_id: user.id,
        provider_id: selectedProvider.id,
        provider_name: selectedProvider.name,
        compute_type: selectedProvider.computeType,
        category: selectedProvider.category,
        auth_method: selectedProvider.auth,
        credentials: credentials,
        billing_type: billing_type,
        priority_level: parseInt(priority_level),
        unit_price: parseFloat(unit_price),
        setup_fee: parseFloat(setup_fee),
        deployment: deployment,
        status: 'online',
        is_enabled: true,
        last_used_at: new Date()
      }, { onConflict: 'user_id,provider_id' })

      if (error) throw error
      await fetchProviders()
      setIsModalOpen(false)
    } catch (err: any) {
      setErrors(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('providers').delete().eq('user_id', user.id).eq('provider_id', selectedProvider.id)
      setConnectedProviders(prev => prev.filter(p => p.provider_id !== selectedProvider.id))
      setIsDisconnectModalOpen(false)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">

        <Link href="/home" className="flex items-center text-slate-500 hover:text-white transition-colors group w-fit no-underline text-[10px] font-black uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Control Center
        </Link>

        <section className="space-y-6 text-left">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Infrastructure Inventory</h2>
            <p className="text-[11px] text-slate-500 uppercase font-bold tracking-widest mt-1">Manage your connected nodes and orchestrate high-fidelity workloads.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {PROVIDERS_CONFIG.map((p) => {
              const connection = connectedProviders.find(cp => cp.provider_id === p.id)
              const isConnected = !!connection

              return (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-900/30 border border-slate-800 rounded-xl hover:border-slate-700 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-2.5 rounded-lg bg-slate-950 border border-slate-800 group-hover:scale-105 transition-transform", p.color)}>
                      <p.icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 tracking-tight">{p.name}</span>
                        {isConnected && (
                          <div className="flex gap-1">
                            <Badge className={cn("text-[8px] font-black px-1.5 py-0 h-4", p.badgeColor)} variant="outline">ACTIVE</Badge>
                            <Badge className="text-[8px] font-bold px-1.5 py-0 h-4 border-slate-700 bg-slate-800 text-slate-300">
                              RANK: {connection.priority_level}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{p.category} • {p.computeType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white h-8 text-[10px] font-black uppercase" onClick={() => handleOpenConfig(p)}>
                          <Settings2 className="w-3.5 h-3.5 mr-2" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-red-400 h-8" onClick={() => { setSelectedProvider(p); setIsDisconnectModalOpen(true); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => handleOpenConfig(p)} variant="outline" size="sm" className="border-slate-800 hover:bg-slate-800 h-8 text-[10px] font-black uppercase tracking-widest px-4">Connect</Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* MODAL CONFIGURACIÓN */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#020617] border-slate-800 text-slate-200 sm:max-w-[480px] max-h-[90vh] overflow-y-auto font-sans">
          <DialogHeader className="text-left">
            <DialogTitle className="flex items-center gap-2 text-xl font-black italic uppercase tracking-tighter">
              <Settings2 className="w-5 h-5 text-blue-500" />
              {connectedProviders.some(cp => cp.provider_id === selectedProvider?.id) ? 'Manage' : 'Initialize'} Node
            </DialogTitle>
            <DialogDescription className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">
              Configuring <span className="text-white">{selectedProvider?.name}</span> • {selectedProvider?.computeType}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 text-left">

            {/* 1. AUTHENTICATION SECTION */}
            <div className="space-y-4">
              <Label className="text-[10px] uppercase font-black text-blue-500 tracking-[0.2em] flex items-center gap-2">
                Node Authentication <ShieldCheck className="w-3 h-3" />
              </Label>
              {selectedProvider?.auth === 'api_key' && (
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-500">API Key</Label>
                  <Input type="password" value={formData.apiKey} onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })} className="bg-slate-950 border-slate-800 focus:border-blue-500 h-11 italic" placeholder="sk-..." />
                </div>
              )}
              {selectedProvider?.auth === 'key_secret' && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Access Key / Client ID</Label>
                    <Input value={formData.apiKey} onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })} className="bg-slate-950 border-slate-800 h-11 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Secret Key</Label>
                    <Input type="password" value={formData.apiSecret} onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })} className="bg-slate-950 border-slate-800 h-11" />
                  </div>
                </div>
              )}
              {selectedProvider?.auth === 'ssh' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Host IP</Label>
                      <Input value={formData.endpoint} onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })} className="bg-slate-950 border-slate-800 h-11" placeholder="0.0.0.0" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-slate-500">Username</Label>
                      <Input value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} className="bg-slate-950 border-slate-800 h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">SSH Private Key</Label>
                    <Input type="password" value={formData.apiSecret} onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })} className="bg-slate-950 border-slate-800 h-11" />
                  </div>
                </div>
              )}
            </div>

            {/* 2. COST & PRIORITY CONFIGURATION */}
            <div className="space-y-4 pt-4 border-t border-slate-800/50">
              <Label className="text-[10px] uppercase font-black text-blue-500 tracking-[0.2em] flex items-center gap-2">
                Compute Strategy <Settings2 className="w-3 h-3" />
              </Label>

              <div className="grid grid-cols-2 gap-4">
                {/* PRIORITY LEVEL */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                    Priority Rank <Star className="w-3 h-3 text-yellow-500" />
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.priority_level}
                    onChange={(e) => setFormData({ ...formData, priority_level: parseInt(e.target.value) || 1 })}
                    className="bg-slate-950 border-slate-800 h-11 font-mono text-white focus:border-blue-500"
                  />
                  <p className="text-[9px] text-slate-500 italic">1 = Highest Priority</p>
                </div>

                {/* DEPLOYMENT */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-500">Deployment</Label>
                  <select
                    value={formData.deployment || 'CLOUD'}
                    onChange={(e) => setFormData({ ...formData, deployment: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md h-11 px-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer font-bold italic"
                  >
                    <option value="CLOUD">CLOUD</option>
                    <option value="ON-PREMISE">ON-PREMISE</option>
                    <option value="HYBRID">HYBRID</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* UNIT PRICE */}
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Unit Price ($)</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                      className="bg-slate-950 border-slate-800 h-11 font-mono text-green-400"
                    />
                  </div>

                  {/* SETUP FEE */}
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-slate-500">Setup Fee ($)</Label>
                    <Input
                      type="number"
                      value={formData.setup_fee}
                      onChange={(e) => setFormData({ ...formData, setup_fee: e.target.value })}
                      className="bg-slate-950 border-slate-800 h-11 font-mono text-white"
                    />
                  </div>
                </div>

                {/* BILLING TYPE */}
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-slate-500">Billing Type</Label>
                  <select
                    value={formData.billing_type}
                    onChange={(e) => setFormData({ ...formData, billing_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md h-11 px-3 text-sm text-slate-200 appearance-none cursor-pointer"
                  >
                    {selectedProvider?.computeType === 'Quantum' ? (
                      <>
                        <option value="Per Shot">Per Shot</option>
                        <option value="Per Task">Per Task</option>
                      </>
                    ) : (
                      <>
                        <option value="Per Minute">Per Minute</option>
                        <option value="Per Second">Per Second</option>
                        <option value="On-Demand">On-Demand</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>



            {errors && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-2">!! Error: {errors}</p>}
          </div>

          <DialogFooter className="gap-2 pt-6 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white">Cancel</Button>
            <Button onClick={saveProvider} disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] px-8 h-12 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Connect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL DISCONNECT (Mantenido igual) */}
      <Dialog open={isDisconnectModalOpen} onOpenChange={setIsDisconnectModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 font-sans">
          <DialogHeader className="text-left">
            <DialogTitle className="text-red-500 flex items-center gap-2 font-black italic uppercase tracking-tighter">
              <ShieldAlert className="w-5 h-5" /> Disconnect Node?
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
              This action will revoke QEOX access to <span className="text-white">{selectedProvider?.name}</span>. Ongoing executions may be interrupted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-6">
            <Button variant="ghost" onClick={() => setIsDisconnectModalOpen(false)} className="text-[10px] font-black uppercase text-slate-500">Abort</Button>
            <Button onClick={handleDisconnect} disabled={loading} className="bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest px-6">Remove Access</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}