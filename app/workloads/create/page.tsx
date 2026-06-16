"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, BrainCircuit, CheckCircle2, Loader2, Rocket, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const inputCss =
  "w-full rounded-xl border border-blue-200/25 bg-[#0b1731]/90 px-3 py-2.5 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-300/70 focus:ring-2 focus:ring-blue-500/30";

type WorkloadForm = {
  workloadName: string;
  lifecycleStatus: string;
  industry: string;
  totalCumulativeCost: string;
  configQubits: string;
  configShots: string;
  description: string;
  optimizationGoal: string;
  executionMode: string;
  policyMode: string;
};

const initialForm: WorkloadForm = {
  workloadName: "DHL-EU-ROUTE-OPT-001",
  lifecycleStatus: "CREATED",
  industry: "Logistics",
  totalCumulativeCost: "0",
  configQubits: "24",
  configShots: "1200",
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

  const estimatedRuntime = useMemo(() => {
    const shots = Number(form.configShots || 0);
    const qubits = Math.max(Number(form.configQubits || 1), 1);
    const seconds = Math.max(45, Math.round((shots / qubits) * 4.2));
    return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
  }, [form.configQubits, form.configShots]);

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
    };

    const { data, error } = await supabase
      .from("workloads")
      .insert({
        workload_name: form.workloadName.trim(),
        lifecycle_status: form.lifecycleStatus,
        industry: form.industry.trim() || null,
        total_cumulative_cost: Number(form.totalCumulativeCost || 0),
        config_qubits: Number(form.configQubits || 0),
        config_shots: Number(form.configShots || 0),
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
                <p className="mt-1 text-sm text-slate-300">Define the workload columns and let QEOX prepare optimization.</p>
              </div>
            </div>
            <span className="rounded-full border border-blue-300/25 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">Simple setup</span>
          </header>

          <Section number="1" title="Business Problem" subtitle="Describe the workload you want to optimize.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Industry"><input className={inputCss} value={form.industry} onChange={(e) => updateField("industry", e.target.value)} /></Field>
              <Field label="Workload Name"><input className={inputCss} value={form.workloadName} onChange={(e) => updateField("workloadName", e.target.value)} /></Field>
            </div>
            <Field label="Description"><textarea className={`${inputCss} min-h-24 resize-y`} maxLength={300} value={form.description} onChange={(e) => updateField("description", e.target.value)} /></Field>
          </Section>

          <Section number="2" title="Workload Columns" subtitle="Values are saved directly in the workloads table.">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Field label="Lifecycle Status"><select className={inputCss} value={form.lifecycleStatus} onChange={(e) => updateField("lifecycleStatus", e.target.value)}><option>CREATED</option><option>ACTIVE</option><option>PAUSED</option><option>ARCHIVED</option></select></Field>
              <Field label="Total cumulative cost"><input className={inputCss} type="number" min="0" step="0.01" value={form.totalCumulativeCost} onChange={(e) => updateField("totalCumulativeCost", e.target.value)} /></Field>
              <Field label="Config qubits"><input className={inputCss} type="number" min="0" value={form.configQubits} onChange={(e) => updateField("configQubits", e.target.value)} /></Field>
              <Field label="Config shots"><input className={inputCss} type="number" min="0" value={form.configShots} onChange={(e) => updateField("configShots", e.target.value)} /></Field>
            </div>
          </Section>

          <Section number="3" title="Optimization" subtitle="These settings are stored in the workload parameters JSON.">
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Optimization Goal"><select className={inputCss} value={form.optimizationGoal} onChange={(e) => updateField("optimizationGoal", e.target.value)}><option>Minimize Cost</option><option>Maximize Speed</option><option>Balanced</option><option>Experimental Quantum</option></select></Field>
              <Field label="Execution Mode"><select className={inputCss} value={form.executionMode} onChange={(e) => updateField("executionMode", e.target.value)}><option>Auto (Recommended)</option><option>Classic</option><option>Hybrid</option><option>Quantum</option></select></Field>
              <Field label="Policy"><select className={inputCss} value={form.policyMode} onChange={(e) => updateField("policyMode", e.target.value)}><option>Allow AI Optimization</option><option>Use My Providers</option><option>Manual Review</option></select></Field>
            </div>
          </Section>

          <div className="flex flex-col gap-3 border-t border-blue-200/10 pt-5 sm:flex-row sm:justify-end">
            <Link href="/workloads" className="rounded-xl border border-blue-200/25 px-5 py-3 text-center font-semibold text-slate-200 hover:bg-white/5">Cancel</Link>
            <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-500 disabled:opacity-60">
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />} Create Optimized Workload
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-blue-200/20 bg-[#081426]/85 p-6 shadow-2xl shadow-blue-950/30 lg:sticky lg:top-6 lg:self-start">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-blue-200"><BrainCircuit size={20} /> AI Recommendation</h2>
          <div className="space-y-5 text-sm">
            <Recommendation icon={<Rocket size={18} />} label="Execution Strategy" value="Hybrid optimization with quantum layer" />
            <Recommendation icon={<CheckCircle2 size={18} />} label="Optimization Goal" value={form.optimizationGoal} />
            <Recommendation icon={<ShieldCheck size={18} />} label="Policy" value={form.policyMode} />
            <div className="rounded-xl border border-blue-300/20 bg-blue-500/10 p-4">
              <p className="text-slate-200">QEOX will save this workload and make it available for execution and job history tracking.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <Metric label="Savings" value="18%" />
                <Metric label="Runtime" value={estimatedRuntime} />
              </div>
            </div>
          </div>
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
  return <div><p className="text-xs text-slate-400">{label}</p><p className="text-xl font-bold text-blue-300">{value}</p></div>;
}
