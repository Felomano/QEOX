"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Atom, Zap, Cpu, Target, Layers3, Play, Loader2,
  ChevronRight, Activity, Gauge, Server, Database, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createClient } from '@/lib/supabase/client';

export default function ExecutionNewPage() {
  const router = useRouter();
  const supabase = createClient();

  // --- ESTADOS DE DATOS (Supabase) ---
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<any[]>([]);
  const [orgData, setOrgData] = useState<any>(null);
  const [activeProviders, setActiveProviders] = useState<any[]>([]);

  // --- ESTADOS DEL FORMULARIO ---
  const [isLaunching, setIsLaunching] = useState(false);
  const [workloadName, setWorkloadName] = useState('Análisis de Optimización v1');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedTier, setSelectedTier] = useState('hybrid');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [targetPriority, setTargetPriority] = useState<'cost' | 'speed' | 'accuracy'>('cost');
  const [shots, setShots] = useState(1000);
  const [qubits, setQubits] = useState(5);

  // 1. CARGA DE CONTEXTO REAL
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [resPolicies, resOrg, resProviders] = await Promise.all([
          supabase.from('execution_policies').select('*'),
          supabase.from('organizations').select('*').single(),
          supabase.from('providers').select('*').eq('is_active', true)
        ]);

        if (resPolicies.data) setPolicies(resPolicies.data);
        if (resOrg.data) setOrgData(resOrg.data);
        if (resProviders.data) {
          setActiveProviders(resProviders.data);
          // Seleccionar el primer proveedor compatible por defecto
          const firstCompatible = resProviders.data.find(p => p.tier?.toLowerCase() === selectedTier);
          if (firstCompatible) setSelectedProviderId(firstCompatible.id);
        }
      } catch (err) {
        toast.error("Fallo de sincronización con QEOX Engine");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. CÁLCULO DE COSTE Y HARDWARE
  const currentProvider = useMemo(() =>
    activeProviders.find(p => p.id === selectedProviderId),
    [selectedProviderId, activeProviders]);

  const estimatedCost = useMemo(() => {
    if (!currentProvider) return "0.00";
    const rate = currentProvider.unit_price_per_shot || 0;
    return (shots * rate).toFixed(5);
  }, [shots, currentProvider]);

  // 3. VALIDACIÓN DE REGLAS DE NEGOCIO
  const currentPolicy = policies.find(p => p.tier?.toLowerCase() === selectedTier.toLowerCase());
  const remainingBudget = orgData ? (orgData.max_budget - orgData.current_cost) : 0;

  const validation = useMemo(() => {
    if (!currentPolicy || !orgData) return { valid: true, reason: "" };
    const costNum = parseFloat(estimatedCost);

    if (costNum > currentPolicy.max_cost_per_job) return { valid: false, reason: `Límite de Tier excedido ($${currentPolicy.max_cost_per_job})` };
    if (costNum > remainingBudget) return { valid: false, reason: "Presupuesto insuficiente" };
    if (!selectedProviderId) return { valid: false, reason: "Seleccione un proveedor de infraestructura" };
    return { valid: true, reason: "" };
  }, [estimatedCost, currentPolicy, remainingBudget, selectedProviderId]);

  // 4. LANZAMIENTO HACIA EL ORQUESTADOR REAL (n8n)
  const handleLaunch = async () => {
    setIsLaunching(true);
    const internalId = `QX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      // Registro de Auditoría en Supabase
      const { error: dbError } = await supabase.from('jobs').insert([{
        job_id: internalId,
        workload_name: workloadName,
        description: jobDescription,
        tier: selectedTier,
        provider_id: selectedProviderId,
        priority: targetPriority,
        params: { shots, qubits },
        infrastructure_snapshot: currentProvider?.hardware_config, // Guardamos qué hardware se usó
        estimated_cost: parseFloat(estimatedCost),
        status: 'orchestrating'
      }]);

      if (dbError) throw dbError;

      // Disparo al Webhook de n8n (Orquestador Real)
      const n8nRes = await fetch('http://135.181.86.147/webhook/run-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: internalId,
          provider_config: currentProvider, // n8n recibe todas las API keys y credenciales del proveedor
          tier: selectedTier,
          priority: targetPriority,
          payload: { shots, qubits, description: jobDescription }
        }),
      });

      if (!n8nRes.ok) throw new Error("El orquestador n8n no responde");

      toast.success("Job orquestado en hardware real");
      router.push(`/execution/${internalId}`);

    } catch (err: any) {
      toast.error(err.message || "Error en el despacho");
      setIsLaunching(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-blue-600 w-12 h-12" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-10">

        {/* COLUMNA DE CONFIGURACIÓN */}
        <div className="xl:col-span-8 space-y-8">
          <header>
            <Badge className="bg-blue-600/10 text-blue-500 border-blue-500/20 mb-3 font-black tracking-widest uppercase text-[10px]">
              QEOX Intelligent Orchestrator
            </Badge>
            <h1 className="text-6xl font-black text-white uppercase tracking-tighter italic">
              New <span className="text-blue-600">Workload</span>
            </h1>
          </header>

          {/* 1. SELECCIÓN DE TIER Y PRIORIDAD */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-800 p-6 rounded-[2rem]">
              <Label className="text-[10px] font-black uppercase text-slate-500 mb-4 block tracking-widest">Execution Tier</Label>
              <div className="grid grid-cols-3 gap-3">
                {['classic', 'hybrid', 'quantum'].map(t => (
                  <button
                    key={t} onClick={() => setSelectedTier(t)}
                    className={cn("py-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all",
                      selectedTier === t ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20" : "bg-slate-950 border-slate-800 text-slate-600")}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 p-6 rounded-[2rem]">
              <Label className="text-[10px] font-black uppercase text-slate-500 mb-4 block tracking-widest">Optimization Target</Label>
              <div className="grid grid-cols-3 gap-3">
                {['cost', 'speed', 'accuracy'].map(p => (
                  <button
                    key={p} onClick={() => setTargetPriority(p as any)}
                    className={cn("py-4 rounded-2xl border-2 text-[10px] font-black uppercase transition-all",
                      targetPriority === p ? "bg-slate-100 border-white text-black" : "bg-slate-950 border-slate-800 text-slate-600")}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Card>
          </section>

          {/* 2. SELECCIÓN DE PROVEEDOR REAL */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 ml-2">
              <Server className="w-4 h-4 text-blue-500" />
              <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Infrastructure Providers</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProviders.filter(p => p.tier?.toLowerCase() === selectedTier).map(provider => (
                <button
                  key={provider.id}
                  onClick={() => setSelectedProviderId(provider.id)}
                  className={cn(
                    "p-6 rounded-[2rem] border-2 transition-all text-left group relative overflow-hidden",
                    selectedProviderId === provider.id ? "bg-slate-900 border-blue-600" : "bg-slate-900/30 border-slate-800 hover:border-slate-700"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-black text-white uppercase tracking-tighter">{provider.name}</span>
                    <Badge className="bg-slate-950 text-[8px] font-mono">{provider.region}</Badge>
                  </div>
                  <div className="space-y-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <p className="text-[9px] font-bold text-slate-400 uppercase flex justify-between">
                      <span>Hardware Model:</span> <span className="text-white">{provider.hardware_model || 'Standard Compute'}</span>
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase flex justify-between">
                      <span>Price per Shot:</span> <span className="text-blue-400">${provider.unit_price_per_shot}</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* 3. PARÁMETROS DEL ALGORITMO Y RESUMEN DE HARDWARE */}
          <Card className="bg-slate-900/50 border-slate-800 p-8 rounded-[2.5rem] space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Algorithm Qubits</Label>
                  <span className="text-3xl font-mono font-black text-white">{qubits}</span>
                </div>
                <Slider
                  max={currentPolicy?.technical_limits?.max_qubits || 32}
                  min={1} value={[qubits]} onValueChange={v => setQubits(v[0])}
                />
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Execution Shots</Label>
                  <span className="text-3xl font-mono font-black text-white">{shots.toLocaleString()}</span>
                </div>
                <Slider
                  max={currentPolicy?.technical_limits?.max_shots || 10000}
                  step={100} value={[shots]} onValueChange={v => setShots(v[0])}
                />
              </div>
            </div>

            {/* Hardware Lock Display (Basado en lo que hablamos) */}
            <div className="pt-8 border-t border-slate-800 grid grid-cols-3 gap-4">
              {selectedTier === 'hybrid' ? (
                <>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/10">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Infrastructure</p>
                    <p className="text-xs font-mono text-blue-400 font-bold tracking-tighter uppercase">2x Compute Nodes</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/10">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Acceleration</p>
                    <p className="text-xs font-mono text-green-400 font-bold tracking-tighter uppercase">GPU A10G Enabled</p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-blue-500/10">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Memory Buffer</p>
                    <p className="text-xs font-mono text-white font-bold tracking-tighter uppercase">24GB VRAM</p>
                  </div>
                </>
              ) : (
                <div className="col-span-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hardware Runtime Profile</p>
                  <Badge variant="outline" className="font-mono text-blue-500 border-blue-500/20 uppercase">
                    {selectedTier === 'quantum' ? 'Direct QPU Access' : 'Standard vCPU/RAM Execution'}
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* PANEL DE CONTROL DE LANZAMIENTO */}
        <div className="xl:col-span-4 space-y-6">
          <Card className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] relative overflow-hidden sticky top-12">
            <div className="relative z-10 space-y-8">
              <div>
                <p className="text-[10px] font-black uppercase text-blue-100 tracking-[0.2em] mb-2 opacity-70">Estimated Execution Cost</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black tracking-tighter italic">${estimatedCost}</span>
                  <span className="text-sm font-bold uppercase text-blue-200">USD</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-700/40 p-5 rounded-3xl border border-blue-400/20">
                  <div className="flex justify-between text-[10px] font-black uppercase mb-3">
                    <span className="text-blue-100">Org. Budget Capacity</span>
                    <span className="text-white">${remainingBudget.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 bg-blue-900/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white shadow-[0_0_10px_#fff] transition-all duration-700"
                      style={{ width: `${Math.min((parseFloat(estimatedCost) / remainingBudget) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <Button
                  disabled={!validation.valid || isLaunching}
                  onClick={handleLaunch}
                  className="w-full h-24 bg-white hover:bg-slate-100 text-blue-700 rounded-[2rem] text-2xl font-black uppercase tracking-tighter shadow-2xl transition-transform active:scale-95 flex flex-col items-center justify-center gap-1 group"
                >
                  {isLaunching ? (
                    <Loader2 className="animate-spin w-8 h-8" />
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        Execute Job <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                      </div>
                      <span className="text-[9px] font-bold opacity-60 tracking-widest">PUSH TO ORCHESTRATOR</span>
                    </>
                  )}
                </Button>

                {!validation.valid && (
                  <div className="flex gap-2 items-center justify-center text-red-100 animate-pulse">
                    <ShieldCheck className="w-4 h-4" />
                    <p className="text-[10px] font-black uppercase tracking-tighter">{validation.reason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Efecto decorativo de fondo */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-400 rounded-full blur-[80px] opacity-50" />
          </Card>

          {/* RESUMEN DE CONTEXTO */}
          <Card className="bg-slate-900 border-slate-800 p-6 rounded-[2rem] space-y-4">
            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Workload Intelligence</Label>
            <textarea
              value={jobDescription} onChange={e => setJobDescription(e.target.value)}
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-medium focus:border-blue-500 outline-none resize-none placeholder:opacity-30"
              placeholder="Describe el objetivo científico/matemático para que la IA de n8n optimice la ruta de hardware..."
            />
          </Card>
        </div>
      </div>
    </div>
  );
}