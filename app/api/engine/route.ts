import { NextResponse } from 'next/navigation'

export async function POST(request: Request) {
  const body = await request.json()

  // El servidor de Vercel SÍ puede llamar a HTTP sin bloqueos
  const res = await fetch('http://135.181.86.147/webhook/qnex-infrastructure-advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  return NextResponse.json({ ok: res.ok })
}