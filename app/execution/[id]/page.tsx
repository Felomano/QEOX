'use client'

import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft, Zap, Activity, Clock,
  TrendingDown, Terminal, DollarSign, ShieldCheck, Briefcase, BarChart3
} from 'lucide-react'

export default function WorkloadDetails({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header con datos de la imagen */}
        <header className="flex justify-between items-start">
          <div className="space-y-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <ChevronLeft size={14} /> Back
            </button>
            <div className="text-left">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                  Portfolio <span className="text-blue-500">Optimization</span>
                </h1>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest italic">
                  Status: Completed
                </Badge>
              </div>
              <div className="flex gap-6 mt-3">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Job ID: <span className="text-slate-300">job_1654321</span>
                </p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Industry: <span className="text-slate-300 italic">Finance</span>
                </p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Workload: <span className="text-slate-300 italic">w_001</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="border-white/5 bg-white/5 text-white font-black text-[10px] uppercase tracking-widest rounded-full h-10 px-6">
              Download Report
            </Button>
            <Button className="bg-blue-600 text-white hover:bg-blue-500 border-none font-black text-[10px] uppercase tracking-widest rounded-full h-10 px-6">
              Re-run Job
            </Button>
          </div>
        </header>

        {/* PERFORMANCE INSIGHTS (Métricas de la imagen) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Real Cost', val: '$120', icon: DollarSign, sub: 'Flexible Tier', color: 'text-blue-500' },
            { label: 'Execution Time', val: '4.5 hrs', icon: Clock, sub: 'Duration: 15 min', color: 'text-orange-500' },
            { label: 'Projected Savings', val: '$250,000', icon: TrendingDown, sub: 'Efficiency Gain', color: 'text-orange-400' },
            { label: 'Efficiency Score', val: '48%', icon: BarChart3, sub: 'Quantum Boosted', color: 'text-emerald-500' }
          ].map((m, i) => (
            <Card key={i} className="bg-white/[0.02] border-white/5 p-6 rounded-[28px] text-left">
              <m.icon size={18} className={cn(m.color, "mb-4")} />
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.label}</p>
              <h3 className="text-2xl font-black text-white mt-1 italic leading-tight">{m.val}</h3>
              <p className="text-[9px] font-bold text-slate-600 uppercase mt-1">{m.sub}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SECCIÓN IZQUIERDA: Execution Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/[0.02] border-white/5 p-8 rounded-[32px] space-y-6">
              <h4 className="text-xs font-black text-blue-500 uppercase tracking-[0.4em]">Execution Details</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Provider', val: 'IonQ' },
                  { label: 'Execution Type', val: 'Quantum' },
                  { label: 'Hot Swap Mode', val: 'Cross-Provider' },
                  { label: 'Billing', val: 'Flexible (Free Tier)' },
                  { label: 'Duration', val: '15 min' }
                ].map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
                    <span className="text-[11px] font-black text-slate-200 italic">{item.val}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* SECCIÓN DERECHA: Execution Log de la imagen */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black border-white/10 rounded-[32px] overflow-hidden flex flex-col h-full border">
              <div className="bg-white/[0.03] p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Execution Log</span>
                </div>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">IonQ Node: 0.4.2</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                      <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Event</th>
                      <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Provider</th>
                      <th className="p-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Details</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-[10px]">
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-slate-500">10:32 AM</td>
                      <td className="p-4 text-white font-bold">Workload Started</td>
                      <td className="p-4 text-blue-400">IonQ</td>
                      <td className="p-4 text-slate-400 italic">Job initiated</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-slate-500">10:35 AM</td>
                      <td className="p-4 text-white font-bold">Data Processing</td>
                      <td className="p-4 text-blue-400">IonQ</td>
                      <td className="p-4 text-slate-400 italic">Quantum execution in progress</td>
                    </tr>
                    <tr className="border-b border-white/5">
                      <td className="p-4 text-slate-500">10:47 AM</td>
                      <td className="p-4 text-emerald-400 font-bold">Job Completed</td>
                      <td className="p-4 text-blue-400">IonQ</td>
                      <td className="p-4 text-slate-400 italic">Results ready, optimization achieved</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Resumen Final de la Imagen */}
              <div className="p-6 bg-blue-500/5 mt-auto border-t border-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-500" size={20} />
                  <div>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Summary: Insight</p>
                    <p className="text-[10px] text-slate-400 italic">Cross-provider optimization successful. Final Provider: IonQ (via Hot Swap)</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Función auxiliar simple para condicionales de clase
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}