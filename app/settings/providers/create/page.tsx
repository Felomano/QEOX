import { EnterprisePage } from '@/components/dashboard/enterprise-page'
import Link from 'next/link'
export default function Page() { return <EnterprisePage title="Create Provider" subtitle="Onboard a new provider and define credentials, pricing, and priority."><Link href="/settings/providers" className="text-cyan-400 underline">Open provider inventory</Link></EnterprisePage> }
