import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type LaunchBody = {
  workload_name: string;
  industry: string;
  tier: "classic" | "hybrid" | "quantum";
  assigned_provider_id: string;
  config_qubits: number;
  config_shots: number;
  parameters: Record<string, unknown>;
  organization_id: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LaunchBody;

    if (
      !body?.workload_name ||
      !body?.assigned_provider_id ||
      !body?.organization_id ||
      !body?.tier ||
      !body?.config_shots
    ) {
      return NextResponse.json({ error: "Payload incompleto" }, { status: 400 });
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY no configurada en el servidor." },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { persistSession: false } }
    );

    const { data: provider, error: providerError } = await supabase
      .from("providers")
      .select("id, unit_price")
      .eq("id", body.assigned_provider_id)
      .single();

    if (providerError || !provider) {
      return NextResponse.json({ error: providerError?.message ?? "Proveedor no encontrado" }, { status: 400 });
    }

    const estimatedCost = Number(provider.unit_price) * Number(body.config_shots);

    const { data: organization, error: organizationError } = await supabase
      .from("organizations")
      .select("id, current_spend, monthly_budget")
      .eq("id", body.organization_id)
      .single();

    if (organizationError || !organization) {
      return NextResponse.json(
        { error: organizationError?.message ?? "Organización no encontrada" },
        { status: 400 }
      );
    }

    const projectedSpend = Number(organization.current_spend || 0) + estimatedCost;
    if (projectedSpend > Number(organization.monthly_budget || 0)) {
      return NextResponse.json(
        { error: "Presupuesto excedido para esta ejecución." },
        { status: 409 }
      );
    }

    const { data: workload, error: workloadError } = await supabase
      .from("workloads")
      .insert({
        workload_name: body.workload_name,
        lifecycle_status: "CREATED",
        total_cumulative_cost: 0,
        parameters: body.parameters,
        industry: body.industry,
        config_qubits: body.config_qubits,
        config_shots: body.config_shots,
      })
      .select("id")
      .single();

    if (workloadError || !workload) {
      return NextResponse.json(
        { error: workloadError?.message ?? "No se pudo crear workload" },
        { status: 500 }
      );
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .insert({
        workload_id: workload.id,
        assigned_provider_id: body.assigned_provider_id,
        estimated_cost: estimatedCost,
        actual_cost: 0,
        status: "QUEUED",
        tier: body.tier,
      })
      .select("id, tier")
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: jobError?.message ?? "No se pudo crear job" }, { status: 500 });
    }

    const webhookUrl =
      process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? "http://135.181.86.147/webhook/run-analysis";

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        job_id: job.id,
        tier: job.tier,
        parameters: body.parameters,
      }),
    });

    return NextResponse.json({ job_id: job.id, estimated_cost: estimatedCost }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? "Error desconocido" }, { status: 500 });
  }
}
