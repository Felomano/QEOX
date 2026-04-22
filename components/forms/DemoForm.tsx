'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DemoForm() {
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', company_name: '',
    job_title: '', phone: '', company_size: '', country: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    // 1. Guardar en Supabase
    const { error } = await supabase.from('leads').insert([formData]);

    if (!error) {
      // 2. Llamar a tu API Route para enviar el email
      await fetch('/api/send-lead', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      alert('Demo solicitada con éxito.');
    } else {
      console.error('Error saving lead:', error);
      alert('Hubo un error al procesar la solicitud.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto bg-slate-900 p-8 rounded-2xl shadow-2xl border border-white/5">
      <div className="grid grid-cols-2 gap-4">
        <input required placeholder="Nombre" onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="bg-slate-800 p-2 rounded text-white border border-transparent focus:border-blue-500 outline-none transition-all" />
        <input required placeholder="Apellido" onChange={e => setFormData({ ...formData, apellido: e.target.value })} className="bg-slate-800 p-2 rounded text-white border border-transparent focus:border-blue-500 outline-none transition-all" />
      </div>

      <input required type="email" placeholder="Correo corporativo" onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-800 p-2 rounded text-white border border-transparent focus:border-blue-500 outline-none transition-all" />

      <input required placeholder="Compañía" onChange={e => setFormData({ ...formData, company_name: e.target.value })} className="w-full bg-slate-800 p-2 rounded text-white border border-transparent focus:border-blue-500 outline-none transition-all" />

      <select required onChange={e => setFormData({ ...formData, job_title: e.target.value })} className="w-full bg-slate-800 p-2 rounded text-slate-300 border border-transparent focus:border-blue-500 outline-none transition-all cursor-pointer">
        <option value="">Puesto</option>
        <option>Ingeniero de Operaciones de TI</option>
        <option>Ejecutivo de Operaciones TI</option>
        <option>Arquitecto</option>
        <option>DevOps</option>
        <option>Desarrollador/Ingeniero</option>
        <option>Ejecutivo Empresarial</option>
        <option>Soporte</option>
        <option>Adquisiciones</option>
        <option>Otro</option>
      </select>

      <input required placeholder="Teléfono" onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-800 p-2 rounded text-white border border-transparent focus:border-blue-500 outline-none transition-all" />

      <select required onChange={e => setFormData({ ...formData, company_size: e.target.value })} className="w-full bg-slate-800 p-2 rounded text-slate-300 border border-transparent focus:border-blue-500 outline-none transition-all cursor-pointer">
        <option value="">Tamaño compañía</option>
        <option>Solo yo</option>
        <option>2-20</option>
        <option>21-100</option>
        <option>101-1000</option>
        <option>+1000</option>
      </select>

      {/* Selector de Países Optimizado */}
      <select
        required
        onChange={e => setFormData({ ...formData, country: e.target.value })}
        className="w-full bg-slate-800 p-2 rounded text-slate-300 border border-transparent focus:border-blue-500 outline-none transition-all cursor-pointer"
      >
        <option value="">Selecciona tu país</option>

        <optgroup label="Europa">
          <option value="España">España</option>
          <option value="Alemania">Alemania</option>
          <option value="Austria">Austria</option>
          <option value="Bélgica">Bélgica</option>
          <option value="Dinamarca">Dinamarca</option>
          <option value="Finlandia">Finlandia</option>
          <option value="Francia">Francia</option>
          <option value="Grecia">Grecia</option>
          <option value="Irlanda">Irlanda</option>
          <option value="Italia">Italia</option>
          <option value="Noruega">Noruega</option>
          <option value="Países Bajos">Países Bajos</option>
          <option value="Polonia">Polonia</option>
          <option value="Portugal">Portugal</option>
          <option value="Reino Unido">Reino Unido</option>
          <option value="Suecia">Suecia</option>
          <option value="Suiza">Suiza</option>
        </optgroup>

        <optgroup label="Norteamérica">
          <option value="Estados Unidos">Estados Unidos</option>
          <option value="Canadá">Canadá</option>
          <option value="México">México</option>
        </optgroup>

        <optgroup label="Centroamérica y Caribe">
          <option value="Costa Rica">Costa Rica</option>
          <option value="El Salvador">El Salvador</option>
          <option value="Guatemala">Guatemala</option>
          <option value="Honduras">Honduras</option>
          <option value="Nicaragua">Nicaragua</option>
          <option value="Panamá">Panamá</option>
          <option value="Puerto Rico">Puerto Rico</option>
          <option value="República Dominicana">República Dominicana</option>
        </optgroup>

        <optgroup label="Sudamérica">
          <option value="Argentina">Argentina</option>
          <option value="Bolivia">Bolivia</option>
          <option value="Brasil">Brasil</option>
          <option value="Chile">Chile</option>
          <option value="Colombia">Colombia</option>
          <option value="Ecuador">Ecuador</option>
          <option value="Paraguay">Paraguay</option>
          <option value="Perú">Perú</option>
          <option value="Uruguay">Uruguay</option>
          <option value="Venezuela">Venezuela</option>
        </optgroup>

        <option value="Otro">Otro país...</option>
      </select>

      <button className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded font-black text-white uppercase transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20">
        Contactar
      </button>
    </form>
  )
}