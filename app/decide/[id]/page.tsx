'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  FileJson, FileSpreadsheet, Zap, Database, ArrowUpRight, Activity,
  Brain, Clock, DollarSign, Info, Play, Leaf, TrendingUp, Cpu,
  Terminal, Truck, HeartPulse, ShieldCheck, Factory, Box, User,
  ChevronLeft, Plus
} from 'lucide-react'

// --- CONSTANTES ---
const descriptions: Record<string, string> = {
  "Quantum Advantage": "Efficiency score of quantum processing over traditional methods.",
  "Recommended Algorithm": "Mathematical model optimized to solve your constraints.",
  "Estimated Job Time": "Predicted time from execution start to result retrieval.",
  "Monthly Savings": "Net financial optimization achieved.",
  "Potential Speedup": "Acceleration factor vs standard CPU clusters.",
  "Carbon Reduction": "Estimated CO2 footprint offset.",
  "Cost Efficiency Gain": "Percentage of capital saved vs classical baseline."
};

const Tooltip = ({ text }: { text: string }) => (
  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/tip:block w-48 p-2 bg-slate-800 text-[10px] text-slate-200 rounded-lg border border-white/10 shadow-xl z-50 pointer-events-none">
    {text}
    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
  </div>
);

const getSectorIcon = (domain: string) => {
  const d = domain?.toLowerCase() || "";
  if (d.includes("finan")) return <TrendingUp size={14} className="text-blue-400" />;
  if (d.includes("logis")) return <Truck size={14} className="text-blue-400" />;
  if (d.includes("health")) return <HeartPulse size={14} className="text-blue-400" />;
  if (d.includes("secu")) return <ShieldCheck size={14} className="text-blue-400" />;
  if (d.includes("manuf")) return <Factory size={14} className="text-blue-400" />;
  return <Box size={14} className="text-blue-400" />;
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [isError, setIsError] = useState(false)
  const { id } = useParams()
  const router = useRouter()

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const supabase = createClient()
        const { data: dbData, error } = await supabase
          .from('engine_analyses')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !dbData) throw new Error("No data found")
        const raw = dbData.output_data
        setData(raw.output || raw.data || raw)
      } catch (err) {
        setIsError(true)
      }
    }
    if (id) fetchAnalysis()
  }, [id])

  // --- LÓGICA DE EXPORTACIÓN ---
  const exportData = (type: 'json' | 'csv') => {
    if (!data) return
    const filename = `QEOX-Analysis-${id?.toString().slice(0, 8)}`

    if (type === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${filename}.json`; a.click()
    } else {
      const metrics = data.performance_metrics || {}
      const roadmap = data.infrastructure_decision?.optimization_roadmap || {}
      const csvRows = [
        ["Metric", "Value"],
        ["Quantum Advantage", `${data.quantum_advantage_score}%`],
        ["Algorithm", data.algorithm],
        ["Monthly Savings", metrics.monthly_savings_usd],
        ["Current Infrastructure", roadmap.current?.infrastructure],
        ["Current Cost", roadmap.current?.cost],
        ["Optimized Infrastructure", roadmap.optimized?.infrastructure],
        ["Optimized Cost", roadmap.optimized?.cost]
      ]
      const content = csvRows.map(r => r.join(",")).join("\n")
      const blob = new Blob([content], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${filename}.csv`; a.click()
    }
  }

  if (isError) return <div className="min-h-screen bg-[#05070a] flex items-center justify-center text-red-500 font-mono italic">CONNECTION ERROR</div>
  if (!data) return <div className="min-h-screen bg-[#05070a] flex items-center justify-center text-blue-500 font-mono animate-pulse uppercase tracking-[0.4em]">Syncing QEOX Engine...</div>

  const roadmap = data.infrastructure_decision?.optimization_roadmap || {}

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* TOP NAV BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => router.push('/decide')}
              variant="ghost"
              className="w-fit text-slate-500 hover:text-white p-0 h-auto gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <ChevronLeft size={14} /> Back to Decide
            </Button>
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">QEOX <span className="text-blue-500">Insights</span></h1>
                <p className="text-[9px] uppercase tracking-[0.3em] text-slate-600 font-bold leading-none">Node: {id?.toString().slice(0, 16)}</p>
              </div>
              <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                {getSectorIcon(data.normalized_problem?.domain || "")}
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">
                  {data.normalized_problem?.domain || "General"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.push('/engine')} className="bg-white text-black hover:bg-slate-200 text-[10px] font-black uppercase tracking-widest gap-2 h-10 px-6 rounded-full">
              <Plus size={14} /> New Analysis
            </Button>
            <Button onClick={() => exportData('json')} variant="outline" className="bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest gap-2 h-10 hover:bg-white/10">
              <FileJson size={14} className="text-blue-400" /> Export JSON
            </Button>
            <Button onClick={() => exportData('csv')} variant="outline" className="bg-white/5 border-white/10 text-[10px] font-black uppercase tracking-widest gap-2 h-10 hover:bg-white/10">
              <FileSpreadsheet size={14} className="text-emerald-400" /> Export CSV
            </Button>
          </div>
        </div>

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard title="Quantum Advantage" value={`${data.quantum_advantage_score}%`} icon={<Activity className="text-blue-500" />} />
          <KPICard title="Recommended Algorithm" value={data.algorithm || "QAOA"} icon={<Brain className="text-emerald-500" />} />
          <KPICard title="Estimated Job Time" value={roadmap.optimized?.time || "18s"} icon={<Clock className="text-blue-400" />} />
          <KPICard title="Monthly Savings" value={`$${(data.performance_metrics?.monthly_savings_usd || 0).toLocaleString()}`} icon={<DollarSign className="text-emerald-400" />} />
        </div>

        {/* TECHNICAL INSIGHT BLOCK */}
        {data.technical_insight && (
          <div className="bg-blue-600/5 border border-blue-500/20 rounded-[24px] p-6 flex items-start gap-5">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Terminal size={20} />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-2">System Insight</h3>
              <p className="text-sm font-medium text-slate-300 leading-relaxed italic">"{data.technical_insight}"</p>
            </div>
          </div>
        )}

        {/* ROADMAP TABLE */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-blue-500/50"></div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 font-bold">Optimization Roadmap</h2>
          </div>

          <div className="bg-[#0c0f14]/80 border border-white/5 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] uppercase tracking-widest text-slate-500 font-bold border-b border-white/5">
                    <th className="py-7 px-10">Infrastructure Level</th>
                    <th className="py-7 px-6">Provider</th>
                    <th className="py-7 px-6">Execution Time</th>
                    <th className="py-7 px-6">Monthly Cost</th>
                    <th className="py-7 px-10">Strategic Outcome</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {/* CURRENT */}
                  <tr className="opacity-40 hover:opacity-100 transition-opacity border-b border-white/5">
                    <td className="py-7 px-10"><div className="flex items-center gap-4 font-bold uppercase"><Database size={18} /> {roadmap.current?.infrastructure}</div></td>
                    <td className="py-7 px-6 italic">{roadmap.current?.provider}</td>
                    <td className="py-7 px-6 font-mono">{roadmap.current?.time}</td>
                    <td className="py-7 px-6 font-bold">${roadmap.current?.cost?.toLocaleString()}</td>
                    <td className="py-7 px-10 italic text-[11px]">{roadmap.current?.outcome}</td>
                  </tr>

                  {/* ENHANCED */}
                  <tr className="bg-white/[0.01] border-b border-white/5">
                    <td className="py-8 px-10 font-black italic text-emerald-400 flex items-center gap-4 uppercase"><Cpu size={18} /> Enhanced HPC</td>
                    <td className="py-8 px-6 italic text-slate-400">{roadmap.enhanced?.provider}</td>
                    <td className="py-8 px-6 font-black">{roadmap.enhanced?.time}</td>
                    <td className="py-8 px-6 font-black">${roadmap.enhanced?.cost?.toLocaleString()}</td>
                    <td className="py-8 px-10 italic text-slate-400 text-[11px]">{roadmap.enhanced?.outcome}</td>
                  </tr>

                  {/* OPTIMIZED */}
                  <tr className="bg-blue-600/[0.07] border-l-4 border-blue-600">
                    <td className="py-10 px-10">
                      <div className="flex items-center gap-5">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)]"><Zap size={22} fill="white" /></div>
                        <div className="font-black text-white italic text-xl uppercase tracking-tighter">Quantum Hybrid</div>
                      </div>
                    </td>
                    <td className="py-10 px-6 font-black text-blue-400 underline decoration-blue-500/40 text-base">{roadmap.optimized?.provider}</td>
                    <td className="py-10 px-6 font-black text-blue-400 text-xl flex items-center gap-2"><ArrowUpRight size={20} /> {roadmap.optimized?.time}</td>
                    <td className="py-10 px-6 font-black text-white text-3xl">${roadmap.optimized?.cost?.toLocaleString()}</td>
                    <td className="py-10 px-10 italic font-bold text-slate-300 text-xs">"{roadmap.optimized?.outcome}"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* BOTTOM BENEFITS */}
        <section className="pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-12">
          <BenefitItem title="Potential Speedup" value={data.performance_metrics?.speedup || "92.5x"} sub="Target" icon={<ArrowUpRight className="text-blue-500" />} />
          <BenefitItem title="Carbon Reduction" value={data.performance_metrics?.carbon_reduction_t || "1.2t"} sub="Tonnes/Year" icon={<Leaf className="text-emerald-500" />} />
          <BenefitItem title="Cost Efficiency Gain" value={`${data.performance_metrics?.efficiency_gain || 85}%`} sub="vs Baseline" icon={<TrendingUp className="text-blue-500" />} />
        </section>

        <div className="flex justify-center pt-8">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black px-14 py-8 rounded-full text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_50px_-10px_rgba(37,99,235,0.5)] transition-all hover:scale-105 gap-3">
            Deploy Infrastructure <Play size={12} fill="currentColor" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, icon }: any) {
  return (
    <Card className="bg-[#0c0f14] border-white/5 p-8 rounded-[32px] group relative h-full transition-all hover:border-white/10">
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-2 relative group/tip">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{title}</span>
            <Info size={13} className="text-slate-700 cursor-help hover:text-slate-500 transition-colors" />
            <Tooltip text={descriptions[title] || "Metric details"} />
          </div>
          <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-500/10 transition-colors">{icon}</div>
        </div>
        <div className="text-4xl font-black text-white tracking-tighter leading-none">{value}</div>
      </div>
    </Card>
  )
}

function BenefitItem({ title, value, sub, icon }: any) {
  return (
    <div className="flex items-center gap-6 group text-left">
      <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-blue-500/10 transition-colors">{icon}</div>
      <div>
        <div className="flex items-center gap-2 relative group/tip mb-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{title}</p>
          <Info size={11} className="text-slate-700 cursor-help" />
          <Tooltip text={descriptions[title] || "Metric details"} />
        </div>
        <div className="flex items-baseline gap-2 leading-none">
          <span className="text-4xl font-extrabold text-white tracking-tighter">{value}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase">{sub}</span>
        </div>
      </div>
    </div>
  )
}