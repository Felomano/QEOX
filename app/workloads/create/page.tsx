"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, BrainCircuit, CheckCircle2, Loader2, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

const inputCss =
  "w-full rounded-xl border border-blue-200/25 bg-[#0b1731]/90 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-300/70 focus:ring-2 focus:ring-blue-500/30";

type ExecutionTier = "classic" | "hybrid" | "quantum";

type Provider = {
  id: string;
  provider_name: string;
  tier: ExecutionTier;
  unit_price: number | null;
  is_enabled: boolean;
  priority_level?: number | null;
};

type Policy = {
  id: string;
  tier: ExecutionTier;
  auto_failover: boolean;
  max_cost_per_job: number | null;
};

type WorkloadForm = {
  workloadName: string;
  industry: string;
  description: string;
  optimizationGoal: string;
  executionMode: string;
  policyMode: string;
};

const DEFAULT_CONFIG_QUBITS = 24;
const DEFAULT_CONFIG_SHOTS = 1200;

const initialForm: WorkloadForm = {
  workloadName: "DHL-EU-ROUTE-OPT-001",
  industry: "Logistics",
  description: "Optimize last-mile delivery routes across Europe to reduce fuel consumption and delivery time.",
  optimizationGoal: "Minimize Cost",
  executionMode: "Auto (Recommended)",
  policyMode: "Allow AI Optimization",
};

export default function CreateWorkloadPage() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState<WorkloadForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);

  useEffect(() => {
    const loadRecommendationInputs = async () => {
      setLoadingRecommendations(true);
      const [{ data: providerRows, error: providerError }, { data: policyRows, error: policyError }] = await Promise.all([
        supabase
          .from("providers")
          .select("id, provider_name, tier, unit_price, is_enabled, priority_level")
          .eq("is_enabled", true)
          .order("priority_level", { ascending: true, nullsFirst: false }),
        supabase.from("execution_policies").select("id, tier, auto_failover, max_cost_per_job"),
      ]);

      if (providerError) console.error("[workloads/create] providers recommendation error", providerError);
      if (policyError) console.error("[workloads/create] policies recommendation error", policyError);

      setProviders((providerRows as Provider[]) ?? []);
      setPolicies((policyRows as Policy[]) ?? []);
      setLoadingRecommendations(false);
    };

    loadRecommendationInputs();
  }, [supabase]);

  const recommendedTier = useMemo<ExecutionTier>(() => {
    if (form.executionMode === "Classic") return "classic";
    if (form.executionMode === "Quantum") return "quantum";
    if (form.executionMode === "Hybrid") return "hybrid";

    const text = `${form.industry} ${form.description} ${form.optimizationGoal}`.toLowerCase();
    if (text.includes("quantum") || text.includes("experimental")) return "quantum";
    if (text.includes("speed") || text.includes("latency") || text.includes("real-time")) return "classic";
    return "hybrid";
  }, [form.description, form.executionMode, form.industry, form.optimizationGoal]);

  const tierProviders = useMemo(
    () => providers.filter((provider) => provider.tier?.toLowerCase() === recommendedTier),
    [providers, recommendedTier]
  );

  const primaryProvider = useMemo(() => tierProviders[0] ?? providers[0] ?? null, [providers, tierProviders]);
  const fallbackProvider = useMemo(
    () => tierProviders.find((provider) => provider.id !== primaryProvider?.id) ?? providers.find((provider) => provider.id !== primaryProvider?.id) ?? null,
    [primaryProvider?.id, providers, tierProviders]
  );
  const policy = useMemo(() => policies.find((item) => item.tier === recommendedTier) ?? null, [policies, recommendedTier]);

  const estimatedCost = useMemo(() => Number(primaryProvider?.unit_price ?? 0) * DEFAULT_CONFIG_SHOTS, [primaryProvider?.unit_price]);
  const estimatedRuntime = useMemo(() => {
    const tierMultiplier = recommendedTier === "classic" ? 2.5 : recommendedTier === "quantum" ? 5.2 : 4.2;
    const seconds = Math.max(45, Math.round((DEFAULT_CONFIG_SHOTS / DEFAULT_CONFIG_QUBITS) * tierMultiplier));
    return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
  }, [recommendedTier]);
  const savings = useMemo(() => {
    const goalBonus = form.optimizationGoal === "Minimize Cost" ? 8 : form.optimizationGoal === "Balanced" ? 5 : 2;
    const providerBonus = tierProviders.length > 1 ? 6 : 2;
    const policyBonus = policy?.auto_failover ? 4 : 0;
    return `${Math.min(32, 10 + goalBonus + providerBonus + policyBonus)}%`;
  }, [form.optimizationGoal, policy?.auto_failover, tierProviders.length]);

  const updateField = (key: keyof WorkloadForm, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.workloadName.trim()) return toast.error("Workload Name is required.");

    setSaving(true);
    const parameters = {
      description: form.description,
      optimization_goal: form.optimizationGoal,
      execution_mode: form.executionMode,
      policy_mode: form.policyMode,
      recommended_tier: recommendedTier,
      recommended_primary_provider_id: primaryProvider?.id ?? null,
      recommended_primary_provider_name: primaryProvider?.provider_name ?? null,
      recommended_fallback_provider_id: fallbackProvider?.id ?? null,
      recommended_fallback_provider_name: fallbackProvider?.provider_name ?? null,
      estimated_cost: estimatedCost,
      estimated_runtime: estimatedRuntime,
      estimated_savings: savings,
    };

    const { data, error } = await supabase
      .from("workloads")
      .insert({
        workload_name: form.workloadName.trim(),
        lifecycle_status: "CREATED",
        industry: form.industry.trim() || null,
        total_cumulative_cost: 0,
        config_qubits: DEFAULT_CONFIG_QUBITS,
        config_shots: DEFAULT_CONFIG_SHOTS,
        parameters,
      })
      .select("id")
      .single();

    setSaving(false);

    if (error || !data?.id) {
      toast.error(error?.message ?? "Could not create workload.");
      return;
    }

    toast.success("Workload created.");
    router.push(`/workloads/${data.id}`);
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050914] via-[#08172f] to-[#0f1f47] p-6 text-slate-100 md:p-10">
      <form onSubmit={handleSubmit} className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5 rounded-2xl border border-blue-200/20 bg-[#081426]/85 p-5 shadow-2xl shadow-blue-950/30 md:p-7">
          <header className="flex items-start justify-between gap-4 border-b border-blue-200/10 pb-5">
            <div className="flex gap-4">
              <Link href="/workloads" className="mt-1 rounded-full p-2 text-blue-100 hover:bg-blue-500/10">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Workload</h1>
                <p className="mt-1 text-sm text-slate-300">Describe the business problem and let QEOX recommend the execution plan.</p>
              </div>
            </div>
            <span className="rounded-full border border-blue-300/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">AI assisted</span>
          </header>

          <Section number="1" title="Business Problem" subtitle="Describe the workload you want to optimize.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Industry"><input className={inputCss} value={form.industry} onChange={(e) => updateField("industry", e.target.value)} /></Field>
              <Field label="Workload Name"><input className={inputCss} value={form.workloadName} onChange={(e) => updateField("workloadName", e.target.value)} /></Field>
            </div>
            <Field label="Description"><textarea className={`${inputCss} min-h-24 resize-y`} maxLength={300} value={form.description} onChange={(e) => updateField("description", e.target.value)} /></Field>
          </Section>

          <Section number="2" title="Optimization" subtitle="QEOX uses these choices with active providers and policies to build the recommendation.">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Optimization Goal"><select className={inputCss} value={form.optimizationGoal} onChange={(e) => updateField("optimizationGoal", e.target.value)}><option>Minimize Cost</option><option>Maximize Speed</option><option>Balanced</option><option>Experimental Quantum</option></select></Field>
              <Field label="Execution Mode"><select className={inputCss} value={form.executionMode} onChange={(e) => updateField("executionMode", e.target.value)}><option>Auto (Recommended)</option><option>Classic</option><option>Hybrid</option><option>Quantum</option></select></Field>
              <Field label="Policy"><select className={inputCss} value={form.policyMode} onChange={(e) => updateField("policyMode", e.target.value)}><option>Allow AI Optimization</option><option>Use My Providers</option><option>Manual Review</option></select></Field>
            </div>
          </Section>

          <section className="rounded-2xl border border-blue-300/20 bg-blue-500/10 p-5">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-blue-100"><Sparkles size={18} /> Saved workload defaults</h2>
            <p className="text-sm text-slate-300">
              QEOX will create the workload as <strong>CREATED</strong>, with <strong>{DEFAULT_CONFIG_QUBITS} qubits</strong>, <strong>{DEFAULT_CONFIG_SHOTS} shots</strong>, and <strong>$0.00</strong> cumulative cost until jobs run.
            </p>
          </section>

          <div className="flex flex-col gap-3 border-t border-blue-200/10 pt-5 sm:flex-row sm:justify-end">
            <Link href="/workloads" className="rounded-xl border border-blue-200/25 px-5 py-3 text-center font-semibold text-slate-200 hover:bg-white/5">Cancel</Link>
            <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-500 disabled:opacity-60">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />} Create Optimized Workload
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-blue-200/20 bg-[#081426]/85 p-6 shadow-2xl shadow-blue-950/30 lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-blue-200"><BrainCircuit size={20} /> AI Recommendation</h2>
          {loadingRecommendations ? (
            <div className="flex items-center gap-2 rounded-xl border border-blue-200/15 bg-[#0b1731]/75 p-4 text-sm text-slate-300"><Loader2 className="animate-spin" size={16} /> Loading providers and policies...</div>
          ) : (
            <div className="space-y-5 text-sm">
              <Recommendation icon={<Rocket size={18} />} label="Execution Strategy" value={`${recommendedTier.toUpperCase()} · ${form.executionMode}`} />
              <Recommendation icon={<CheckCircle2 size={18} />} label="Primary Provider" value={primaryProvider?.provider_name ?? "No active provider configured"} />
              <Recommendation icon={<Rocket size={18} />} label="Fallback Provider" value={fallbackProvider?.provider_name ?? (policy?.auto_failover ? "Waiting for backup provider" : "Manual fallback")} />
              <Recommendation icon={<ShieldCheck size={18} />} label="Policy" value={policy ? `${policy.auto_failover ? "Auto-failover" : "Manual review"} · max/job $${Number(policy.max_cost_per_job ?? 0).toFixed(2)}` : form.policyMode} />
              <div className="rounded-xl border border-blue-300/20 bg-blue-500/10 p-4">
                <p className="text-slate-200">Recommendation is calculated from active providers, execution policies, selected goal, and workload context.</p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <Metric label="Cost" value={`$${estimatedCost.toFixed(2)}`} />
                  <Metric label="Savings" value={savings} />
                  <Metric label="Runtime" value={estimatedRuntime} />
                </div>
              </div>
            </div>
          )}
        </aside>
      </form>
    </main>
  );
}

function Section({ number, title, subtitle, children }: { number: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="space-y-4 border-b border-blue-200/10 pb-5 last:border-b-0"><div className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 font-bold">{number}</span><div><h2 className="text-lg font-bold">{title}</h2><p className="text-sm text-slate-400">{subtitle}</p></div></div>{children}</section>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-xs font-semibold text-blue-100">{label}</span>{children}</label>;
}

function Recommendation({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex gap-3 border-b border-blue-200/10 pb-4 last:border-b-0"><span className="rounded-full bg-blue-500/15 p-3 text-blue-300">{icon}</span><div><p className="text-slate-400">{label}</p><p className="font-semibold text-white">{value}</p></div></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-slate-400">{label}</p><p className="text-lg font-bold text-blue-300">{value}</p></div>;
}
