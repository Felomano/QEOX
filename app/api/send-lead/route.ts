import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const data = await req.json();

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'ffernandezmelo@gmail.com',
    subject: `Nueva solicitud de Demo: ${data.company_name}`,
    text: `Nuevo lead: ${data.nombre} ${data.apellido} (${data.email}) - Puesto: ${data.job_title}`
  });

  return Response.json({ success: true });
}