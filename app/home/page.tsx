'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  User,
  Search,
  BarChart2,
  PlayCircle,
  Settings,
  ArrowRight,
  Clock,
  Key,
  Building2,
  SlidersHorizontal,
  LogOut,
  ChevronDown,
  Shield
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const [userName, setUserName] = useState('Felipe')
  const supabase = createClient()
  const router = useRouter()

  const hasAnalysis = true

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0])
      }
    }
    getUserData()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">

      {/* 🔝 1. HEADER CORREGIDO */}
      <header className="border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/home" className="flex items-center">
            <Image
              src="/logoqeox.png" // Ruta actualizada a la carpeta public
              alt="QEOX Logo"
              width={120} // Ancho ligeramente mayor para mejor legibilidad
              height={40}
              priority // Carga prioritaria para evitar parpadeos
              className="object-contain cursor-pointer hover:brightness-110 transition-all"
            />
          </Link>

          <div className="flex items-center gap-3">
            {/* ⚙️ MENÚ SETTINGS */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800/50">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-800 text-slate-200">
                <DropdownMenuLabel className="text-slate-400 font-normal">System Settings</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />

                <Link href="/settings/providers">
                  <DropdownMenuItem className="cursor-pointer focus:bg-slate-800">
                    <Key className="mr-2 h-4 w-4 text-blue-400" />
                    <span>Providers & API Keys</span>
                  </DropdownMenuItem>
                </Link>

                {/* 🛡️ NUEVA OPCIÓN: POLICIES */}
                <Link href="/settings/policies">
                  <DropdownMenuItem className="cursor-pointer focus:bg-slate-800">
                    <Shield className="mr-2 h-4 w-4 text-blue-400" />
                    <span>Execution Policies</span>
                  </DropdownMenuItem>
                </Link>

                <Link href="/settings/company">
                  <DropdownMenuItem className="cursor-pointer focus:bg-slate-800">
                    <Building2 className="mr-2 h-4 w-4 text-blue-400" />
                    <span>Company Info</span>
                  </DropdownMenuItem>
                </Link>

                <Link href="/settings/preferences">
                  <DropdownMenuItem className="cursor-pointer focus:bg-slate-800">
                    <SlidersHorizontal className="mr-2 h-4 w-4 text-blue-400" />
                    <span>Preferences</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 👤 MENÚ PERFIL */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-full px-2 text-slate-400 hover:text-white hover:bg-slate-800/50">
                  <div className="bg-blue-500/20 p-1.5 rounded-full">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-slate-200">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer focus:bg-slate-800">
                    View Profile
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-400 cursor-pointer focus:bg-red-950 focus:text-red-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">

        {/* 👋 2. WELCOME */}
        <section className="space-y-2 text-left">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Welcome back, <span className="text-blue-500">{userName}</span>
          </h1>
          <p className="text-slate-400 text-lg">
            You have <span className="text-blue-400 font-medium">2 active workloads</span> and
            <span className="text-green-400 font-medium ml-1">$135k potential savings</span> identified.
          </p>
        </section>

        {/* 🔥 3. CORE ACTIONS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/engine">
            <Card className="group relative overflow-hidden bg-slate-900/40 border-slate-800 hover:border-blue-500/50 transition-all duration-300 h-full cursor-pointer">
              <CardContent className="p-8 space-y-4 text-left">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Discover</h3>
                  <p className="text-slate-400 text-sm mt-1">Simulate and explore solutions across any infrastructure.</p>
                </div>
                <div className="flex items-center text-blue-400 text-sm font-medium pt-2">
                  Run new analysis <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/decide">
            <Card className="group bg-slate-900/40 border-slate-800 hover:border-purple-500/50 transition-all duration-300 h-full cursor-pointer">
              <CardContent className="p-8 space-y-4 text-left">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Decide</h3>
                  <p className="text-slate-400 text-sm mt-1">
                    {hasAnalysis ? "Compare options and strategic insights." : "Perform an analysis to see insights."}
                  </p>
                </div>
                <div className="flex items-center text-purple-400 text-sm font-medium pt-2">
                  View recommendations <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/execution">
            <Card className="group bg-slate-900/40 border-slate-800 hover:border-green-500/50 transition-all duration-300 h-full cursor-pointer">
              <CardContent className="p-8 space-y-4 text-left">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase italic tracking-tighter">Execute</h3>
                  <p className="text-slate-400 text-sm mt-1">Run and monitor workloads in production environments.</p>
                </div>
                <div className="flex items-center text-green-400 text-sm font-medium pt-2">
                  Manage execution <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </section>

        {/* 📈 4. RECENT WORKLOADS */}
        <section className="space-y-6 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
              <Clock className="w-5 h-5 text-slate-500" /> Recent Workloads
            </h2>
            <Button variant="link" className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-widest text-[10px]">View All</Button>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Route Optimization', status: 'Running', progress: '65%', color: 'text-blue-400' },
              { name: 'Portfolio Optimization', status: 'Completed', progress: '100%', color: 'text-green-400' },
              { name: 'Demand Forecasting', status: 'Completed', progress: '100%', color: 'text-green-400' },
            ].map((workload, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-900/20 border border-slate-800/50 rounded-lg hover:bg-slate-900/40 transition-colors">
                <span className="font-bold text-slate-300 italic uppercase tracking-tight">{workload.name}</span>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                  <span className={workload.color}>{workload.status}</span>
                  <span className="text-slate-600 font-mono">{workload.progress}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}

function SummaryItem({ label, val, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-slate-600" />
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-[11px] font-black text-white italic">{val}</span>
    </div>
  )
}
