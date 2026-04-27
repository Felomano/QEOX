"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, FolderOpen, Loader2, PlusCircle } from "lucide-react";

type JobSummary = {
  id: string;
  status: string;
};

type WorkloadRow = {
  id: string;
  workload_name: string;
  lifecycle_status: string;
  industry: string | null;
  total_cumulative_cost: number | null;
  created_at: string;
  jobs?: JobSummary[];
};

const ACTIVE_STATUSES = new Set(["QUEUED", "RUNNING", "PENDING", "IN_PROGRESS"]);

export default function WorkloadsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [workloads, setWorkloads] = useState<WorkloadRow[]>([]);
  const currency = "USD";

  const money = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }),
    [currency]
  );

  const fetchWorkloads = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("workloads")
      .select("id, workload_name, lifecycle_status, industry, total_cumulative_cost, created_at, jobs(id,status)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[workloads] fetch error", error);
      setWorkloads([]);
      setLoading(false);
      return;
    }

    setWorkloads((data as WorkloadRow[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchWorkloads();
  }, [fetchWorkloads]);

  useEffect(() => {
    const channel = supabase
      .channel("workloads-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "workloads" }, () => {
        fetchWorkloads();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "jobs" }, () => {
        fetchWorkloads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchWorkloads, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070b16] text-slate-100 flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </main>
    );
  }

  if (!workloads.length) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#070b16] via-[#0f1c3a] to-[#1f2452] text-slate-100 p-6 md:p-10">
        <section className="max-w-4xl mx-auto rounded-2xl border border-blue-300/20 bg-[#0b1225]/80 p-12 text-center">
          <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center">
            <FolderOpen />
          </div>
          <h1 className="text-2xl font-semibold text-blue-200">No workloads yet</h1>
          <p className="text-slate-300 mt-2">Start your first execution to populate the workload timeline.</p>
          <Link
            href="/execution/new"
            className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 font-semibold"
          >
            <PlusCircle size={16} /> Create first workload
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#070b16] via-[#0f1c3a] to-[#1f2452] text-slate-100 p-6 md:p-10">
      <section className="max-w-6xl mx-auto rounded-2xl border border-blue-300/20 bg-[#0b1225]/80 overflow-hidden">
        <header className="px-6 py-4 border-b border-blue-200/20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-blue-200">Workloads</h1>
            <p className="text-xs uppercase tracking-wider text-blue-100/70">Realtime orchestration history</p>
          </div>
          <Link href="/execution/new" className="px-3 py-2 rounded-md bg-violet-600 hover:bg-violet-500 text-sm font-semibold">
            New execution
          </Link>
        </header>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#12213f] text-blue-100">
              <tr>
                <th className="text-left px-4 py-3">Workload</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Industry</th>
                <th className="text-left px-4 py-3">Total cumulative cost</th>
                <th className="text-left px-4 py-3">Active jobs</th>
                <th className="text-left px-4 py-3">Created</th>
                <th className="text-left px-4 py-3">Open</th>
              </tr>
            </thead>
            <tbody>
              {workloads.map((workload) => {
                const activeJobs = (workload.jobs ?? []).filter((job) => ACTIVE_STATUSES.has(job.status)).length;
                const lastJobId = workload.jobs?.[0]?.id;

                return (
                  <tr key={workload.id} className="border-t border-blue-200/10 hover:bg-blue-500/5">
                    <td className="px-4 py-3 font-medium">{workload.workload_name}</td>
                    <td className="px-4 py-3">{workload.lifecycle_status}</td>
                    <td className="px-4 py-3">{workload.industry ?? "-"}</td>
                    <td className="px-4 py-3">{money.format(Number(workload.total_cumulative_cost ?? 0))}</td>
                    <td className="px-4 py-3">{activeJobs}</td>
                    <td className="px-4 py-3">{new Date(workload.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {lastJobId ? (
                        <Link href={`/execution/${lastJobId}`} className="inline-flex items-center gap-1 text-blue-300 hover:text-blue-100">
                          View <ArrowRight size={14} />
                        </Link>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
