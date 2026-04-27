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

type ExecutionTier = "classic" | "hybrid" | "quantum";

function normalizeExecutionTier(value: unknown): ExecutionTier {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "classic" || normalized === "hybrid" || normalized === "quantum") {
    return normalized;
  }

  throw new Error(`Tier inválido: ${String(value)}. Valores permitidos: classic | hybrid | quantum.`);
}

export async function POST(request: Request) {
  console.log("[execution/launch] Request received");

  let body: LaunchBody;

  try {
    body = (await request.json()) as LaunchBody;
    console.log("[execution/launch] Parsed body", {
      workload_name: body?.workload_name,
      assigned_provider_id: body?.assigned_provider_id,
      organization_id: body?.organization_id,
      tier: body?.tier,
      config_shots: body?.config_shots,
    });
  } catch (error) {
    console.error("[execution/launch] Error parsing JSON body", error);
    return NextResponse.json(
      {
        error: "JSON inválido en request body.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 400 }
    );
  }

  try {
    if (
      !body?.workload_name ||
      !body?.assigned_provider_id ||
      !body?.organization_id ||
      !body?.tier ||
      !body?.config_shots
    ) {
      return NextResponse.json(
        {
          error: "Payload incompleto",
          details:
            "Se requieren: workload_name, assigned_provider_id, organization_id, tier, config_shots.",
        },
        { status: 400 }
      );
    }

    const tier = normalizeExecutionTier(body.tier);
    // Mantiene visible en logs la intención de cast al enum execution_tier.
    const tierCastDebug = `${tier}::execution_tier`;
    console.log("[execution/launch] Tier cast", { tier, tierCastDebug });

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceKey || !supabaseUrl) {
      console.error("[execution/launch] Missing env vars", {
        hasServiceKey: Boolean(serviceKey),
        hasSupabaseUrl: Boolean(supabaseUrl),
      });
      return NextResponse.json(
        {
          error: "Variables de entorno faltantes.",
          details: "Se requiere SUPABASE_SERVICE_ROLE_KEY y NEXT_PUBLIC_SUPABASE_URL.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    let estimatedCost = 0;

    // 1) Provider + estimated cost
    let provider: { id: string; unit_price: number } | null = null;
    try {
      const { data, error } = await supabase
        .from("providers")
        .select("id, unit_price")
        .eq("id", body.assigned_provider_id)
        .single();

      if (error) {
        throw new Error(`providers query error: ${error.message}`);
      }

      provider = data;
      if (!provider) {
        throw new Error("Proveedor no encontrado.");
      }

      estimatedCost = Number(provider.unit_price) * Number(body.config_shots);
      console.log("[execution/launch] Provider resolved", {
        provider_id: provider.id,
        unit_price: provider.unit_price,
        config_shots: body.config_shots,
        estimatedCost,
      });
    } catch (error) {
      console.error("[execution/launch] Error fetching provider", error);
      return NextResponse.json(
        {
          error: "No se pudo resolver provider/costo estimado.",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 400 }
      );
    }

    // 2) Budget validation
    try {
      const { data: organization, error: organizationError } = await supabase
        .from("organizations")
        .select("id, current_spend, monthly_budget")
        .eq("id", body.organization_id)
        .single();

      if (organizationError) {
        throw new Error(`organizations query error: ${organizationError.message}`);
      }

      if (!organization) {
        throw new Error("Organización no encontrada.");
      }

      const projectedSpend = Number(organization.current_spend || 0) + estimatedCost;
      const monthlyBudget = Number(organization.monthly_budget || 0);

      console.log("[execution/launch] Budget check", {
        organization_id: organization.id,
        current_spend: organization.current_spend,
        monthly_budget: organization.monthly_budget,
        estimatedCost,
        projectedSpend,
      });

      if (projectedSpend > monthlyBudget) {
        return NextResponse.json(
          {
            error: "Presupuesto excedido para esta ejecución.",
            details: {
              current_spend: Number(organization.current_spend || 0),
              estimated_cost: estimatedCost,
              projected_spend: projectedSpend,
              monthly_budget: monthlyBudget,
            },
          },
          { status: 409 }
        );
      }
    } catch (error) {
      console.error("[execution/launch] Error validating budget", error);
      return NextResponse.json(
        {
          error: "No se pudo validar presupuesto de la organización.",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 400 }
      );
    }

    // 3) Create workload
    let workloadId: string;
    try {
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

      if (workloadError) {
        throw new Error(`workloads insert error: ${workloadError.message}`);
      }

      if (!workload?.id) {
        throw new Error("No se devolvió workload.id al crear el workload.");
      }

      workloadId = workload.id;
      console.log("[execution/launch] Workload created", { workloadId });
    } catch (error) {
      console.error("[execution/launch] Error creating workload", error);
      return NextResponse.json(
        {
          error: "No se pudo crear workload.",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }

    // 4) Create job (tier cast to execution_tier handled by DB enum compatibility)
    let jobId: string;
    let jobTier: string;
    try {
      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .insert({
          workload_id: workloadId,
          assigned_provider_id: body.assigned_provider_id,
          estimated_cost: estimatedCost,
          actual_cost: 0,
          status: "QUEUED",
          tier: tier as ExecutionTier,
        })
        .select("id, tier")
        .single();

      if (jobError) {
        throw new Error(`jobs insert error: ${jobError.message}`);
      }

      if (!job?.id) {
        throw new Error("No se devolvió job.id al crear el job.");
      }

      jobId = job.id;
      jobTier = String(job.tier);
      console.log("[execution/launch] Job created", {
        jobId,
        jobTier,
        tierCastDebug,
      });
    } catch (error) {
      console.error("[execution/launch] Error creating job", error);
      return NextResponse.json(
        {
          error: "No se pudo crear job.",
          details: error instanceof Error ? error.message : String(error),
          debug: { workload_id: workloadId, tier_requested: tierCastDebug },
        },
        { status: 500 }
      );
    }

    // 5) Update workload cumulative cost
    try {
      const { error: updateWorkloadError } = await supabase
        .from("workloads")
        .update({ total_cumulative_cost: estimatedCost })
        .eq("id", workloadId);

      if (updateWorkloadError) {
        throw new Error(`workloads update error: ${updateWorkloadError.message}`);
      }

      console.log("[execution/launch] Workload cumulative cost updated", {
        workloadId,
        total_cumulative_cost: estimatedCost,
      });
    } catch (error) {
      console.error("[execution/launch] Error updating workload total_cumulative_cost", error);
      return NextResponse.json(
        {
          error: "Job creado, pero falló la actualización de total_cumulative_cost en workload.",
          details: error instanceof Error ? error.message : String(error),
          job_id: jobId,
          workload_id: workloadId,
        },
        { status: 500 }
      );
    }

    // 6) Trigger n8n (non-blocking for DB consistency)
    const webhookUrl =
      process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? "http://135.181.86.147/webhook/run-analysis";

    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: jobId,
          tier: jobTier,
          parameters: body.parameters,
        }),
      });

      if (!webhookResponse.ok) {
        const webhookText = await webhookResponse.text();
        throw new Error(`Webhook responded ${webhookResponse.status}: ${webhookText}`);
      }

      console.log("[execution/launch] n8n webhook triggered successfully", {
        jobId,
        webhookUrl,
        status: webhookResponse.status,
      });
    } catch (error) {
      console.error("[execution/launch] n8n webhook failed (job already created)", error);
      return NextResponse.json(
        {
          job_id: jobId,
          estimated_cost: estimatedCost,
          warning: "Job creado, pero falló el trigger de automatización n8n.",
          webhook_error: error instanceof Error ? error.message : String(error),
        },
        { status: 202 }
      );
    }

    return NextResponse.json(
      { job_id: jobId, estimated_cost: estimatedCost, workload_id: workloadId },
      { status: 200 }
    );
  } catch (error) {
    console.error("[execution/launch] Unhandled error", error);
    return NextResponse.json(
      {
        error: "Error interno inesperado en /api/execution/launch.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
