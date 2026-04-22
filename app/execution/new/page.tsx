"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from "sonner";
import { Rocket, Server, Cpu, Zap, Loader2, Globe } from 'lucide-react';

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
  const [workloadName, setWorkloadName] = useState('');

  // 1. CARGAR PROVEEDORES ACTIVOS DESDE SUPABASE
  useEffect(() => {
    const fetchProviders = async () => {
      setFetchingProviders(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('is_active', true); // Solo los que están activos

      if (error) {
        toast.error("Error cargando proveedores");
      } else {
        setAllProviders(data || []);
      }
      setFetchingProviders(false);
    };

    fetchProviders();
  }, []);

  // 2. FILTRAR PROVEEDORES CUANDO CAMBIA EL TIER
  useEffect(() => {
    const filtered = allProviders.filter(p => p.tier === tier);
    setFilteredProviders(filtered);
    
    // Seleccionar el primero por defecto si hay resultados
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
      // PASO 1: INSERT EN WORKLOADS
      const { data: workload, error: wError } = await supabase
        .from('workloads')
        .insert([{
          workload_name: workloadName,
          problem_type: 'optimization',
          company_name: 'DHL'
        }])
        .select()
        .single();

      if (wError) throw wError;

      // PASO 2: INSERT EN JOBS
      const { data: job, error: jError } = await supabase
        .from('jobs')
        .insert([{
          workload_id: workload.id,
          status: 'orchestrating',
          tier: tier,
          flavor: flavor,
          priority: 'cost'
        }])
        .select()
        .single();

      if (jError) throw jError;

      // PASO 3: LLAMADA A N8N
      fetch('http://135.181.86.147/webhook/run-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          job_id: job.id,
          workload_id: workload.id
        }),
      });

      toast.success("¡Orquestación iniciada!");
      router.push(`/execution/${job.id}`);

    } catch (err: any) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-12 font-mono">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold tracking-tighter italic">NEW QEOX WORKLOAD</h1>

        {/* Alias */}
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest">Workload Alias</label>
          <input 
            className="w-full bg-slate-900 border border-slate-800 p-3 rounded focus:border-blue-500 outline-none transition-all"
            placeholder="EJ: OPTIMIZATION-GEN-01"
            value={workloadName}
            onChange={(e) => setWorkloadName(e.target.value)}
          />
        </div>

        {/* Tiers */}
        <div className="grid grid-cols-3 gap-4">
          {(['classic', 'hybrid', 'quantum'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`p-4 border rounded text-center transition-all ${
                tier === t ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-900 opacity-50'
              }`}
            >
              <p className="text-[10px] font-bold uppercase">{t}</p>
            </button>
          ))}
        </div>

        {/* Listado Dinámico de Proveedores */}
        <div className="space-y-4">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest">Active Providers ({tier})</label>
          <div className="grid grid-cols-1 gap-2">
            {fetchingProviders ? (
              <div className="flex items-center gap-2 text-slate-500 text-sm"><Loader2 className="animate-spin" size={14}/> Sincronizando catálogo...</div>
            ) : filteredProviders.length > 0 ? (
              filteredProviders.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => setFlavor(p.provider_id)}
                  className={`p-4 border flex items-center justify-between cursor-pointer rounded transition-all ${
                    flavor === p.provider_id ? 'border-blue-500 bg-slate-900' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Server size={16} className={flavor === p.provider_id ? 'text-blue-500' : 'text-slate-500'} />
                    <div>
                      <span className="text-sm font-bold block">{p.name}</span>
                      <span className="text-[10px] text-slate-500">{p.region || 'Global'}</span>
                    </div>
                  </div>
                  {flavor === p.provider_id && <Zap size={14} className="text-blue-500 fill-blue-500" />}
                </div>
              ))
            ) : (
              <div className="p-4 border border-dashed border-slate-800 text-slate-600 text-xs text-center">
                No hay proveedores activos para este tier en la base de datos.
              </div>
            )}
          </div>
        </div>

        {/* Botón de Lanzamiento */}
        <button 
          onClick={handleLaunch}
          disabled={loading || fetchingProviders || !flavor}
          className="w-full py-4 bg-white text-black font-bold uppercase text-xs flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Rocket size={16} />}
          {loading ? "Orchestrating..." : "Launch Execution"}
        </button>
      </div>
    </div>
  );
}
