import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export function EnterprisePage({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <Link href="/home" className="flex items-center text-slate-500 hover:text-white transition-colors group w-fit no-underline text-[10px] font-black uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        <div className="space-y-2 border-b border-slate-800 pb-4">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">{title}</h1>
          <p className="text-slate-400 text-sm">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">{children ?? <p className="text-slate-300">Enterprise module ready.</p>}</div>
      </div>
    </div>
  )
}
