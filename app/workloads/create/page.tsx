import { EnterprisePage } from '@/components/dashboard/enterprise-page'
import Link from 'next/link'

export default function CreateWorkloadPage() {
  return <EnterprisePage title="Create Workload" subtitle="Define and launch new enterprise workloads."><Link href="/execution/new" className="text-cyan-400 underline">Go to workload creation form</Link></EnterprisePage>
}
