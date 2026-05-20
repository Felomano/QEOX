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

type Organization = {
  id: string;
  current_spend: number;
  monthly_budget: number;
  currency: string;
};

type Policy = {
  id: string;
  tier: ExecutionTier;
  auto_failover: boolean;
  max_cost_per_job: number;
};

const DEFAULT_PARAMETERS = {
  objective: "portfolio_optimization",
  optimizer: "qaoa",
  retries: 0,
};

export default function NewExecutionPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);

  const [workloadName, setWorkloadName] = useState("QEOX-HYBRID-OPT-001");
  const [description, setDescription] = useState("Quantum-inspired optimization for mission-critical decisions.");
  const [industry, setIndustry] = useState("Finance");
  const [businessObjective, setBusinessObjective] = useState("Reduce infrastructure compute cost");

  const [tier, setTier] = useState<ExecutionTier>("hybrid");
  const [executionType, setExecutionType] = useState("Batch");
  const [optimizationGoal, setOptimizationGoal] = useState("Cost-efficient");
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");

  const [configQubits, setConfigQubits] = useState(24);
  const [configShots, setConfigShots] = useState(1200);
  const [parametersText, setParametersText] = useState(JSON.stringify(DEFAULT_PARAMETERS, null, 2));

  const [sla, setSla] = useState("99.9% / <5 min");

  useEffect(() => {
    const bootstrap = async () => {
      setLoadingData(true);
      const [{ data: providerRows }, { data: policyRows }, { data: authData }] = await Promise.all([
        supabase.from("providers").select("id, provider_name, tier, unit_price, is_enabled, priority_level").eq("is_enabled", true),
        supabase.from("execution_policies").select("id, tier, auto_failover, max_cost_per_job"),
        supabase.auth.getUser(),
      ]);

      setProviders((providerRows ?? []) as Provider[]);
      setPolicies((policyRows ?? []) as Policy[]);

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

  const filteredProviders = useMemo(() => providers.filter((p) => p.tier?.toLowerCase() === tier), [providers, tier]);

  useEffect(() => {
    if (!filteredProviders.length) return setSelectedProviderId("");
    const primary = filteredProviders.find((p) => p.priority_level === 1);
    setSelectedProviderId((prev) => prev || primary?.id || filteredProviders[0].id);
  }, [filteredProviders]);

  const selectedProvider = useMemo(() => filteredProviders.find((p) => p.id === selectedProviderId), [filteredProviders, selectedProviderId]);
  const activePolicy = useMemo(() => policies.find((p) => p.tier === tier), [policies, tier]);

  const preferredProviderNames = useMemo(() => filteredProviders.map((p) => p.provider_name), [filteredProviders]);

  const estimatedCost = useMemo(() => Number(selectedProvider?.unit_price ?? 0) * 1200, [selectedProvider]);

  const predictedRuntime = useMemo(() => {
    const secs = Math.max(35, Math.round((configShots / Math.max(configQubits, 1)) * 4.2));
    const minutes = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${minutes}m ${String(rem).padStart(2, "0")}s`;
  }, [configShots, configQubits]);

  const optimizationConfidence = useMemo(() => Math.min(98, Math.max(70, Math.round(88 + configQubits / 16 - configShots / 3000))), [configQubits, configShots]);

  const fallbackProvider = useMemo(() => {
    const alternative = filteredProviders.find((p) => p.id !== selectedProviderId);
    return alternative?.provider_name ?? "AWS HPC";
  }, [filteredProviders, selectedProviderId]);

  const handleLaunch = async () => {
    if (!workloadName.trim()) return toast.error("Workload Name es obligatorio.");
    if (!selectedProvider) return toast.error("No hay proveedores activos para ese Execution Mode.");
    if (!organization) return toast.error("No se pudo resolver la organización del usuario.");

    let parsedParameters: Record<string, unknown>;
    try {
      parsedParameters = { ...JSON.parse(parametersText), objective: businessObjective, execution_type: executionType };
    } catch {
      return toast.error("El campo parameters debe ser JSON válido.");
    }

    const projectedSpend = Number(organization.current_spend) + estimatedCost;
    if (projectedSpend > Number(organization.monthly_budget)) {
      return toast.error(`Presupuesto excedido. Proyección: ${projectedSpend.toFixed(2)} ${organization.currency}`);
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
    <main className="min-h-screen bg-gradient-to-br from-[#0B3FA8] via-[#10367d] to-[#1e40af] p-6 md:p-10 text-slate-100">
      <div className="max-w-6xl mx-auto rounded-2xl border border-blue-300/20 bg-[#0b162f]/80 shadow-2xl overflow-hidden backdrop-blur-md">
        <header className="h-20 px-8 flex items-center justify-between border-b border-blue-300/20 bg-[#1147aa]">
          <div className="flex items-center gap-3"><Atom className="text-blue-100" /><h1 className="text-3xl font-semibold tracking-tight">Create Intelligent Job</h1></div>
          <Link href="/execution" className="inline-flex items-center gap-2 text-blue-100 hover:text-white text-xs uppercase tracking-wider"><ArrowLeft size={14} /> Back</Link>
        </header>

        <div className="p-6 md:p-8 grid lg:grid-cols-3 gap-6 bg-[#0f1f3f]/90">
          <section className="lg:col-span-2 rounded-xl border border-blue-100/20 bg-[#111f3e] p-6 space-y-5">
            <SectionTitle title="SECTION 1 — Business Context" />
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Industry"><input value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputCss} /></Field>
              <Field label="Workload Name"><input value={workloadName} onChange={(e) => setWorkloadName(e.target.value)} className={inputCss} /></Field>
              <Field label="Description"><input value={description} onChange={(e) => setDescription(e.target.value)} className={inputCss} /></Field>
              <Field label="Business Objective"><input value={businessObjective} onChange={(e) => setBusinessObjective(e.target.value)} className={inputCss} /></Field>
            </div>

            <SectionTitle title="SECTION 2 — Optimization Strategy" />
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Execution Type"><input value={executionType} onChange={(e) => setExecutionType(e.target.value)} className={inputCss} /></Field>
              <Field label="Optimization Goal"><input value={optimizationGoal} onChange={(e) => setOptimizationGoal(e.target.value)} className={inputCss} /></Field>
              <Field label="Policy Mode"><div className="px-3 py-2 rounded-lg border border-blue-200/30 bg-[#0b1731] text-sm">{activePolicy ? `${activePolicy.tier.toUpperCase()} • max/job ${activePolicy.max_cost_per_job}` : "No policy configured"}</div></Field>
              <Field label="Preferred Providers"><div className="px-3 py-2 rounded-lg border border-blue-200/30 bg-[#0b1731] text-sm">{preferredProviderNames.join(", ") || "No active providers"}</div></Field>
            </div>

            <SectionTitle title="SECTION 3 — Technical Configuration" />
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Execution Tier"><select value={tier} onChange={(e) => setTier(e.target.value as ExecutionTier)} className={inputCss}><option value="classic">Classic</option><option value="hybrid">Hybrid</option><option value="quantum">Quantum</option></select></Field>
              <Field label="Primary Provider"><select value={selectedProviderId} onChange={(e) => setSelectedProviderId(e.target.value)} className={inputCss}>{filteredProviders.map((p) => <option key={p.id} value={p.id}>{p.provider_name}</option>)}</select></Field>
              <Field label="shots"><input type="number" value={configShots} min={1} onChange={(e) => setConfigShots(Number(e.target.value))} className={inputCss} /></Field>
              <Field label="qubits"><input type="number" value={configQubits} min={1} onChange={(e) => setConfigQubits(Number(e.target.value))} className={inputCss} /></Field>
            </div>
            <Field label="parameters JSON"><textarea rows={4} value={parametersText} onChange={(e) => setParametersText(e.target.value)} className={`${inputCss} font-mono text-xs`} /></Field>

            <SectionTitle title="SECTION 4 — Governance" />
            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Budget"><div className="px-3 py-2 rounded-lg border border-blue-200/30 bg-[#0b1731] text-sm">{organization ? `${organization.current_spend.toFixed(2)} / ${organization.monthly_budget.toFixed(2)} ${organization.currency}` : "Loading..."}</div></Field>
              <Field label="SLA"><input value={sla} onChange={(e) => setSla(e.target.value)} className={inputCss} /></Field>
              <Field label="Fallback Strategy"><div className="px-3 py-2 rounded-lg border border-blue-200/30 bg-[#0b1731] text-sm">{activePolicy?.auto_failover ? `Auto-failover to ${fallbackProvider}` : `Manual fallback to ${fallbackProvider}`}</div></Field>
            </div>

            <button onClick={handleLaunch} disabled={loading || loadingData} className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/60 text-white font-semibold py-3">
              {loading ? <><Loader2 className="animate-spin" size={16} /> Launching...</> : <><Rocket size={16} /> Launch Execution</>}
            </button>
          </section>

          <aside className="rounded-xl border border-cyan-400/30 bg-[#0d1b37] p-6 space-y-4">
            <h3 className="text-cyan-300 font-bold">SECTION 5 — AI Prediction (WOW factor)</h3>
            <p>Estimated cost: €{estimatedCost.toFixed(0)}</p>
            <p>Predicted runtime: {predictedRuntime}</p>
            <p>Optimization confidence: {optimizationConfidence}%</p>
            <p>Suggested execution: {tier === "quantum" ? "Hybrid" : "Hybrid"}</p>
            <p className="text-yellow-300">🏁 Lo más potente que puedes hacer</p>

            <div className="border-t border-blue-200/20 pt-4 space-y-2 text-sm">
              <h4 className="font-semibold text-blue-200">Execution Plan</h4>
              <p><span className="text-slate-400">Primary:</span> {selectedProvider?.provider_name || "IonQ Forte"}</p>
              <p><span className="text-slate-400">Fallback:</span> {fallbackProvider}</p>
              <p><span className="text-slate-400">Optimization Strategy:</span> {optimizationGoal} {tier} execution</p>
              <p><span className="text-slate-400">Expected savings:</span> {Math.min(35, Math.max(8, Math.round((optimizationConfidence - 70) * 0.8)))}%</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

const inputCss = "w-full rounded-lg border border-blue-200/30 bg-[#0b1731] px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50";

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-lg font-semibold text-blue-300">{title}</h2>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs uppercase tracking-wide text-blue-100">{label}</span>
      {children}
    </label>
  );
}
