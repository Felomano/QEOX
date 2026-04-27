"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Atom, Loader2, Rocket, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type ExecutionTier = "classic" | "hybrid" | "quantum";

type Provider = {
  id: string;
  provider_name: string;
  tier: ExecutionTier;
  unit_price: number;
  is_enabled: boolean;
};

type Organization = {
  id: string;
  current_spend: number;
  monthly_budget: number;
  currency: string;
};

type RecentJob = {
  id: string;
  status: string;
  estimated_cost: number;
  created_at: string;
  workloads?: { workload_name: string | null } | null;
  providers?: { provider_name: string | null } | null;
};

const DEFAULT_PARAMETERS = {
  objective: "portfolio_optimization",
  optimizer: "qaoa",
  retries: 0,
};

const isValidUuid = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  if (!value || value === "undefined") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

export default function NewExecutionPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);

  const [providers, setProviders] = useState<Provider[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);

  const [workloadName, setWorkloadName] = useState("QEOX-HYBRID-OPT-001");
  const [tier, setTier] = useState<ExecutionTier>("hybrid");
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");
  const [industry, setIndustry] = useState("Finance");
  const [objective, setObjective] = useState("Portfolio Optimization");
  const [configQubits, setConfigQubits] = useState(24);
  const [configShots, setConfigShots] = useState(1200);
  const [parametersText, setParametersText] = useState(JSON.stringify(DEFAULT_PARAMETERS, null, 2));

  const loadRecentJobs = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("id,status,estimated_cost,created_at,workloads(workload_name),providers(provider_name)")
      .order("created_at", { ascending: false })
      .limit(6);

    setRecentJobs((data as RecentJob[]) ?? []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoadingProviders(true);

      const [{ data: providerRows, error: providersError }, { data: authData, error: userError }] =
        await Promise.all([
          supabase
            .from("providers")
            .select("id, provider_name, tier, unit_price, is_enabled")
            .eq("is_enabled", true),
          supabase.auth.getUser(),
        ]);

      if (providersError) {
        toast.error(`No se pudieron cargar proveedores: ${providersError.message}`);
      } else {
        setProviders((providerRows ?? []) as Provider[]);
      }

      if (!userError && authData.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("org_id")
          .eq("id", authData.user.id)
          .single();

        if (profile?.org_id) {
          const { data: orgRow, error: orgError } = await supabase
            .from("organizations")
            .select("id, current_spend, monthly_budget, currency")
            .eq("id", profile.org_id)
            .single();

          if (orgError) {
            toast.error(`No se pudo cargar la organización: ${orgError.message}`);
          } else {
            setOrganization(orgRow as Organization);
          }
        }
      }

      await loadRecentJobs();
      setLoadingProviders(false);
    };

    bootstrap();
  }, [supabase]);

  const filteredProviders = useMemo(
    () => providers.filter((p) => p.tier?.toLowerCase() === tier),
    [providers, tier]
  );

  useEffect(() => {
    if (!filteredProviders.length) {
      setSelectedProviderId("");
      return;
    }
    setSelectedProviderId((prev) => prev || filteredProviders[0].id);
  }, [filteredProviders]);

  const selectedProvider = useMemo(
    () => filteredProviders.find((p) => p.id === selectedProviderId),
    [filteredProviders, selectedProviderId]
  );

  const estimatedCost = useMemo(() => {
    if (!selectedProvider) return 0;
    return Number(selectedProvider.unit_price) * Number(configShots);
  }, [selectedProvider, configShots]);

  const handleLaunch = async () => {
    if (!workloadName.trim()) return toast.error("El workload_name es obligatorio.");
    if (!selectedProvider) return toast.error("Selecciona un proveedor activo.");
    if (!organization) return toast.error("No se pudo resolver la organización del usuario.");

    let parsedParameters: Record<string, unknown>;
    try {
      parsedParameters = { ...JSON.parse(parametersText), objective };
    } catch {
      return toast.error("El campo parameters debe ser JSON válido.");
    }

    const projectedSpend = Number(organization.current_spend) + estimatedCost;
    if (projectedSpend > Number(organization.monthly_budget)) {
      return toast.error(
        `Presupuesto excedido. Proyección: ${projectedSpend.toFixed(2)} ${organization.currency} / Límite: ${Number(
          organization.monthly_budget
        ).toFixed(2)} ${organization.currency}`
      );
    }

    setLoading(true);
    try {
      const launchResp = await fetch("/api/execution/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workload_name: workloadName,
          industry,
          tier,
          assigned_provider_id: selectedProvider.id,
          config_qubits: configQubits,
          config_shots: configShots,
          parameters: parsedParameters,
          organization_id: organization.id,
        }),
      });

      const launchData = await launchResp.json();
      if (!launchResp.ok) throw new Error(launchData?.error ?? "No se pudo lanzar la ejecución.");

      const returnedJobId = launchData?.jobId ?? launchData?.job_id;
      if (!isValidUuid(returnedJobId)) {
        throw new Error("El backend no devolvió un jobId válido para redirección.");
      }

      toast.success("Ejecución lanzada correctamente.");
      router.push(`/execution/${returnedJobId}`);
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
          <div className="flex items-center gap-3">
            <Atom className="text-blue-100" />
            <h1 className="text-3xl font-semibold tracking-tight">Compute Intelligence Platform</h1>
          </div>
          <Link href="/execution" className="inline-flex items-center gap-2 text-blue-100 hover:text-white text-xs uppercase tracking-wider">
            <ArrowLeft size={14} /> Back
          </Link>
        </header>

        <div className="p-6 md:p-8 space-y-6 bg-[#0f1f3f]/90">
          <div className="border-b border-blue-200/20 pb-3 text-sm text-blue-100 flex gap-6">
            <span className="font-semibold border-b-2 border-blue-400 pb-2">Create Job</span>
            <span className="text-blue-200/70">Job History</span>
          </div>

          <section className="rounded-xl border border-blue-100/20 bg-[#111f3e] p-6 space-y-5">
            <h2 className="text-3xl font-semibold text-blue-300">Create Job</h2>

            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Industry">
                <input value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full rounded-lg border border-blue-200/30 bg-[#0b1731] px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </Field>
              <Field label="Objective">
                <input value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full rounded-lg border border-blue-200/30 bg-[#0b1731] px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </Field>
              <Field label="Workload Name">
                <input value={workloadName} onChange={(e) => setWorkloadName(e.target.value)} className="w-full rounded-lg border border-blue-200/30 bg-[#0b1731] px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              </Field>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Field label="Execution Type">
                <select value={tier} onChange={(e) => setTier(e.target.value as ExecutionTier)} className="w-full rounded-lg border border-blue-200/30 bg-[#0b1731] px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  <option value="classic">Classic</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="quantum">Quantum</option>
                </select>
              </Field>
              <Field label="Compute Optimization">
                <select
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  disabled={loadingProviders || !filteredProviders.length}
                  className="w-full rounded-lg border border-blue-200/30 bg-[#0b1731] px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {filteredProviders.map((provider) => (
                    <option key={provider.id} value={provider.id}>{provider.provider_name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Config (Qubits / Shots)">
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={configQubits} min={1} onChange={(e) => setConfigQubits(Number(e.target.value))} className="w-full rounded-lg border border-blue-200/30 bg-[#0b1731] px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                  <input type="number" value={configShots} min={1} onChange={(e) => setConfigShots(Number(e.target.value))} className="w-full rounded-lg border border-blue-200/30 bg-[#0b1731] px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
                </div>
              </Field>
            </div>

            <Field label="Parameters (JSON)">
              <textarea rows={4} value={parametersText} onChange={(e) => setParametersText(e.target.value)} className="w-full rounded-lg border border-blue-200/30 bg-[#0b1731] px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-xs" />
            </Field>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-blue-100/20 pt-4">
              <div className="inline-flex items-start gap-2 text-xs text-blue-100 bg-blue-500/20 border border-blue-300/30 rounded-lg px-3 py-2">
                <ShieldAlert size={15} className="mt-0.5" />
                <div>
                  <p>Estimated: {estimatedCost.toFixed(2)} {organization?.currency ?? "USD"}</p>
                  <p>Budget check: {(Number(organization?.current_spend ?? 0) + estimatedCost).toFixed(2)} / {Number(organization?.monthly_budget ?? 0).toFixed(2)}</p>
                </div>
              </div>
              <button onClick={handleLaunch} disabled={loading || loadingProviders} className="px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold min-w-44 inline-flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />} Create Job
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-blue-100/20 bg-[#111f3e] p-6">
            <h3 className="text-3xl font-semibold text-blue-300 mb-4">Results History</h3>
            <div className="overflow-auto rounded-lg border border-blue-200/20">
              <table className="w-full text-sm">
                <thead className="bg-[#162a52] text-blue-100">
                  <tr>
                    <th className="text-left px-4 py-3">Recent Job</th>
                    <th className="text-left px-4 py-3">Submitted</th>
                    <th className="text-left px-4 py-3">Provider</th>
                    <th className="text-left px-4 py-3">Objective</th>
                    <th className="text-left px-4 py-3">Cost</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentJobs.map((row) => (
                    <tr key={row.id} className="border-t border-blue-200/10">
                      <td className="px-4 py-3 text-blue-300">{row.id}</td>
                      <td className="px-4 py-3">{new Date(row.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3">{row.providers?.provider_name ?? "-"}</td>
                      <td className="px-4 py-3">{objective}</td>
                      <td className="px-4 py-3">${Number(row.estimated_cost ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] uppercase rounded px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-300/30">{row.status}</span>
                      </td>
                    </tr>
                  ))}
                  {!recentJobs.length && (
                    <tr><td className="px-4 py-4 text-slate-300" colSpan={6}>No hay jobs recientes.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-2 block">
      <span className="text-sm font-medium text-blue-100">{label}</span>
      {children}
    </label>
  );
}
