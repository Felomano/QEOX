import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializamos el cliente de Supabase con las variables de entorno del servidor
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
// Usamos SERVICE_ROLE para que el backend tenga permisos de escritura sin que lo bloquee el RLS

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    // 1. Recibir el body que envías desde el formulario/frontend
    const body = await request.json();
    
    const { org_id, job_id, correlation_id, context } = body;

    // 2. Insertar el Workload en tu tabla de Supabase
    const { data, error } = await supabase
      .from('workloads') // Asegúrate de que el nombre de la tabla sea exacto (workloads o jobs)
      .insert([
        {
          org_id,
          job_id,
          correlation_id,
          context, // Aquí va el JSON con los datos del problema (ej. los camiones de DHL)
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message, hint: error.hint }, { status: 400 });
    }

    // 3. [OPCIONAL] Disparar el Webhook de n8n de forma asíncrona (Fire & Forget)
    // Una vez guardado en base de datos, le avisamos a tu orquestador n8n
    fetch('TU_URL_WEBHOOK_N8N', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ org_id, job_id, correlation_id, context })
    }).catch(err => console.error("Error llamando a n8n:", err)); 
    // .catch evita que si n8n tarda, tu frontend se quede colgado esperando

    return NextResponse.json({ success: true, data }, { status: 201 });

  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}
