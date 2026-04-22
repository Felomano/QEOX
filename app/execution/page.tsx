'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Zap, CheckCircle2, ChevronRight,
  Play, Cpu, Box, Sparkles, X
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Componente interno que maneja la lógica de la URL
function ExecutionContent() {
  const searchParams = useSearchParams()
  const [recommendedConfig, setRecommendedConfig] = useState<any>(null)
  const [showDeployModal, setShowDeployModal] = useState(false)

  // 1. Detectar si venimos de un Insight de QNEX
  useEffect(() => {
    const infra = searchParams.get('infra')
    const provider = searchParams.get('provider')
    const algo = searchParams.get('algo')

    if (infra && provider && algo) {
      setRecommendedConfig({ infra, provider, algo })
      setShowDeployModal(true) // Abrimos el modal de confirmación automáticamente
    }
  }, [searchParams])

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      <header className="flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic text-left">
            Execution <span className="text-blue-500">Engine</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 text-left">
            Real-time Workload Orchestration
          </p>
        </div>

        <Button
          asChild
          className="bg-white text-black hover:bg-slate-200 font-bold px-6 rounded-full text-xs uppercase transition-all active:scale-95 cursor-pointer"
        >
          <Link href="/execution/new">
            <Plus className="w-4 h-4 mr-2" /> New Job
          </Link>
        </Button>
      </header>

      {/* MODAL DE DESPLIEGUE RÁPIDO */}
      {showDeployModal && recommendedConfig && (
        <Card className="bg-blue-600 border-none p-8 rounded-[32px] relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.2)] animate-in fade-in zoom-in duration-300">
          <button
            onClick={() => setShowDeployModal(false)}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-20"
          >
            <X size={20} />
          </button>

          <div className="relative z-10 text-left">
            <div className="flex items-center gap-2 text-blue-100 font-black text-[10px] uppercase tracking-[0.3em] mb-4">
              <Sparkles size={14} /> Optimization Ready
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Deploy Recommended Workload?</h2>
            <p className="text-blue-100/80 text-sm mb-6 max-w-md font-medium leading-relaxed">
              We've pre-configured the environment using <b className="text-white">{recommendedConfig.provider}</b> with the <b className="text-white">{recommendedConfig.algo}</b> algorithm for maximum efficiency.
            </p>

            <div className="flex gap-4">
              <Button
                className="bg-white text-blue-600 hover:bg-blue-50 font-black px-8 rounded-full shadow-lg transition-transform active:scale-95"
                onClick={() => {
                  console.log("Desplegando...", recommendedConfig)
                  setShowDeployModal(false)
                }}
              >
                START EXECUTION
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 font-bold px-6 rounded-full transition-colors"
                onClick={() => setShowDeployModal(false)}
              >
                Review Details
              </Button>
            </div>
          </div>
          <Zap className="absolute -bottom-10 -right-10 h-64 w-64 text-white/10 -rotate-12 pointer-events-none" />
        </Card>
      )}

      {/* LISTA DE WORKLOADS */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 text-left">Active Workloads</h3>
        <div className="space-y-3">
          <WorkloadCard
            id="route-opt-01"
            name="Route Optimization"
            status="Running"
            type="Hybrid Quantum • IonQ"
            progress={65}
            cost="$110"
            savings="42%"
          />
          <WorkloadCard
            id="mol-dock-02"
            name="Molecular Docking"
            status="Queued"
            type="Quantum • Rigetti"
            progress={0}
            cost="$450"
            savings="12%"
          />
        </div>
      </section>
    </div>
  )
}

// Componente principal con Suspense
export default function ExecutionPage() {
  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 p-8">
      <Suspense fallback={
        <div className="flex items-center justify-center h-[50vh] text-blue-500 font-mono tracking-widest animate-pulse uppercase italic">
          Synchronizing Execution Engine...
        </div>
      }>
        <ExecutionContent />
      </Suspense>
    </div>
  )
}

// --- SUBCOMPONENTES ---

function WorkloadCard({ id, name, status, type, progress, cost, savings }: any) {
  const isRunning = status === 'Running'
  return (
    <Link href={`/execution/${id || '123'}`}>
      <Card className={cn(
        "bg-white/[0.03] border-white/5 p-6 rounded-[24px] hover:bg-white/[0.06] transition-all cursor-pointer group border-l-4 text-left mb-3",
        isRunning ? "border-l-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.02)]" : "border-l-slate-800"
      )}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-xl bg-black border border-white/5 transition-colors",
              isRunning ? "text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "text-slate-600"
            )}>
              {isRunning ? <Zap size={20} /> : <Box size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-white uppercase tracking-tight italic text-base">{name}</h4>
                <Badge className={cn(
                  "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border-none",
                  isRunning ? "bg-blue-500 text-white animate-pulse" : "bg-slate-800 text-slate-500"
                )}>
                  {status}
                </Badge>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-widest">{type}</p>
            </div>
          </div>

          <div className="flex-1 max-w-xs space-y-2">
            <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
              <span>Progress</span>
              <span className="text-white">{progress}%</span>
            </div>
            <div className="h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
              <div
                className={cn("h-full transition-all duration-1000 ease-out", isRunning ? "bg-blue-500" : "bg-slate-700")}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Real-time Cost</p>
              <p className="text-sm font-black text-white italic">
                {cost} <span className="text-emerald-500 text-[10px] ml-1 font-bold">-{savings}</span>
              </p>
            </div>
            <ChevronRight className="text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" size={20} />
          </div>
        </div>
      </Card>
    </Link>
  )
}

function Plus(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}