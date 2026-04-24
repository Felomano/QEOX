"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { toast } from "sonner";
import { 
    Rocket, Server, Loader2, 
    Activity, Atom, ShieldCheck, Terminal, CheckCircle2 
} from 'lucide-react';

export default function NewWorkloadPage() {
    const router = useRouter();
    const supabase = createClient();
    
    // Estados de Carga
    const [loading, setLoading] = useState(false);
    const [fetchingProviders, setFetchingProviders] = useState(true);

    // Estados de Datos
    const [allProviders, setAllProviders] = useState<any[]>([]);
    const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
    
    // Estados del Formulario
    const [tier, setTier] = useState<'classic' | 'hybrid' | 'quantum'>('hybrid');
    const [flavor, setFlavor] = useState('');
    const [workloadName, setWorkloadName] = useState('QUBIT-OPTIMIZER-ALPHA');
    const [priority, setPriority] = useState<'speed' | 'cost'>('speed');

    // 1. CARGA INICIAL DE PROVEEDORES DESDE SUPABASE
    useEffect(() => {
        const fetchProviders = async () => {
            setFetchingProviders(true);
            try {
                // Obtenemos todos los proveedores para filtrar localmente por Tier
                const { data, error } = await supabase
                    .from('providers')
                    .select('*');

                if (error) {
                    console.error("Error al obtener proveedores:", error);
                    toast.error("Error al conectar con la base de datos");
                } else {
                    console.log("Proveedores recuperados:", data);
                    setAllProviders(data || []);
                }
            } catch (err) {
                console.error("Error crítico en la consulta:", err);
            } finally {
                setFetchingProviders(false);
            }
        };
        fetchProviders();
    }, [supabase]);

    // 2. LÓGICA DE FILTRADO DINÁMICO (Corrección de visualización)
    useEffect(() => {
        if (allProviders.length > 0) {
            // Filtramos ignorando mayúsculas y asegurando que estén activos
            const filtered = allProviders.filter(p => 
                p.tier?.toLowerCase() === tier.toLowerCase() && 
                (p.is_active === true || p.is_active === null)
            );
            
            setFilteredProviders(filtered);
            
            // Autoseleccionar el primer nodo disponible al cambiar de Tier
            if (filtered.length > 0) {
                setFlavor(filtered[0].provider_id);
            } else {
                setFlavor('');
            }
        }
    }, [tier, allProviders]);

    // 3. FUNCIÓN PARA LANZAR EL JOB (Corrección de funcionalidad)
    const handleLaunch = async () => {
        if (!workloadName) return toast.error("Asigne un nombre al proyecto");
        if (!flavor) return toast.error("Seleccione un nodo de procesamiento");
        
        setLoading(true);
        try {
            // A. Insertar Workload principal
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

            // B. Insertar Job asociado
            const { data: job, error: jError } = await supabase
                .from('jobs')
                .insert([{ 
                    workload_id: workload.id, 
                    status: 'orchestrating', 
                    tier: tier, 
                    flavor: flavor, 
                    priority: priority 
                }])
                .select()
                .single();

            if (jError) throw jError;

            // C. Disparar Webhook a n8n de forma asíncrona
            // No bloqueamos la navegación si el webhook tarda en responder
            fetch('http://135.181.86.147/webhook/run-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    job_id: job.id, 
                    workload_id: workload.id,
                    tier: tier,
                    flavor: flavor 
                }),
            }).catch(e => console.warn("Aviso: El webhook de n8n no respondió, pero el registro fue creado con éxito."));

            toast.success("Orquestación iniciada correctamente");
            
            // Redirigir a la pantalla de ejecución
            router.push(`/execution/${job.id}`);
            
        } catch (err: any) {
            console.error("Error al lanzar el Job:", err);
            toast.error(err.message || "Error al procesar la solicitud");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050507] text-slate-300 p-6 md:p-12 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* CONFIGURACIÓN DEL WORKLOAD */}
                <div className="lg:col-span-7 space-y-10">
                    
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)]">
                            <Atom className="text-white animate-pulse" size={36} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
                                QEOX <span className="text-blue-500 not-italic">Orchestrator</span>
                            </h1>
                            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.3em] font-mono">Plano de Control de Infraestructura</p>
                        </div>
                    </div>

                    {/* Nombre del Proyecto */}
                    <div className="bg-[#0f0f12] border border-white/5 rounded-[2rem] p-8">
                        <label className="text-[11px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <Terminal size={14} className="text-blue-500" /> Identificador del Workload
                        </label>
                        <input 
                            className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl text-blue-400 focus:border-blue-500 outline-none transition-all font-mono"
                            value={workloadName}
                            onChange={(e) => setWorkloadName(e.target.value)}
                        />
                    </div>

                    {/* Selector de Tier */}
                    <div className="space-y-4">
                        <p className="text-[11px] font-mono text-slate-500 uppercase tracking-widest px-2">Nivel de Computación (Tier)</p>
                        <div className="grid grid-cols-3 gap-4">
                            {['classic', 'hybrid', 'quantum'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTier(t as any)}
                                    className={`p-6 border rounded-[2rem] transition-all ${
                                        tier === t 
                                            ? 'border-blue-500 bg-blue-500/10 text-white' 
                                            : 'border-white/5 bg-white/[0.02] text-slate-500 hover:bg-white/[0.05]'
                                    }`}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{t}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tabla de Nodos Filtrados */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest">Nodos Disponibles</span>
                            {fetchingProviders && <Loader2 className="animate-spin text-blue-500" size={14} />}
                        </div>
                        <div className="grid gap-3">
                            {filteredProviders.length > 0 ? (
                                filteredProviders.map((p) => (
                                    <div 
                                        key={p.id}
                                        onClick={() => setFlavor(p.provider_id)}
                                        className={`p-6 border rounded-[1.5rem] flex items-center justify-between cursor-pointer transition-all ${
                                            flavor === p.provider_id 
                                                ? 'border-blue-500 bg-blue-500/5' 
                                                : 'border-white/5 bg-white/[0.01] hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${flavor === p.provider_id ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-600'}`}>
                                                <Server size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white uppercase text-sm tracking-tight">{p.name}</h4>
                                                <p className="text-[10px] text-slate-500 font-mono italic uppercase">{p.region || 'Despliegue Global'}</p>
                                            </div>
                                        </div>
                                        {flavor === p.provider_id && <CheckCircle2 size={20} className="text-blue-500" />}
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 border border-dashed border-white/5 rounded-[2rem] text-center text-slate-600 text-xs font-mono uppercase tracking-widest">
                                    No se encontraron nodos {tier} activos en el registro
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RESUMEN Y LANZAMIENTO */}
                <div className="lg:col-span-5">
                    <div className="bg-[#0f0f12] border border-white/5 rounded-[3rem] p-10 space-y-10 sticky top-12">
                        
                        <div className="space-y-6">
                            <div className="flex justify-between text-[11px] font-mono text-slate-500 uppercase">
                                <span>Estrategia del Optimizador</span>
                                <span className="text-blue-500">{priority}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setPriority('speed')} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${priority === 'speed' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-600'}`}>Velocidad</button>
                                <button onClick={() => setPriority('cost')} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${priority === 'cost' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-600'}`}>Costo</button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            <p className="text-[10px] uppercase text-slate-500 font-bold mb-2">Costo Estimado de Ejecución</p>
                            <h2 className="text-6xl font-black text-white italic tracking-tighter">
                                {priority === 'speed' ? '$1.50' : '$0.45'}
                            </h2>
                        </div>

                        <button 
                            onClick={handleLaunch}
                            disabled={loading || fetchingProviders || !flavor}
                            className={`w-full py-8 rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-4 transition-all ${
                                flavor && !loading ? 'bg-blue-600 text-white shadow-xl hover:scale-[1.02] active:scale-[0.98]' : 'bg-white/5 text-slate-700 cursor-not-allowed'
                            }`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Rocket size={20} />}
                            {loading ? "Orquestando..." : "Lanzar Job"}
                        </button>

                        <div className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                            <ShieldCheck className="text-blue-500" size={18} />
                            <p className="text-[9px] uppercase font-bold text-blue-400 leading-tight">
                                Protegiendo puente cuántico-clásico mediante protocolos automatizados n8n.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
