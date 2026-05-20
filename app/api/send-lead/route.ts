import { Resend } from 'resend';

export async function POST(req: Request) {
  const data = await req.json();
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return Response.json({ error: 'RESEND_API_KEY is not configured.' }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'ffernandezmelo@gmail.com',
    subject: `Nueva solicitud de Demo: ${data.company_name}`,
    text: `Nuevo lead: ${data.nombre} ${data.apellido} (${data.email}) - Puesto: ${data.job_title}`,
  });

  return Response.json({ success: true });
}
