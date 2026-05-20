'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  User, Search, BarChart2, PlayCircle, ArrowRight,
  Clock, LayoutDashboard, TrendingUp,
  CheckCircle2, DollarSign, Zap, Activity, History, Network, RefreshCw, LineChart as LineChartIcon, PiggyBank, ShieldCheck, Timer, Briefcase, PlusCircle, Users, Bell, Lock, KeyRound, Building2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts'

// Mock de colores para los gráficos
const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [userName, setUserName] = useState('Felipe')
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    totalCost: 0,
    totalSavings: 0,
    avgTimeSaved: 0,
    successRate: 0
  })
  const [recentJobs, setRecentJobs] = useState([])
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadDashboardData() {
      // 1. Obtener Usuario y Org
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserName(user.user_metadata?.full_name?.split(' ')[0] || 'User')
        
        // 2. Cargar datos de la Organización (Asumiendo tabla 'organizations')
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .single()

        // 3. Cargar Métricas Reales de Jobs
        const { data: jobs } = await supabase
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })

        if (jobs) {
          const completed = jobs.filter(j => j.status === 'completed')
          const totalCost = completed.reduce((acc, curr) => acc + (curr.actual_cost || 0), 0)
          const totalEst = completed.reduce((acc, curr) => acc + (curr.estimated_cost || 0), 0)
          
          setMetrics({
            totalJobs: jobs.length,
            totalCost: totalCost,
            totalSavings: totalEst - totalCost,
            avgTimeSaved: 32, // Este valor suele ser un cálculo de benchmark
            successRate: Math.round((completed.length / jobs.length) * 100) || 0
          })
          setRecentJobs(jobs.slice(0, 5))
        }
      }
    }
    loadDashboardData()
  }, [supabase])


  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200">
      
      {/* 🧭 SIDEBAR IZQUIERDO */}
      <aside className="w-72 border-r border-slate-800 bg-[#020617] flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="p-6">
          <Image src="/logoqeox.png" alt="QEOX Logo" width={100} height={32} priority className="object-contain" />
        </div>

        <nav className="flex-1 px-4 pb-6 space-y-4 text-sm">
          <NavSection title="Core" items={[{ href: '/home', icon: LayoutDashboard, label: 'Dashboard' }]} />
          <NavSection title="Workloads" items={[{ href: '/workloads', icon: Briefcase, label: 'All Workloads' }, { href: '/workloads/create', icon: PlusCircle, label: 'Create Workload' }, { href: '/workloads/sample-workload', icon: ArrowRight, label: 'Workload Detail' }]} />
          <NavSection title="Execution" items={[{ href: '/execution/active', icon: PlayCircle, label: 'Active Jobs' }, { href: '/execution/history', icon: History, label: 'Job History' }, { href: '/execution/graph', icon: Network, label: 'Execution Graph' }, { href: '/execution/failover', icon: RefreshCw, label: 'Retry / Failover Monitor' }]} />
          <NavSection title="Discovery" items={[{ href: '/engine', icon: Search, label: 'Engine' }]} />
          <NavSection title="Decision" items={[{ href: '/decide', icon: BarChart2, label: 'Decide' }]} />
          <NavSection title="Observability" items={[{ href: '/observability/runtime-metrics', icon: Activity, label: 'Runtime Metrics' }, { href: '/observability/cost-analytics', icon: LineChartIcon, label: 'Cost Analytics' }, { href: '/observability/savings-dashboard', icon: PiggyBank, label: 'Savings Dashboard' }, { href: '/observability/sla-monitoring', icon: ShieldCheck, label: 'SLA Monitoring' }, { href: '/observability/execution-timeline', icon: Timer, label: 'Execution Timeline' }]} />
          <NavSection title="Policies" items={[{ href: '/settings/policies', icon: ShieldCheck, label: 'Policies' }]} />
          <NavSection title="Providers" items={[{ href: '/settings/providers', icon: Building2, label: 'All Providers' }, { href: '/settings/providers/create', icon: PlusCircle, label: 'Create Provider' }]} />
          <NavSection title="Settings" items={[{ href: '/settings/company', icon: Building2, label: 'Company' }, { href: '/settings/team-roles', icon: Users, label: 'Team & Roles' }, { href: '/settings/api-keys', icon: KeyRound, label: 'API Keys' }, { href: '/settings/notifications', icon: Bell, label: 'Notifications' }, { href: '/settings/security', icon: Lock, label: 'Security' }]} />
        </nav>
      </aside>

      {/* 🖥️ MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        
        {/* 🔝 HEADER */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-end px-8 gap-4 bg-[#020617]/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-slate-400">{userName}</span>
             <div className="bg-violet-500/20 p-2 rounded-full border border-violet-500/30">
               <User className="w-4 h-4 text-violet-400" />
             </div>
          </div>
        </header>

        <main className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* 👋 WELCOME & CTA */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">System Overview</h1>
              <p className="text-slate-400">Real-time optimization metrics for your organization.</p>
            </div>
            <Button onClick={() => router.push('/execution/new')} className="bg-violet-600 hover:bg-violet-700 text-white gap-2 px-6">
              <Zap className="w-4 h-4 fill-current" /> New Job
            </Button>
          </div>

          {/* 📊 KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard label="Total Jobs" val={metrics.totalJobs} icon={LayoutDashboard} color="text-blue-400" />
            <StatCard label="Total Cost" val={`$${metrics.totalCost.toLocaleString()}`} icon={DollarSign} color="text-emerald-400" />
            <StatCard label="Total Saving" val={`$${metrics.totalSavings.toLocaleString()}`} icon={TrendingUp} color="text-violet-400" />
            <StatCard label="Avg Time Saved" val={`${metrics.avgTimeSaved}%`} icon={Clock} color="text-amber-400" />
            <StatCard label="Success Rate" val={`${metrics.successRate}%`} icon={CheckCircle2} color="text-blue-500" />
          </div>

          {/* 📈 CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-slate-900/50 border-slate-800 p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-medium text-slate-300">Cost & Savings over Time</CardTitle>
              </CardHeader>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDataMock}>
                    <defs>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '#1e293b' }} />
                    <Area type="monotone" dataKey="cost" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCost)" />
                    <Area type="monotone" dataKey="savings" stroke="#10b981" fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800 p-6">
                <CardTitle className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Jobs by Status</CardTitle>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieDataStatus} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieDataStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="bg-slate-900/50 border-slate-800 p-6">
                <CardTitle className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">Provider Distribution</CardTitle>
                <div className="h-[180px]">
                   <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieDataProviders} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieDataProviders.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>

          {/* 🕒 RECENT JOBS TABLE */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Recent Jobs</h2>
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-800">
                    <th className="p-4 font-bold">ID</th>
                    <th className="p-4 font-bold">Workload</th>
                    <th className="p-4 font-bold">Tier</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold">Actual Cost</th>
                    <th className="p-4 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-300">
                  {recentJobs.map((job: any) => (
                    <tr 
                      key={job.id} 
                      onClick={() => router.push(`/execution/${job.id}`)}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer transition-colors"
                    >
                      <td className="p-4 font-mono text-xs text-slate-500">{job.id.slice(0,8)}</td>
                      <td className="p-4 font-bold italic tracking-tight">{job.workload_id || 'Optimization Task'}</td>
                      <td className="p-4 text-xs uppercase font-semibold text-violet-400">{job.tier}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          job.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 
                          job.status === 'failed' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono">${job.actual_cost || 0}</td>
                      <td className="p-4 text-slate-500">{new Date(job.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </div>
  )
}

// --- HELPERS & COMPONENTS ---


function NavSection({ title, items }: { title: string; items: { href: string; icon: any; label: string }[] }) {
  return (
    <div className="space-y-1">
      <p className="px-2 text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black">{title}</p>
      {items.map((item) => (
        <NavItem key={item.href} href={item.href} icon={item.icon} label={item.label} />
      ))}
    </div>
  )
}

function NavItem({ href, icon: Icon, label, active = false }: any) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
        active ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}>
        <Icon className="w-5 h-5" />
        <span className={`font-medium ${labelSize}`}>{label}</span>
      </div>
    </Link>
  )
}

function StatCard({ label, val, icon: Icon, color }: any) {
  return (
    <Card className="bg-slate-900/40 border-slate-800 p-5 space-y-3">
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-white tracking-tight italic">{val}</div>
    </Card>
  )
}

// MOCKS PARA GRÁFICOS
const chartDataMock = [
  { name: '01 Apr', cost: 4000, savings: 2400 },
  { name: '07 Apr', cost: 3000, savings: 1398 },
  { name: '14 Apr', cost: 2000, savings: 9800 },
  { name: '21 Apr', cost: 2780, savings: 3908 },
  { name: '28 Apr', cost: 1890, savings: 4800 },
];

const pieDataStatus = [
  { name: 'Completed', value: 45 },
  { name: 'Running', value: 15 },
  { name: 'Failed', value: 5 },
];

const pieDataProviders = [
  { name: 'AWS', value: 50 },
  { name: 'Azure', value: 30 },
  { name: 'IBM Quantum', value: 20 },
];
