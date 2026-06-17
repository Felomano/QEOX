import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Insertamos exactamente los campos que vienen de tu formulario frontend
    const { data, error } = await supabase
      .from('workloads')
      .insert([
        {
          workload_name: body.workload_name,
          lifecycle_status: body.lifecycle_status,
          industry: body.industry,
          total_cumulative_cost: body.total_cumulative_cost,
          config_qubits: body.config_qubits,
          config_shots: body.config_shots,
          parameters: body.context, // Guardamos los inputs de estrategia aquí
          created_at: new Date().toISOString()
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Retornamos el éxito y el ID generado para que el frontend redirija
    return NextResponse.json({ success: true, data }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
