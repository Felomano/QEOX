"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Clock3, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

type Job = {
  id: string;
  assigned_provider_id: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  status: string;
  tier: string | null;
  execution_time_seconds: number | null;
  created_at: string;
};

type Workload = {
  id: string;
  workload_name: string;
  lifecycle_status: string;
  industry: string | null;
  total_cumulative_cost: number | null;
  config_qubits: number | null;
  config_shots: number | null;
  parameters: Record<string, any> | null;
  created_at: string;
  jobs?: Job[];
};

export default function WorkloadDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams<{ id?: string | string[] }>();
  const workloadId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [workload, setWorkload] = useState<Workload | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "history">("overview");

  const money = useMemo(() => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }), []);

  const loadWorkload = useCallback(async () => {
    if (!workloadId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("workloads")
      .select("id, workload_name, lifecycle_status, industry, total_cumulative_cost, config_qubits, config_shots, parameters, created_at, jobs(id, assigned_provider_id, estimated_cost, actual_cost, status, tier, execution_time_seconds, created_at)")
      .eq("id", workloadId)
      .single();

    if (error) {
      console.error("[workload-detail] fetch error", error);
      setWorkload(null);
    } else {
      const row = data as Workload;
      row.jobs = [...(row.jobs ?? [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setWorkload(row);
    }
    loading && setLoading(false);
  }, [supabase, workloadId]);

  useEffect(() => {
    loadWorkload();
  }, [loadWorkload]);

  useEffect(() => {
    if (!workloadId) return;
    const channel = supabase
      .channel(`workload-detail-${workloadId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "workloads", filter: `id=eq.${workloadId}` }, loadWorkload)
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs", filter: `workload_id=eq.${workloadId}` }, loadWorkload)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadWorkload, supabase, workloadId]);

  const handleLaunchJob = async () => {
    if (!workload) return;
    setLaunching(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workload_id: workload.id,
          workload_name: workload.workload_name,
          config_qubits: workload.config_qubits,
          config_shots: workload.config_shots,
          parameters: workload.parameters
        })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setLaunching(false);
        toast.error(result.error ?? "Failed to initiate optimization job.");
        return;
      }

      toast.success("Optimization Job successfully launched into n8n pipeline!");
      
      // Extraemos IDs generados por el backend para pasarlos por query params
      const jobId = result.job?.job_id ?? `job_${Date.now()}`;
      const correlationId = result.job?.correlation_id ?? "";
      
      // Redirección directa a la pantalla de ejecución enviando la metadata
      router.push(`/execution/new?job_id=${jobId}&correlation_id=${correlationId}&workload_id=${workload.id}`);
      
    } catch (err) {
      setLaunching(false);
      toast.error("Network error communicating with the orchestration layers.");
    }
  };

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#070b16] text-slate-100"><Loader2 className="animate-spin" /></main>;
  }

  if (!workload) {
    return <main className="min-h-screen bg-[#070b16] p-10 text-slate-100">Workload not found.</main>;
  }

  const jobs = workload.jobs ?? [];
  const activeJobs = jobs.filter((job) => ["QUEUED", "RUNNING", "PENDING", "IN_PROGRESS"].includes(job.status)).length;
  const parameters = workload.parameters ?? {};

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#050914] via-[#08172f] to-[#0f1f47] p-6 text-slate-100 md:p-10">
      <section className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-blue-200/20 bg-[#081426]/85 shadow-2xl shadow-blue-950/30">
        <header className="border-b border-blue-200/10 p-6 md:p-8">
          <Link href="/workloads" className="mb-5 inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white"><ArrowLeft size={16} /> Back to workloads</Link>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-200/70">Workload Detail</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{workload.workload_name}</h1>
              <p className="mt-2 text-slate-400">Created {new Date(workload.created_at).toLocaleString()}</p>
            </div>
            <span className="w-fit rounded-full border border-blue-300/25 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-100">{workload.lifecycle_status}</span>
          </div>
        </header>

        <div className="grid gap-4 border-b border-blue-200/10 p-6 md:grid-cols-4 md:p-8">
          <Metric label="Industry" value={workload.industry ?? "-"} />
          <Metric label="Total cost" value={money.format(Number(workload.total_cumulative_cost ?? 0))} />
          <Metric label="Active jobs" value={String(activeJobs)} />
          <Metric label="Jobs history" value={String(jobs.length)} />
        </div>

        <div className="px-6 pt-6 md:px-8">
          <div className="flex gap-2 rounded-xl border border-blue-200/15 bg-[#0b1731]/70 p-1">
            <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</TabButton>
            <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>Jobs History</TabButton>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {activeTab === "overview" ? (
            <div className="grid gap-5 lg:grid-cols-3">
              <section className="rounded-2xl border border-blue-200/15 bg-[#0b1731]/75 p-5 lg:col-span-2">
                <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-blue-100"><BriefcaseBusiness size={20} /> Workload Profile</h2>
                <dl className="grid gap-4 md:grid-cols-2">
                  <Info label="Workload ID" value={workload.id} />
                  <Info label="Lifecycle Status" value={workload.lifecycle_status} />
                  <Info label="Config qubits" value={String(workload.config_qubits ?? 0)} />
                  <Info label="Config shots" value={String(workload.config_shots ?? 0)} />
                  <Info label="Optimization goal" value={String(parameters.optimization_goal ?? "-")} />
                  <Info label="Execution mode" value={String(parameters.execution_mode ?? "-")} />
                </dl>
              </section>
              
              <section className="flex flex-col justify-between rounded-2xl border border-blue-200/15 bg-blue-500/10 p-5">
                <div>
                  <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-blue-100"><Clock3 size={20} /> Next step</h2>
                  <p className="text-sm text-slate-300">Deploy this model to the orquestrador node to spin up dynamic hardware workloads.</p>
                  <p className="mt-4 rounded-xl bg-[#071224] p-4 text-sm text-slate-300">{String(parameters.description ?? "No description saved for this workload.")}</p>
                </div>
                
                {/* 🚀 BOTÓN DE LANZAMIENTO INTEGRADO ABAJO */}
                <button
                  disabled={launching}
                  onClick={handleLaunchJob}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-500 disabled:opacity-60"
                >
                  {launching ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Deploying Job...
                    </>
                  ) : (
                    <>
                      <Play size={16} fill="currentColor" /> Launch Optimization Job
                    </>
                  )}
                </button>
              </section>
            </div>
          ) : (
            <section className="overflow-hidden rounded-2xl border border-blue-200/15 bg-[#0b1731]/75">
              <div className="border-b border-blue-200/10 px-5 py-4">
                <h2 className="text-xl font-bold text-blue-100">Jobs History</h2>
                <p className="text-sm text-slate-400">All jobs linked to this workload, newest first.</p>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#12213f] text-blue-100">
                    <tr><th className="px-4 py-3 text-left">Job</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Tier</th><th className="px-4 py-3 text-left">Estimated</th><th className="px-4 py-3 text-left">Actual</th><th className="px-4 py-3 text-left">Runtime</th><th className="px-4 py-3 text-left">Created</th><th className="px-4 py-3 text-left">Open</th></tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => (
                      <tr key={job.id} className="border-t border-blue-200/10 hover:bg-blue-500/5">
                        <td className="px-4 py-3 font-mono text-xs">{job.id}</td><td className="px-4 py-3">{job.status}</td><td className="px-4 py-3">{job.tier ?? "-"}</td><td className="px-4 py-3">{money.format(Number(job.estimated_cost ?? 0))}</td><td className="px-4 py-3">{money.format(Number(job.actual_cost ?? 0))}</td><td className="px-4 py-3">{job.execution_time_seconds ? `${job.execution_time_seconds}s` : "-"}</td><td className="px-4 py-3">{new Date(job.created_at).toLocaleString()}</td><td className="px-4 py-3"><Link href={`/execution/${job.id}`} className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-100">View <ArrowRight size={14} /></Link></td>
                      </tr>
                    ))}
                    {!jobs.length && <tr><td className="px-4 py-6 text-slate-400" colSpan={8}>No jobs have been created for this workload yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-blue-200/15 bg-[#0b1731]/75 p-4"><p className="text-xs uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-xl font-bold text-blue-100">{value}</p></div>;
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/5"}`}>{children}</button>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-all text-slate-100">{value}</dd></div>;
}
