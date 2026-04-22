import DemoForm from '@/components/forms/DemoForm'
import { BrainCircuit, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function RequestDemoPage() {
  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 selection:bg-blue-500/30">
      {/* Fondo decorativo sutil */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(30,58,138,0.05),transparent)] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-12 md:py-20">

        {/* Navegación de retorno */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-12"
        >
          <ChevronLeft size={14} /> Back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Columna Izquierda: Mensaje de Valor */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <BrainCircuit className="text-blue-500" size={20} />
                </div>
                <span className="text-[10px] font-black text-blue-400 tracking-[0.4em] uppercase">Intelligence Hub</span>
              </div>
              <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                Solicitar <span className="text-blue-600">Demo</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Descubre cómo la inteligencia predictiva de QEOX puede optimizar tus cargas de trabajo y reducir costes operativos en tiempo real.
              </p>
            </div>

            {/* Puntos clave */}
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 h-1 w-1 rounded-full bg-blue-500" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Análisis de infraestructura gratuito</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 h-1 w-1 rounded-full bg-blue-500" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Estimación de ahorro personalizada</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 h-1 w-1 rounded-full bg-blue-500" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Soporte técnico directo</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: El Formulario */}
          <div className="relative">
            {/* Efecto de brillo detrás del form */}
            <div className="absolute -inset-4 bg-blue-600/10 blur-3xl rounded-full opacity-50" />
            <div className="relative">
              <DemoForm />
            </div>
          </div>

        </div>

        {/* Footer sutil */}
        <div className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-[9px] text-slate-600 uppercase font-bold tracking-[0.3em]">
            © 2026 QEOX
          </p>
        </div>
      </div>
    </div>
  )
}