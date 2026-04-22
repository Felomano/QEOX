import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  ShieldCheck,
  Calendar,
  Cpu,
  ChevronRight,
  Fingerprint,
  ChevronLeft,
  DollarSign
} from 'lucide-react';

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default async function EngineAnalysesPage() {
  const supabase = createClient();

  const { data: analyses } = await supabase
    .from('engine_analyses')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#02040a] text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* TOP NAVIGATION & HEADER */}
        <header className="space-y-6">
          <Link
            href="/home"
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <ChevronLeft size={14} /> Back to Home
          </Link>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 rounded-lg">
                <BrainCircuit className="text-violet-500" size={20} />
              </div>
              <span className="text-[10px] font-black text-violet-400 tracking-[0.4em] uppercase">Intelligence Hub</span>
            </div>
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter">
              Engine <span className="text-violet-600">Insights</span>
            </h1>
            <p className="text-slate-500 max-w-2xl font-medium">
              Visualiza el impacto económico y la eficiencia operativa de tus análisis de optimización cuántica
            </p>
          </div>
        </header>

        {/* LISTADO DE ANÁLISIS */}
        <div className="grid gap-4">
          {analyses && analyses.length > 0 ? (
            analyses.map((item) => {
              // Extraemos el ahorro del payload o de las métricas de salida
              const monthlySaving = item.output_data?.performance_metrics?.monthly_savings_usd ||
                item.ui_payload?.performance_insights?.monthly_savings || 0;

              return (
                <Link
                  key={item.id}
                  href={`/decide/${item.id}`}
                  className="group relative bg-[#0a0c14] border border-white/5 hover:border-violet-500/40 p-6 rounded-[24px] transition-all overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                    {/* INFO PROYECTO */}
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/5 rounded-xl text-slate-400 group-hover:text-violet-400 transition-colors">
                        <Fingerprint size={24} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest">
                            {item.industry || 'Workload Analysis'}
                          </span>
                          {item.hot_swap_mode && (
                            <span className="flex items-center gap-1 text-[8px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md border border-amber-500/20 font-black">
                              <ShieldCheck size={10} /> RESILIENCE ACTIVE
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-slate-200 group-hover:text-white transition-colors uppercase italic tracking-tight">
                          {item.workload_id || `ANALYSIS_${item.id.slice(0, 6)}`}
                        </h3>
                        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDate(item.created_at)}</span>
                          <span className="flex items-center gap-1.5"><Cpu size={12} /> {item.execution_type || 'Standard'}</span>
                        </div>
                      </div>
                    </div>

                    {/* MÉTRICAS: AHORRO Y VENTAJA */}
                    <div className="flex items-center justify-between lg:justify-end gap-8 lg:gap-12 border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">

                      <div className="text-left lg:text-right">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Monthly Savings</p>
                        <p className="text-emerald-400 font-black text-xl italic tracking-tighter">
                          ${monthlySaving.toLocaleString()}
                        </p>
                      </div>

                      <div className="text-left lg:text-right">
                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Quantum Gain</p>
                        <p className="text-violet-400 font-black text-xl italic tracking-tighter">
                          {item.ui_payload?.performance_insights?.savings?.display || '+0.00%'}
                        </p>
                      </div>

                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-violet-600 group-hover:border-violet-500 transition-all shadow-xl">
                        <ChevronRight size={20} className="text-slate-400 group-hover:text-white" />
                      </div>
                    </div>

                  </div>
                </Link>
              );
            })
          ) : (
            <div className="border-2 border-dashed border-slate-900 p-20 rounded-[32px] text-center">
              <p className="text-slate-600 font-mono text-sm uppercase tracking-widest">No previous simulations found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}