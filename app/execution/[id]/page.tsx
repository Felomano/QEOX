"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Terminal, Cpu, Database, Activity, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function ExecutionDetails({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [job, setJob] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      // 1. Traer el Job con la info de su Workload padre
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          workloads (
            workload_name,
            problem_type,
            company_name,
            config_qubits
          )
        `)
        .eq('id', params.id)
        .single();

      if (data) {
        setJob(data);
        // 2. Traer logs iniciales
        const { data: initialLogs } = await supabase
          .from('job_logs')
          .select('*')
          .eq('job_id', params.id)
          .order('created_at', { ascending: true });
        
        setLogs(initialLogs || []);
      }
      setLoading(false);
    };

    fetchInitialData();

    // 3. SUSCRIPCIÓN EN TIEMPO REAL A LOS LOGS
    const channel = supabase
      .channel(`job-logs-${params.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'job_logs',
        filter: `job_id=eq.${params.id}`
      }, (payload) => {
        setLogs((prev) => [...prev, payload.new]);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'jobs',
        filter: `id=eq.${params.id}`
      }, (payload) => {
        setJob((prev: any) => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>;
  if (!job) return <div className="p-10 text-white">Job not found.</div>;

  return (
    <div className="min-h-screen bg-black p-8 text-slate-300 font-mono">
      {/* HEADER DE EJECUCIÓN */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tighter">
            {job.workloads?.problem_type} EXECUTION
          </h1>
          <p className="text-sm text-slate-500">WORKLOAD_ID: {job.workloads?.workload_name}</p>
        </div>
        <div className={`px-4 py-1 rounded-full text-xs font-bold border ${
          job.status === 'completed' ? 'border-green-500 text-green-500' :
          job.status === 'failed' ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500 animate-pulse'
        }`}>
          {job.status.toUpperCase()}
        </div>
      </div>

      {/* GRID DE METRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard icon={<Database size={16}/>} label="TIER" value={job.tier} />
        <MetricCard icon={<Cpu size={16}/>} label="FLAVOR" value={job.flavor} />
        <MetricCard icon={<Activity size={16}/>} label="QUBITS" value={job.workloads?.config_qubits} />
        <MetricCard icon={<CheckCircle2 size={16}/>} label="EST. COST" value={`$${job.estimated_cost}`} />
      </div>

      {/* TERMINAL DE LOGS (COHERENTE CON TU IMAGEN 5) */}
      <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
          <Terminal size={14} className="text-blue-400" />
          <span className="text-xs font-bold text-slate-400">EXECUTION LOG</span>
        </div>
        <div className="p-4 h-96 overflow-y-auto space-y-2 text-sm">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-4 border-l-2 border-slate-800 pl-4 hover:border-blue-500 transition-colors">
              <span className="text-slate-600 shrink-0">[{new Date(log.created_at).toLocaleTimeString()}]</span>
              <span className={`font-bold shrink-0 ${
                log.severity === 'error' ? 'text-red-400' : 
                log.severity === 'success' ? 'text-green-400' : 'text-blue-400'
              }`}>
                {log.event?.toUpperCase() || 'SYSTEM'}:
              </span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
          {job.status === 'orchestrating' && (
            <div className="flex items-center gap-2 text-slate-500 italic animate-pulse">
              <Loader2 size={12} className="animate-spin" />
              Awaiting governance validation...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-lg">
      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
        {icon} <span>{label}</span>
      </div>
      <div className="text-white font-bold">{value || '---'}</div>
    </div>
  );
}
