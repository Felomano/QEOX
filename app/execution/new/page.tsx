"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Atom, Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type ExecutionTier = "classic" | "hybrid" | "quantum";
type PolicyMode = "my_providers" | "ai_optimization";
type Goal = "reduce_cost" | "maximize_speed" | "balanced" | "experimental_quantum";
type Mode = "auto" | "classical" | "hybrid" | "quantum";

type Provider = {
  id: string;
  provider_name: string;
  tier: ExecutionTier;
  unit_price: number;
  is_enabled: boolean;
  priority_level?: number;
};

type Organization = { id: string; current_spend: number; monthly_budget: number; currency: string };

export default function NewExecutionPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);

  const [industry, setIndustry] = useState("Finance");
  const [workloadName, setWorkloadName] = useState("QEOX-OPT-001");
  const [description, setDescription] = useState("Portfolio optimization with enterprise constraints");

  const [optimizationGoal, setOptimizationGoal] = useState<Goal>("balanced");
  const [executionMode, setExecutionMode] = useState<Mode>("auto");
  const [policyMode, setPolicyMode] = useState<PolicyMode>("my_providers");

  useEffect(() => {
    const bootstrap = async () => {
      setLoadingData(true);
      const [{ data: providerRows }, { data: authData }] = await Promise.all([
        supabase.from("providers").select("id, provider_name, tier, unit_price, is_enabled, priority_level").eq("is_enabled", true),
        supabase.auth.getUser(),
      ]);

      setProviders((providerRows ?? []) as Provider[]);

      if (authData.user) {
        const { data: profile } = await supabase.from("profiles").select("org_id").eq("id", authData.user.id).single();
        if (profile?.org_id) {
          const { data: orgRow } = await supabase
            .from("organizations")
            .select("id, current_spend, monthly_budget, currency")
            .eq("id", profile.org_id)
            .single();
          setOrganization((orgRow as Organization) ?? null);
        }
      }
      setLoadingData(false);
    };

    bootstrap();
  }, [supabase]);

  const resolvedTier: ExecutionTier = useMemo(() => {
    if (executionMode === "classical") return "classic";
    if (executionMode === "hybrid") return "hybrid";
    if (executionMode === "quantum") return "quantum";
    if (optimizationGoal === "experimental_quantum") return "quantum";
    return "hybrid";
  }, [executionMode, optimizationGoal]);

  const eligibleProviders = useMemo(() => providers.filter((p) => p.tier === resolvedTier), [providers, resolvedTier]);
  const selectedProvider = useMemo(() => {
    const primary = eligibleProviders.find((p) => p.priority_level === 1);
    return primary ?? eligibleProviders[0] ?? null;
  }, [eligibleProviders]);

  const estimatedCost = useMemo(() => Number(selectedProvider?.unit_price ?? 0) * 1200, [selectedProvider]);

  const handleLaunch = async () => {
    if (!workloadName.trim()) return toast.error("Workload Name es obligatorio.");
    if (!selectedProvider) return toast.error("No hay proveedores activos para ese Execution Mode.");
    if (!organization) return toast.error("No se pudo resolver la organización del usuario.");

    const projectedSpend = Number(organization.current_spend) + estimatedCost;
    if (projectedSpend > Number(organization.monthly_budget)) {
      return toast.error(`Presupuesto excedido: ${projectedSpend.toFixed(2)} ${organization.currency}`);
    }

    setLoading(true);
    try {
      const launchResp = await fetch("/api/execution/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workload_name: workloadName,
          industry,
          tier: resolvedTier,
          assigned_provider_id: selectedProvider.id,
          config_qubits: 24,
          config_shots: 1200,
          parameters: {
            description,
            optimization_goal: optimizationGoal,
            execution_mode: executionMode,
            policy_mode: policyMode,
          },
          organization_id: organization.id,
        }),
      });

      const launchData = await launchResp.json();
      if (!launchResp.ok) throw new Error(launchData?.error ?? "No se pudo lanzar la ejecución.");

      toast.success("Ejecución lanzada correctamente.");
      router.push(`/execution/${launchData.job_id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo lanzar la ejecución.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#040815] text-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto border border-cyan-500/20 rounded-2xl bg-gradient-to-b from-[#0a1630] to-[#070d1f] shadow-[0_0_60px_rgba(34,211,238,0.08)]">
        <header className="px-6 md:px-8 h-20 border-b border-cyan-400/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/25"><Atom className="text-cyan-300" size={18} /></div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/80 font-bold">QEOX</p>
              <h1 className="text-xl md:text-2xl font-black tracking-tight">Simple Job Form</h1>
            </div>
          </div>
          <Link href="/execution" className="inline-flex items-center gap-2 text-cyan-200 hover:text-white text-xs uppercase tracking-wider">
            <ArrowLeft size={14} /> Back
          </Link>
        </header>

        <div className="p-6 md:p-8 space-y-8">
          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-300">Section 1 — Business Problem</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Industry">
                <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputCss}>
                  <option value="Finance">Finance</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Pharma">Pharma</option>
                  <option value="Energy">Energy</option>
                  <option value="AI">AI</option>
                </select>
              </Field>
              <Field label="Workload Name"><input value={workloadName} onChange={(e) => setWorkloadName(e.target.value)} className={inputCss} /></Field>
            </div>
            <Field label="Description"><textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputCss} /></Field>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-cyan-300">Section 2 — Optimization</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Optimization Goal">
                <select value={optimizationGoal} onChange={(e) => setOptimizationGoal(e.target.value as Goal)} className={inputCss}>
                  <option value="reduce_cost">Reduce Cost</option>
                  <option value="maximize_speed">Maximize Speed</option>
                  <option value="balanced">Balanced</option>
                  <option value="experimental_quantum">Experimental Quantum</option>
                </select>
              </Field>
              <Field label="Execution Mode">
                <select value={executionMode} onChange={(e) => setExecutionMode(e.target.value as Mode)} className={inputCss}>
                  <option value="auto">Auto (Recommended)</option>
                  <option value="classical">Classical</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="quantum">Quantum</option>
                </select>
              </Field>
              <Field label="Policy">
                <select value={policyMode} onChange={(e) => setPolicyMode(e.target.value as PolicyMode)} className={inputCss}>
                  <option value="my_providers">Use My Providers Only</option>
                  <option value="ai_optimization">Allow AI Optimization</option>
                </select>
              </Field>
              <div className="rounded-xl border border-cyan-400/20 bg-[#0a1328] px-4 py-3 text-xs space-y-1">
                <p><span className="text-slate-400">Provider:</span> {selectedProvider?.provider_name ?? "No provider"}</p>
                <p><span className="text-slate-400">Tier:</span> {resolvedTier}</p>
                <p><span className="text-slate-400">Budget:</span> {organization ? `${organization.current_spend.toFixed(0)} / ${organization.monthly_budget.toFixed(0)} ${organization.currency}` : "Loading..."}</p>
              </div>
            </div>
          </section>

          <button onClick={handleLaunch} disabled={loading || loadingData} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-900/50 text-slate-950 font-black py-3 uppercase tracking-wider">
            {loading ? <><Loader2 className="animate-spin" size={16} /> Launching...</> : <><Rocket size={16} /> Launch Job</>}
          </button>
        </div>
      </div>
    </main>
  );
}

const inputCss = "w-full rounded-xl border border-cyan-400/20 bg-[#050d20] px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">{label}</span>
      {children}
    </label>
  );
}
