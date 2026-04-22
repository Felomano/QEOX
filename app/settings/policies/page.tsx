"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  Shield,
  Cpu,
  Zap,
  Atom,
  ChevronRight,
  AlertCircle,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Definición de los Tiers para el renderizado consistente
const TIER_CONFIG = {
  quantum: {
    title: 'Quantum Tier Policy',
    description: 'High-precision atomic and gate-based constraints.',
    icon: Atom,
    color: 'text-cyan-400',
    borderColor: 'group-hover:border-cyan-500/50',
    bgColor: 'bg-cyan-500/5'
  },
  hybrid: {
    title: 'Hybrid Tier Policy',
    description: 'Co-processor orchestration and GPU/QPU limits.',
    icon: Zap,
    color: 'text-green-400',
    borderColor: 'group-hover:border-green-500/50',
    bgColor: 'bg-green-500/5'
  },
  classic: {
    title: 'Classic Tier Policy',
    description: 'Standard CPU and Cloud Compute boundaries.',
    icon: Cpu,
    color: 'text-blue-400',
    borderColor: 'group-hover:border-blue-500/50',
    bgColor: 'bg-blue-500/5'
  }
};

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getPolicies() {
      try {
        const { data, error } = await supabase
          .from('execution_policies')
          .select('*')
          .order('tier', { ascending: false }); // Para que Quantum salga primero

        if (error) throw error;
        setPolicies(data || []);
      } catch (err) {
        console.error('Error fetching policies:', err);
      } finally {
        setLoading(false);
      }
    }
    getPolicies();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER DE LA SECCIÓN */}
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            Policy Guardrails
          </h1>
        </div>
        <p className="text-sm text-slate-500 max-w-2xl">
          Administra los límites de ejecución y presupuestos máximos para cada capa de cómputo en QEOX.
        </p>
      </header>

      {/* GRID DE POLÍTICAS */}
      <div className="grid grid-cols-1 gap-4">
        {policies.map((policy) => {
          const config = TIER_CONFIG[policy.tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.classic;
          const Icon = config.icon;

          return (
            <div
              key={policy.id}
              className={cn(
                "group relative bg-slate-900/40 border border-slate-800 rounded-2xl p-6 transition-all duration-300",
                config.borderColor
              )}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                {/* INFO IZQUIERDA */}
                <div className="flex items-start gap-4">
                  <div className={cn("p-3 rounded-xl bg-slate-950 border border-slate-800 transition-colors", config.color)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-200 tracking-tight uppercase">
                      {config.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-3">{config.description}</p>
                    <div className="flex gap-2">
                      {policy.auto_failover && (
                        <Badge className="bg-green-500/10 text-green-500 border-none text-[9px] font-black uppercase">
                          Auto-Failover Active
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[9px] font-mono border-slate-800 text-slate-400">
                        Tier: {policy.tier}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* INFO CENTRAL (COSTES Y LÍMITES) */}
                <div className="flex flex-wrap gap-4 md:gap-8">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Limit / Job</span>
                    <span className="text-xl font-black text-white">${policy.max_cost_per_job}</span>
                  </div>

                  <div className="flex flex-col min-w-[150px]">
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Technical Constraints</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-[10px] text-cyan-500 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800/50">
                        {Object.keys(policy.technical_limits || {}).length} rules defined
                      </code>
                    </div>
                  </div>
                </div>

                {/* ACCIÓN DERECHA */}
                <Link href={`/settings/policies/${policy.tier}`}>
                  <Button
                    className="w-full md:w-auto bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-white font-black text-[10px] tracking-widest h-12 px-6 rounded-xl group"
                  >
                    CONFIGURE GUARDRAILS
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER INFO */}
      <footer className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-300/70 leading-relaxed uppercase font-bold">
          Nota: Las políticas de ejecución son globales para tu organización. Cualquier cambio afectará la orquestación en tiempo real de los workloads enviados a la infraestructura.
        </p>
      </footer>
    </div>
  );
}