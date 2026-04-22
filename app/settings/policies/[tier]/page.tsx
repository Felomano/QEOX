"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  Database,
  AlertTriangle,
  Atom,
  Zap,
  Cpu,
  ShieldCheck,
  Info,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Mapeo de iconos directo (sin objetos anidados para evitar el error 130)
const ICONS = {
  quantum: Atom,
  hybrid: Zap,
  classic: Cpu
};

const COLORS = {
  quantum: "text-cyan-400",
  hybrid: "text-green-400",
  classic: "text-blue-400"
};

const BGS = {
  quantum: "bg-cyan-500/10",
  hybrid: "bg-green-500/10",
  classic: "bg-blue-500/10"
};

export default function PolicyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  // Obtenemos el tier con un fallback para que nunca sea null
  const tier = (params?.tier as string) || "classic";

  const [loading, setLoading] = useState(true);
  const [policyData, setPolicyData] = useState<any>(null);
  const [jsonString, setJsonString] = useState("");
  const [isValidJson, setIsValidJson] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tier) return;

    async function fetchPolicy() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('execution_policies')
          .select('*')
          .eq('tier', tier)
          .single();

        if (error || !data) {
          toast.error("Policy not found");
          router.push('/settings/policies');
          return;
        }

        setPolicyData(data);
        setJsonString(JSON.stringify(data.technical_limits || {}, null, 2));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPolicy();
  }, [tier, supabase, router]);

  // --- LÓGICA DE RENDERIZADO SEGURO ---

  // 1. Si está cargando o no hay datos, spinner y fuera.
  if (loading || !policyData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  // 2. Solo si hay datos, definimos el icono (Mayúscula inicial para React)
  const IconComponent = ICONS[tier as keyof typeof ICONS] || Cpu;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-10 px-4 animate-in fade-in duration-700">

      {/* NAVEGACIÓN */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Badge className={cn("uppercase", BGS[tier as keyof typeof BGS], COLORS[tier as keyof typeof COLORS])}>
          {tier} active
        </Badge>
      </div>

      {/* HEADER */}
      <header className="flex items-center gap-4">
        <div className={cn("p-4 rounded-2xl border border-slate-800", COLORS[tier as keyof typeof COLORS])}>
          <IconComponent className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white uppercase">{tier} Guardrails</h1>
          <p className="text-slate-500">QEOX Tier Configuration</p>
        </div>
      </header>

      {/* FORMULARIO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
          <Label className="text-[10px] uppercase font-bold text-slate-500">Max Cost Per Job</Label>
          <Input
            type="number"
            value={policyData.max_cost_per_job}
            onChange={(e) => setPolicyData({ ...policyData, max_cost_per_job: e.target.value })}
            className="bg-slate-950 border-slate-800 text-white"
          />
          <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl">
            <span className="text-xs font-bold text-slate-300">Auto-Failover</span>
            <Switch
              checked={policyData.auto_failover}
              onCheckedChange={(checked) => setPolicyData({ ...policyData, auto_failover: checked })}
            />
          </div>
        </section>

        <section className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <textarea
            value={jsonString}
            onChange={(e) => {
              setJsonString(e.target.value);
              try { JSON.parse(e.target.value); setIsValidJson(true); } catch { setIsValidJson(false); }
            }}
            className={cn(
              "w-full h-[150px] bg-slate-950 border rounded-xl p-4 font-mono text-[11px]",
              isValidJson ? "border-slate-800 text-cyan-400" : "border-red-500 text-red-400"
            )}
          />
        </section>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={async () => {
            setSaving(true);
            const { error } = await supabase
              .from('execution_policies')
              .update({
                max_cost_per_job: policyData.max_cost_per_job,
                auto_failover: policyData.auto_failover,
                technical_limits: JSON.parse(jsonString),
              })
              .eq('tier', tier.toLowerCase());

            if (error) toast.error(error.message);
            else toast.success("Updated");
            setSaving(false);
          }}
          disabled={saving || !isValidJson}
          className="bg-blue-600 px-10"
        >
          {saving ? "Saving..." : "Sync Policy"}
        </Button>
      </div>
    </div>
  );
}
