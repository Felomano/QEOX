"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from "sonner";
import { Rocket, Server, Cpu, Zap, Loader2, Globe, Activity, Atom, ShieldCheck } from 'lucide-react';

export default function NewWorkloadPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fetchingProviders, setFetchingProviders] = useState(true);

  // Estados de datos
  const [allProviders, setAllProviders] = useState<any[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
  
  // Estados del Formulario
  const [tier, setTier] = useState<'classic' | 'hybrid' | 'quantum'>('hybrid');
  const [flavor, setFlavor] = useState('');
  const [workloadName, setWorkloadName] = useState('PROYECTO-QEOX-ALPHA');

  // 1. CARGAR PROVEEDORES DESDE SUPABASE
  useEffect(() => {
    const fetchProviders = async () => {
      setFetchingProviders(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('is_active', true);

      if (error) {
        toast.error("Error cargando proveedores");
      } else {
        setAllProviders(data || []);
      }
      setFetchingProviders(false);
    };
    fetchProviders();
  }, [supabase]);

  // 2. FILTRAR POR TIER
  useEffect(() => {
    const filtered = allProviders.filter(p => p.tier === tier);
    setFilteredProviders(filtered);
    if (filtered.length > 0) {
      setFlavor(filtered[0].provider_id);
    } else {
      setFlavor('');
    }
  }, [tier, allProviders]);

  const handleLaunch = async () => {
    if (!workloadName) return toast.error("Por favor, dale un nombre al workload");
    if (!flavor) return toast.error("Selecciona un proveedor activo");
    
    setLoading(true);
    try {
      const { data: workload, error: wError } = await supabase
        .from('workloads')
        .insert([{ workload_name: workloadName, problem_type: 'optimization', company_name: 'DHL' }])
        .select().single();

      if (wError) throw wError;

      const { data: job, error: jError } = await supabase
        .from('jobs')
        .insert([{ workload_id: workload.id, status: 'orchestrating', tier, flavor, priority: 'cost' }])
        .select().single();

      if (jError) throw jError;

      // Llamada al Webhook de n8n
      fetch('http://135.181.86.147/webhook/run-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: job.id, workload_id: workload.id }),
      });

      toast.success("¡Orquestación iniciada!");
      router.push(`/execution/${job.id}`);
    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-slate-300 p-4 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: CONFIGURACIÓN */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Atom className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">QEOX <span className="text-blue-500 font-light italic">Orchestrator</span></h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-mono">New Infrastructure Workload</p>
            </div>
          </div>

          {/* Alias Input */}
          <div className="bg-[#0f0f12] border border-white/5 rounded-2xl p-6 space-y-4">
            <label className="text-[11px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-blue-500" /> Workload Identifier
            </label>
            <input 
              className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-blue-400 focus:border-blue-500 outline-none transition-all font-mono"
              value={workloadName}
              onChange={(e) => setWorkloadName(e.target.value)}
            />
          </div>

          {/* Tier Selector */}
          <div className="grid grid-cols-3 gap-4">
            {(['classic', 'hybrid', 'quantum'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`py-6 border rounded-2xl transition-all relative overflow-hidden ${
                  tier === t ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'border-white/5 bg-white/[0.02] opacity-40 hover:opacity-100'
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest relative z-10">{t}</span>
                {tier === t && <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent" />}
              </button>
            ))}
          </div>

          {/* Dynamic Providers List */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">Available Nodes ({tier})</label>
              {fetchingProviders && <Loader2 className="animate-spin text-blue-500" size={14} />}
            </div>
            
            <div className="grid gap-3">
              {filteredProviders.length > 0 ? (
                filteredProviders.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => setFlavor(p.provider_id)}
                    className={`p-5 border rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                      flavor === p.provider_id ? 'border-blue-500 bg-blue-500/5 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${flavor === p.provider_id ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500'}`}>
                        <Server size={20} />
                      </div>
                      <div>
                        <span className="text-sm font-bold text-white block">{p.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">{p.region || 'Global Infrastructure'}</span>
                      </div>
                    </div>
                    {flavor === p.provider_id && <Zap size={18} className="text-blue-500 fill-blue-500 animate-pulse" />}
                  </div>
                ))
              ) : (
                <div className="p-10 border border-dashed border-white/10 rounded-2xl text-center text-slate-600 text-xs">
                  Awaiting synchronization with Supabase nodes...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: STATUS & ACTION */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-[0_20px_50px_-15px_rgba(37,99,235,0.5)] flex flex-col justify-between min-h-[400px]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">Estimated Cost</p>
              <h2 className="text-6xl font-black mt-2 tracking-tighter">$0.00 <span className="text-sm opacity-60">USD</span></h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
                  <span>Org. Budget Capacity</span>
                  <span>$NAN</span>
                </div>
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-white shadow-[0_0_10px_white]" />
                </div>
              </div>

              <button 
                onClick={handleLaunch}
                disabled={loading || fetchingProviders || !flavor}
                className="w-full py-6 bg-white text-blue-600 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 shadow-xl"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Rocket size={20} />}
                {loading ? "Orchestrating..." : "Execute Job"}
              </button>
              
              <div className="flex items-center justify-center gap-2 text-[9px] uppercase font-bold opacity-70 italic">
                <ShieldCheck size={12} /> Seleccione un proveedor de infraestructura
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f12] border border-white/5 rounded-2xl p-6">
             <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
               <span className="text-blue-500 mr-2">●</span> 
               La IA de n8n optimizará la ruta de hardware basándose en el objetivo científico/matemático descrito.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}
