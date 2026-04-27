"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Atom, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

type ExecutionTier = "classic" | "hybrid" | "quantum";

type Job = {
  id: string;
  workload_id: string;
  assigned_provider_id: string;
  actual_cost: number;
  estimated_cost: number;
  status: string;
  tier: ExecutionTier;
  execution_time_seconds: number | null;
  created_at?: string;
};

type Workload = {
  id: string;
  workload_name: string;
  industry: string | null;
  parameters: Record<string, any> | null;
  config_shots: number;
  config_qubits: number;
};

type JobLog = {
  id: string;
  job_id: string;
  event: string;
  message: string;
  severity: string;
  created_at: string;
};

const isValidUuid = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  if (!value || value === "undefined") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

export default function ExecutionDetails({ params }: { params: { id?: string } | Promise<{ id?: string }> }) {
  const supabase = createClient();
  const router = useRouter();
  const routeParams = useParams<{ id?: string | string[] }>();

  const [loading, setLoading] = useState(true);
  const [rerunning, setRerunning] = useState(false);
  const [job, setJob] = useState<Job | null>(null);
  const [workload, setWorkload] = useState<Workload | null>(null);
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [attempts, setAttempts] = useState<Job[]>([]);
  const [finalizationApplied, setFinalizationApplied] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [paramError, setParamError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const resolveId = async () => {
      const resolvedParams = await Promise.resolve(params);
      const routeId = Array.isArray(routeParams?.id) ? routeParams.id[0] : routeParams?.id;
      const resolvedId = routeId ?? resolvedParams?.id;

      if (!active) return;

      if (!isValidUuid(resolvedId)) {
        setParamError("ID de ejecución inválido o no disponible.");
        setJobId(null);
        setLoading(false);
        return;
      }

      setParamError(null);
      setJobId(resolvedId);
    };

    resolveId();

    return () => {
      active = false;
    };
  }, [params, routeParams?.id]);

  const loadAttempts = async (workloadId: string) => {
    const { data } = await supabase
      .from("jobs")
      .select("id, workload_id, assigned_provider_id, actual_cost, estimated_cost, status, tier, execution_time_seconds, created_at")
      .eq("workload_id", workloadId)
      .order("created_at", { ascending: false });
    setAttempts((data as Job[]) ?? []);
  };

  const loadAll = useCallback(async () => {
    if (!isValidUuid(jobId)) return;

    setLoading(true);

    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("id, workload_id, assigned_provider_id, actual_cost, estimated_cost, status, tier, execution_time_seconds, created_at")
      .eq("id", jobId)
      .single();

    if (jobError || !jobData) {
      setLoading(false);
      return;
    }

    setJob(jobData as Job);

    const [{ data: workloadData }, { data: logsData }] = await Promise.all([
      supabase
        .from("workloads")
        .select("id, workload_name, industry, parameters, config_shots, config_qubits")
        .eq("id", jobData.workload_id)
        .single(),
      supabase
        .from("jobs_logs")
        .select("id, job_id, event, message, severity, created_at")
        .eq("job_id", jobId)
        .order("created_at", { ascending: true }),
    ]);

    setWorkload((workloadData as Workload) ?? null);
    setLogs((logsData as JobLog[]) ?? []);
    await loadAttempts(jobData.workload_id);
    setLoading(false);
  }, [jobId, supabase]);

  useEffect(() => {
    if (!isValidUuid(jobId)) return;
    loadAll();
  }, [jobId, loadAll]);

  const applyOrganizationSpend = useCallback(
    async (actualCost: number) => {
      if (!actualCost || actualCost <= 0) return;
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", authData.user.id)
        .single();
      if (!profile?.org_id) return;

      const { data: organization } = await supabase
        .from("organizations")
        .select("id, current_spend")
        .eq("id", profile.org_id)
        .single();
      if (!organization) return;

      const newSpend = Number(organization.current_spend || 0) + Number(actualCost);
      const { error } = await supabase
        .from("organizations")
        .update({ current_spend: newSpend })
        .eq("id", organization.id);

      if (error) toast.error(`No se pudo actualizar current_spend: ${error.message}`);
    },
    [supabase]
  );

  useEffect(() => {
    if (!job?.id) return;

    const channel = supabase
      .channel(`execution-${job.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "jobs", filter: `id=eq.${job.id}` },
        async (payload) => {
          const next = payload.new as Job;
          setJob((prev) => ({ ...(prev as Job), ...next }));

          if (next.status === "COMPLETED" && !finalizationApplied) {
            setFinalizationApplied(true);
            await applyOrganizationSpend(next.actual_cost ?? 0);
            await loadAttempts(next.workload_id);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "jobs_logs", filter: `job_id=eq.${job.id}` },
        (payload) => setLogs((prev) => [...prev, payload.new as JobLog])
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [job?.id, supabase, applyOrganizationSpend, finalizationApplied]);

  const handleRerun = async () => {
    if (!job || !workload) return;

    setRerunning(true);
    try {
      const { data: provider } = await supabase
        .from("providers")
        .select("id, unit_price")
        .eq("id", job.assigned_provider_id)
        .single();

      if (!provider) throw new Error("Proveedor no encontrado para re-ejecución.");

      const estimatedCost = Number(provider.unit_price) * Number(workload.config_shots);

      const { data: policy, error: policyError } = await supabase
        .from("execution_policies")
        .select("max_cost_per_job")
        .filter("tier", "eq", `${job.tier}::execution_tier`)
        .single();

      if (policyError) throw policyError;
      if (estimatedCost > Number(policy?.max_cost_per_job ?? Infinity)) {
        throw new Error("El costo estimado supera max_cost_per_job para ese tier.");
      }

      const { data: newJob, error: insertError } = await supabase
        .from("jobs")
        .insert({
          workload_id: job.workload_id,
          assigned_provider_id: job.assigned_provider_id,
          estimated_cost: estimatedCost,
          actual_cost: 0,
          status: "QUEUED",
          tier: job.tier,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? "http://135.181.86.147/webhook/run-analysis";
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: newJob.id, tier: job.tier, parameters: workload.parameters ?? {} }),
      });

      toast.success("Nuevo intento creado.");
      router.push(`/execution/${newJob.id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message ?? "No se pudo relanzar el job.");
    } finally {
      setRerunning(false);
    }
  };

  const statusPill = useMemo(() => {
    if (!job) return "bg-slate-500/20 text-slate-300";
    if (job.status === "COMPLETED") return "bg-emerald-500/20 text-emerald-300";
    if (job.status === "FAILED") return "bg-red-500/20 text-red-300";
    return "bg-blue-500/20 text-blue-300";
  }, [job]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B3FA8] text-white flex items-center justify-center gap-3">
        <Loader2 className="animate-spin" />
        <span className="text-sm">Cargando ejecución...</span>
      </div>
    );
  }

  if (paramError) {
    return <div className="min-h-screen bg-[#0B3FA8] text-white p-10">{paramError}</div>;
  }

  if (!job) {
    return <div className="min-h-screen bg-[#0B3FA8] text-white p-10">Job no encontrado.</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B3FA8] via-[#10367d] to-[#1e40af] p-6 md:p-10 text-slate-100">
      <div className="max-w-6xl mx-auto rounded-2xl border border-blue-300/20 bg-[#0b162f]/80 shadow-2xl overflow-hidden backdrop-blur-md">
        <header className="h-20 px-8 flex items-center justify-between border-b border-blue-300/20 bg-[#1147aa]">
          <div className="flex items-center gap-3">
            <Atom className="text-blue-100" />
            <h1 className="text-3xl font-semibold tracking-tight">Compute Intelligence Platform</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/execution" className="inline-flex items-center gap-2 text-blue-100 hover:text-white text-xs uppercase tracking-wider">
              <ArrowLeft size={14} /> Back
            </Link>
            <button onClick={handleRerun} disabled={rerunning} className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs font-bold inline-flex items-center gap-2">
              {rerunning ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Rerun
            </button>
          </div>
        </header>

        <div className="p-6 md:p-8 bg-[#0f1f3f]/90 space-y-5">
          <div className="flex justify-between items-center border-b border-blue-200/20 pb-3">
            <h2 className="text-4xl font-semibold text-blue-200">Workload Analysis - Job Results</h2>
            <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${statusPill}`}>Status: {job.status}</span>
          </div>

          <div className="grid md:grid-cols-4 rounded-lg overflow-hidden border border-blue-100/20 text-sm">
            <MetaCell label="Job ID" value={job.id} />
            <MetaCell label="Workload ID" value={job.workload_id} />
            <MetaCell label="Industry" value={workload?.industry ?? "N/A"} />
            <MetaCell label="Objective" value={String(workload?.parameters?.objective ?? "N/A")} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <section className="rounded-lg border border-blue-100/20 bg-[#111f3e] p-4">
              <h3 className="text-2xl font-semibold text-blue-300 border-b border-blue-200/20 pb-2 mb-3">Execution Details</h3>
              <ul className="space-y-2 text-sm">
                <li>• Provider ID: {job.assigned_provider_id}</li>
                <li>• Execution Type: {job.tier}</li>
                <li>• Estimated Cost: ${Number(job.estimated_cost ?? 0).toFixed(2)}</li>
                <li>• Actual Cost: ${Number(job.actual_cost ?? 0).toFixed(2)}</li>
                <li>• Duration: {job.execution_time_seconds ?? "-"} sec</li>
              </ul>
            </section>

            <section className="rounded-lg border border-blue-100/20 bg-[#111f3e] p-4">
              <h3 className="text-2xl font-semibold text-blue-300 border-b border-blue-200/20 pb-2 mb-3">Performance Insights</h3>
              <div className="grid grid-cols-2 gap-3">
                <InsightCard label="Cost" value={`$${Number(job.actual_cost ?? job.estimated_cost ?? 0).toFixed(2)}`} tone="blue" />
                <InsightCard label="Time" value={`${job.execution_time_seconds ?? 0}s`} tone="orange" />
                <InsightCard label="Savings" value={`$${Math.max(Number(job.estimated_cost ?? 0) - Number(job.actual_cost ?? 0), 0).toFixed(2)}`} tone="amber" />
                <InsightCard label="Efficiency" value={job.status === "COMPLETED" ? "Stable" : "In Progress"} tone="green" />
              </div>
            </section>
          </div>

          <section className="rounded-lg border border-blue-100/20 bg-[#111f3e] overflow-hidden">
            <div className="px-4 py-3 border-b border-blue-200/20">
              <h3 className="text-2xl font-semibold text-blue-300">Execution Log</h3>
            </div>
            <div className="overflow-auto max-h-72">
              <table className="w-full text-sm">
                <thead className="bg-[#162a52] text-blue-100 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2">Timestamp</th>
                    <th className="text-left px-4 py-2">Event</th>
                    <th className="text-left px-4 py-2">Provider</th>
                    <th className="text-left px-4 py-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-blue-200/10">
                      <td className="px-4 py-2">{new Date(log.created_at).toLocaleTimeString()}</td>
                      <td className="px-4 py-2">{log.event}</td>
                      <td className="px-4 py-2">{job.assigned_provider_id}</td>
                      <td className={`px-4 py-2 ${log.severity?.toLowerCase() === "error" ? "text-red-300" : "text-slate-100"}`}>{log.message}</td>
                    </tr>
                  ))}
                  {!logs.length && (
                    <tr><td className="px-4 py-3 text-slate-300" colSpan={4}>Sin logs todavía.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-blue-100/20 bg-[#111f3e] p-4">
            <h3 className="text-2xl font-semibold text-blue-300 border-b border-blue-200/20 pb-2 mb-3">Summary</h3>
            <p className="text-sm">Final Provider: {job.assigned_provider_id}</p>
            <p className="text-sm">Insight: {job.status === "COMPLETED" ? "Cross-provider optimization successful" : "Execution in progress"}</p>
          </section>

          <section className="rounded-lg border border-blue-100/20 bg-[#111f3e] p-4">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Workload Attempts</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {attempts.map((attempt) => (
                <button
                  key={attempt.id}
                  onClick={() => router.push(`/execution/${attempt.id}`)}
                  className={`text-left rounded border px-3 py-2 text-xs ${attempt.id === job.id ? "border-blue-400 bg-blue-500/10" : "border-blue-200/20 hover:border-blue-300/40"}`}
                >
                  <div className="flex justify-between">
                    <span>{attempt.id}</span>
                    <span className="text-slate-300">{attempt.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3 bg-[#162a52] border-r border-blue-200/20 last:border-r-0">
      <span className="text-blue-200/80">{label}:</span> <span className="font-semibold">{value}</span>
    </div>
  );
}

function InsightCard({ label, value, tone }: { label: string; value: string; tone: "blue" | "orange" | "amber" | "green" }) {
  const toneClass = {
    blue: "bg-blue-500/15 border-blue-300/30 text-blue-200",
    orange: "bg-orange-500/15 border-orange-300/30 text-orange-200",
    amber: "bg-amber-500/15 border-amber-300/30 text-amber-200",
    green: "bg-emerald-500/15 border-emerald-300/30 text-emerald-200",
  }[tone];

  return (
    <div className={`rounded border p-3 ${toneClass}`}>
      <p className="text-xs uppercase opacity-80">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
