"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from "sonner";
import { 
    Rocket, Server, Cpu, Zap, Loader2, Globe, 
    Activity, Atom, ShieldCheck, Terminal, Clock, Coins, CheckCircle2 
} from 'lucide-react';

export default function NewWorkloadPage() {
    const router = useRouter();
    const supabase = createClient();
    
    // Estados de UI/Carga
    const [loading, setLoading] = useState(false);
    const [fetchingProviders, setFetchingProviders] = useState(true);

    // Estados de Datos de Supabase
    const [allProviders, setAllProviders] = useState<any[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
    
    // Estados del Formulario (Configuración de Trabajo)
    const [tier, setTier] = useState<'classic' | 'hybrid' | 'quantum'>('hybrid');
    const [flavor, setFlavor] = useState('');
    const [workloadName, setWorkloadName] = useState('QUBIT-OPTIMIZER-ALPHA');
    const [priority, setPriority] = useState<'speed' | 'cost'>('speed');

    // 1. CARGAR PROVEEDORES DESDE SUPABASE
    useEffect(() => {
        const fetchProviders = async () => {
            setFetchingProviders(true);
            const { data, error } = await supabase
                .from('providers')
                .select('*')
                .eq('is_active', true);

            if (error) {
                toast.error("Error al sincronizar con los nodos de infraestructura");
            } else {
                setAllProviders(data || []);
            }
            setFetchingProviders(false);
        };
        fetchProviders();
    }, [supabase]);

    // 2. FILTRAR NODOS SEGÚN EL TIER SELECCIONADO
    useEffect(() => {
        const filtered = allProviders.filter(p => p.tier === tier);
        setFilteredProviders(filtered);
        // Autoseleccionar el primer nodo disponible del nuevo tier
        if (filtered.length > 0) {
            setFlavor(filtered[0].provider_id);
        } else {
            setFlavor('');
        }
    }, [tier, allProviders]);

    // 3. LÓGICA DE LANZAMIENTO (SUPABASE + N8N)
    const handleLaunch = async () => {
        if (!workloadName) return toast.error("Por favor, asigne un identificador al workload");
        if (!flavor) return toast.error("Seleccione un nodo de procesamiento activo");
        
        setLoading(true);
        try {
            // A. Crear el Workload (Padre)
            const { data: workload, error: wError } = await supabase
                .from('workloads')
                .insert([{ 
                    workload_name: workloadName, 
                    problem_type: 'optimization', 
                    company_name: 'DHL' 
                }])
                .select().single();

            if (wError) throw wError;

            // B. Crear el Job (Ejecución específica)
            const { data: job, error: jError } = await supabase
                .from('jobs')
                .insert([{ 
                    workload_id: workload.id, 
                    status: 'orchestrating', 
                    tier, 
                    flavor, 
                    priority 
                }])
                .select().single();

            if (jError) throw jError;

            // C. Disparar Webhook de n8n para orquestación de IA
            // Nota: Se dispara en segundo plano, no bloqueamos la redirección
            fetch('http://135.181.86.147/webhook/run-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_id: job.id, workload_id: workload.id }),
            }).catch(e => console.error("Webhook trigger failed", e));

            toast.success("Secuencia de orquestación iniciada con éxito");
            
            // D. Navegar a la página de ejecución en tiempo real
            router.push(`/execution/${job.id}`);
        } catch (err: any) {
            toast.error(err.message || "Error crítico en la secuencia de lanzamiento");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050507] text-slate-300 p-6 md:p-12 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* COLUMNA IZQUIERDA: PANEL DE CONFIGURACIÓN */}
                <div className="lg:col-span-7 space-y-10">
                    
                    {/* Header de Marca */}
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] transition-transform hover:rotate-12">
                            <Atom className="text-white animate-[spin_10s_linear_infinite]" size={36} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                                QEOX <span className="text-blue-500 not-italic">Orchestrator</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-mono font-bold">
                                    System Status: Ready for Deployment
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Input de Identificador con estilo Glass */}
                    <div className="bg-[#0f0f12]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 transition-all hover:border-white/10 group">
                        <label className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                            <Terminal size={14} className="text-blue-500" /> Workload Identifier
                        </label>
                        <input 
                            className="w-full bg-black/40 border border-white/5 p-5 rounded-2xl text-blue-400 focus:border-blue-500/50 outline-none transition-all font-mono text-lg uppercase"
                            value={workloadName}
                            onChange={(e) => setWorkloadName(e.target.value)}
                            placeholder="MY_PROJECT_ID"
                        />
                    </div>

                    {/* Selector de Tiers Computacionales */}
                    <div className="space-y-5">
                        <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest px-2">Computational Tier Selection</p>
                        <div className="grid grid-cols-3 gap-5">
                            {[
                                { id: 'classic', label: 'Classical', icon: Server, desc: 'High RAM' },
                                { id: 'hybrid', label: 'Hybrid', icon: Cpu, desc: 'GPU + QPU' },
                                { id: 'quantum', label: 'Quantum', icon: Zap, desc: 'Full Qubits' }
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTier(t.id as any)}
                                    className={`group relative p-8 border rounded-[2.5rem] transition-all duration-300 text-left ${
                                        tier === t.id 
                                            ? 'border-blue-500 bg-blue-500/10 text-white shadow-[0_15px_45px_rgba(59,130,246,0.15)]' 
                                            : 'border-white/5 bg-white/[0.02] text-slate-500 hover:border-white/10'
                                    }`}
                                >
                                    <t.icon size={28} className={`mb-4 ${tier === t.id ? 'text-blue-500' : 'text-slate-700'}`} />
                                    <span className="text-[13px] font-black uppercase tracking-widest block">{t.label}</span>
                                    <span className="text-[10px] opacity-40 uppercase font-mono">{t.desc}</span>
                                    {tier === t.id && (
                                        <div className="absolute top-6 right-6 w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista Dinámica de Nodos (Sincronizada con Supabase) */}
                    <div className="space-y-5">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">Active Nodes ({tier})</span>
                            {fetchingProviders && <Loader2 className="animate-spin text-blue-500" size={14} />}
                        </div>
                        <div className="grid gap-4">
                            {filteredProviders.length > 0 ? (
                                filteredProviders.map((p) => (
                                    <div 
                                        key={p.id}
                                        onClick={() => setFlavor(p.provider_id)}
                                        className={`group p-6 border rounded-[2rem] flex items-center justify-between cursor-pointer transition-all duration-300 ${
                                            flavor === p.provider_id 
                                                ? 'border-blue-500/50 bg-blue-500/[0.04] shadow-[inset_0_0_40px_rgba(59,130,246,0.05)]' 
                                                : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                                                flavor === p.provider_id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-700'
                                            }`}>
                                                <Server size={28} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-white tracking-tight">{p.name}</h4>
                                                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500 font-mono">
                                                    <span className="flex items-center gap-1 uppercase italic"><Globe size={12} className="text-blue-500" /> {p.region || 'Global'}</span>
                                                    <span className="flex items-center gap-1 uppercase"><Activity size={12} className="text-emerald-500" /> Latency: 12ms</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                            flavor === p.provider_id ? 'border-blue-500 bg-blue-500 scale-110' : 'border-white/10'
                                        }`}>
                                            {flavor === p.provider_id && <CheckCircle2 size={18} className="text-white" />}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-16 border border-dashed border-white/5 rounded-[2.5rem] text-center">
                                    <Loader2 className="animate-spin text-slate-800 mx-auto mb-4" size={32} />
                                    <p className="text-xs text-slate-600 uppercase tracking-widest font-mono">
                                        Searching for compatible {tier} nodes...
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: EJECUCIÓN Y COSTES */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                    
                    <div className="bg-[#0f0f12]/80 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-10 space-y-10 sticky top-12 shadow-2xl">
                        
                        <div className="flex justify-between items-center">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-blue-500">Execution Hub</h3>
                            <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Supabase Integrated</span>
                            </div>
                        </div>

                        {/* Selector de Estrategia de n8n */}
                        <div className="space-y-5">
                            <label className="text-[11px] font-mono text-slate-600 uppercase tracking-[0.2em]">Strategy Optimization</label>
                            <div className="grid grid-cols-2 gap-4 p-2 bg-black/40 border border-white/5 rounded-[2rem]">
                                <button 
                                    onClick={() => setPriority('speed')}
                                    className={`flex items-center justify-center gap-3 py-5 rounded-[1.5rem] transition-all duration-300 ${
                                        priority === 'speed' ? 'bg-blue-600 text-white shadow-2xl scale-105' : 'text-slate-600 hover:text-slate-400'
                                    }`}
                                >
                                    <Clock size={18} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Speed</span>
                                </button>
                                <button 
                                    onClick={() => setPriority('cost')}
                                    className={`flex items-center justify-center gap-3 py-5 rounded-[1.5rem] transition-all duration-300 ${
                                        priority === 'cost' ? 'bg-emerald-600 text-white shadow-2xl scale-105' : 'text-slate-600 hover:text-slate-400'
                                    }`}
                                >
                                    <Coins size={18} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Cost</span>
                                </button>
                            </div>
                        </div>

                        {/* Visualización de Créditos */}
                        <div className="space-y-8">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Estimated Charge</p>
                                    <h2 className="text-6xl font-black text-white tracking-tighter italic">
                                        {priority === 'speed' ? '$1.25' : '$0.40'}
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-blue-500 mb-1">Quota</p>
                                    <p className="text-2xl font-mono font-bold text-white italic">∞ <span className="text-[10px]">CR</span></p>
                                </div>
                            </div>

                            {/* BOTÓN PRINCIPAL DE LANZAMIENTO */}
                            <button 
                                onClick={handleLaunch}
                                disabled={loading || fetchingProviders || !flavor}
                                className={`w-full group py-8 rounded-[2.5rem] font-black uppercase text-sm tracking-[0.5em] transition-all duration-500 ${
                                    flavor && !loading 
                                        ? 'bg-blue-600 text-white shadow-[0_25px_60px_rgba(37,99,235,0.4)] hover:-translate-y-1 hover:shadow-blue-500/50' 
                                        : 'bg-white/5 text-white/20 cursor-not-allowed'
                                }`}
                            >
                                <div className="flex items-center justify-center gap-4">
                                    {loading ? <Loader2 className="animate-spin" size={24} /> : <Rocket size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                    {loading ? "Orchestrating..." : "Launch Process"}
                                </div>
                            </button>
                        </div>

                        {/* Footer de Seguridad */}
                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
                            <div className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">
                                <span>Security Level</span>
                                <p className="text-slate-400 font-bold">Quantum-Safe</p>
                            </div>
                            <div className="text-[10px] font-mono text-slate-700 uppercase tracking-widest">
                                <span>Target Node</span>
                                <p className="text-slate-400 font-bold truncate max-w-[120px]">{flavor || 'none'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Mensaje de Info de IA */}
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-6 flex gap-5 items-center">
                        <ShieldCheck size={24} className="text-emerald-500 shrink-0" />
                        <p className="text-[10px] text-emerald-500/80 leading-relaxed uppercase font-bold tracking-tighter">
                            La IA de n8n optimizará la ruta de hardware basándose en el objetivo matemático descrito en Supabase.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
