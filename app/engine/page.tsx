"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Loader2, Zap, Target, DollarSign, ArrowRight, Activity, Layers } from 'lucide-react'

// Importamos el cliente de Supabase
import { createClient } from '@/lib/supabase/client'

// DATA MAPPING PARA FILTRADO DINÁMICO
const INFRA_DATA = {
  optimization: {
    providers: ["D-Wave", "IBM Quantum", "Rigetti", "Azure (QIO)", "Gurobi (Classical)", "AWS EC2 (Classical)", "Google OR-Tools"],
    algorithms: ["QUBO", "QAOA", "Knapsack Problem", "TSP (Traveling Salesman)", "Simplex/Branch & Bound", "Genetic Algorithms"]
  },
  simulation: {
    providers: ["IBM Quantum", "Quantinuum", "IonQ", "Xanadu", "NVIDIA HPC (Classical)", "MATLAB (Classical)", "Ansys (Classical)"],
    algorithms: ["VQE", "HHL", "Time-Evolution", "Molecular Dynamics", "Monte Carlo", "Finite Element (FEM)"]
  },
  ml: {
    providers: ["IBM Quantum", "Google AI", "IonQ", "NVIDIA CUDA-Q", "PyTorch (Classical)", "TensorFlow (Classical)", "AWS SageMaker"],
    algorithms: ["QSVM", "QNN", "Quantum Kernels", "Deep Neural Nets", "XGBoost", "Boltzmann Machines"]
  }
}

export default function InputPage() {
  const [loading, setLoading] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    problem: '',
    spend: '',
    type: 'optimization',
    priority: 'cost',
    currentProvider: 'none',
    currentAlgorithm: 'none'
  })

  const router = useRouter()
  const supabase = createClient() // Instanciamos Supabase

  // Reset de infraestructura si cambia el tipo de problema
  useEffect(() => {
    setFormData(prev => ({ ...prev, currentProvider: 'none', currentAlgorithm: 'none' }));
  }, [formData.type]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      // 1. OBTENER EL USUARIO ACTUAL (Vital para el RLS)
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No active session found");
      }

      const payload = {
        ...formData,
        isNewUser: formData.currentProvider === 'none',
        timestamp: new Date().toISOString()
      };

      // 2. GUARDAR REGISTRO INICIAL EN SUPABASE
      const { data: dbRecord, error: dbError } = await supabase
        .from('engine_analyses')
        .insert({
          user_id: user.id, // <--- AHORA SÍ ESTÁ VINCULADO
          project_name: formData.name || "Untitled Analysis",
          industry: formData.industry,
          status: 'processing',
          input_data: payload
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // 3. ENVIAR A N8N INCLUYENDO EL ID DE LA BASE DE DATOS
      const res = await fetch('http://135.181.86.147/webhook/qnex-infrastructure-advisor', {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis_id: dbRecord.id,
          ...payload
        }),
      });

      if (!res.ok) throw new Error(`Engine Webhook Error: ${res.status}`);

      // 4. REDIRIGIR USANDO EL ID DEL REGISTRO RECIÉN CREADO
      // Corregido: usamos dbRecord.id que es lo que devuelve Supabase
      setTimeout(() => router.push(`/decide/${dbRecord.id}`), 300);

    } catch (e) {
      console.error("QEOX Runtime Error:", e);
      alert("Error processing infrastructure analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-[#05070a] text-white font-sans selection:bg-blue-500/30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-2xl border-white/10 bg-slate-900/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[32px] overflow-hidden relative">
        <CardHeader className="text-center pt-10 pb-4">
          <div className="mx-auto w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
            <Activity className="text-white h-7 w-7" />
          </div>
          <CardTitle className="text-4xl font-extrabold tracking-tight text-white mb-2">
            QEOX <span className="text-blue-500">ENGINE</span>
          </CardTitle>
          <CardDescription className="text-slate-400 text-base">
            Configure your technical context for a high-fidelity observability report.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 p-8 md:p-12">

          {/* Fila 1: Project & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-[11px] uppercase text-slate-500 font-bold tracking-widest">Project Name</Label>
              <Input
                name="name"
                className="h-12 bg-black/40 border-slate-800 rounded-xl text-white placeholder:text-slate-700"
                placeholder="Ej: Supply Chain Alpha"
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[11px] uppercase text-slate-500 font-bold tracking-widest">Problem Type</Label>
              <Select onValueChange={(v) => setFormData({ ...formData, type: v })} defaultValue="optimization">
                <SelectTrigger className="h-12 bg-black/40 border-slate-800 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  <SelectItem value="optimization">Optimization</SelectItem>
                  <SelectItem value="simulation">Simulation</SelectItem>
                  <SelectItem value="ml">Machine Learning</SelectItem>
                  <SelectItem value="discovery">I&apos;m New / Discovery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Fila 2: Industry Selector */}
          <div className="space-y-3">
            <Label className="text-[11px] uppercase text-slate-500 font-bold tracking-widest">Industry Sector</Label>
            <Select onValueChange={(v) => setFormData({ ...formData, industry: v })}>
              <SelectTrigger className="h-12 bg-black/40 border-slate-800 rounded-xl">
                <SelectValue placeholder="Select vertical industry..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white">
                <SelectItem value="logistics">Logistics & Supply Chain</SelectItem>
                <SelectItem value="finance">Finance & Risk Analysis</SelectItem>
                <SelectItem value="pharma">Pharma & Drug Discovery</SelectItem>
                <SelectItem value="energy">Energy & Grid Optimization</SelectItem>
                <SelectItem value="biotech">Biotech & Genetic Engineering</SelectItem>
                <SelectItem value="cyber">Cybersecurity & Defense</SelectItem>
                <SelectItem value="ai">AI & Tech Infrastructure</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* OPCIONAL: CURRENT STACK BLOQUE */}
          <div className="space-y-4">
            <div
              className="flex items-center gap-2 cursor-pointer text-blue-400 hover:text-blue-300 transition-colors"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Layers className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">
                {showAdvanced ? "- Hide Technical Stack" : "+ Add Current Infrastructure (Optional)"}
              </span>
            </div>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-blue-500/20 bg-blue-500/5 rounded-2xl animate-in fade-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="text-[10px] text-slate-400 font-bold">CURRENT PROVIDER</Label>
                  <Select
                    value={formData.currentProvider}
                    onValueChange={(v) => setFormData({ ...formData, currentProvider: v })}
                  >
                    <SelectTrigger className="h-10 bg-black/60 border-slate-800 rounded-lg text-xs">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="none">None / Exploring</SelectItem>
                      {formData.type !== 'discovery' && INFRA_DATA[formData.type as keyof typeof INFRA_DATA]?.providers.map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-slate-400 font-bold">CURRENT ALGORITHM</Label>
                  <Select
                    value={formData.currentAlgorithm}
                    onValueChange={(v) => setFormData({ ...formData, currentAlgorithm: v })}
                  >
                    <SelectTrigger className="h-10 bg-black/60 border-slate-800 rounded-lg text-xs">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="none">None / Auto-detect</SelectItem>
                      {formData.type !== 'discovery' && INFRA_DATA[formData.type as keyof typeof INFRA_DATA]?.algorithms.map(a => (
                        <SelectItem key={a} value={a}>{a}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Target Priority */}
          <div className="space-y-4">
            <Label className="text-[11px] uppercase text-slate-500 font-bold tracking-widest text-center block">Target Priority</Label>
            <RadioGroup
              defaultValue="cost"
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              onValueChange={(v) => setFormData({ ...formData, priority: v })}
            >
              {[
                { id: 'cost', label: 'Cost', icon: <DollarSign className="text-emerald-500" /> },
                { id: 'speed', label: 'Speed', icon: <Zap className="text-amber-500" /> },
                { id: 'accuracy', label: 'Accuracy', icon: <Target className="text-rose-500" /> }
              ].map((item) => (
                <div key={item.id}>
                  <RadioGroupItem value={item.id} id={item.id} className="peer sr-only" />
                  <Label htmlFor={item.id} className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-black/20 p-4 hover:bg-white/5 cursor-pointer peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/5 transition-all h-full">
                    {item.icon}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label className="text-[11px] uppercase text-slate-500 font-bold tracking-widest">Problem Description</Label>
            <Textarea
              name="problem"
              placeholder="Describe your computational variables, constraints or current challenges..."
              className="min-h-[100px] bg-black/40 border-slate-800 focus:border-blue-500/50 rounded-2xl p-4 text-white placeholder:text-slate-700 resize-none"
              onChange={handleInputChange}
            />
          </div>

          {/* Spend */}
          <div className="space-y-3">
            <Label className="text-[11px] uppercase text-slate-500 font-bold tracking-widest">Monthly Budget Limit ($)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                name="spend"
                type="number"
                placeholder="12500"
                className="h-12 pl-10 bg-black/40 border-slate-800 focus:border-blue-500/50 rounded-xl text-white"
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Submit */}
          <Button
            className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-2xl transition-all shadow-[0_10px_30px_rgba(37,99,235,0.2)] group overflow-hidden"
            onClick={handleStart}
            disabled={loading || !formData.problem || !formData.industry}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin h-5 w-5" />
                GENERATING REPORT...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                RUN ANALYSIS
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}