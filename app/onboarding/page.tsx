'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    full_name: '',
    work_email: '',
    role: '',
    company_name: '',
    industry: '',
    company_size: ''
  })

  const updateProfile = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user?.id,
        ...formData,
        onboarding_completed: true
      })

    if (!error) setStep(4) // Ir a Ready Screen
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md border-border bg-card">
        <CardContent className="pt-6">

          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <h1 className="text-3xl font-bold text-foreground">Welcome to QEOX</h1>
              <p className="text-muted-foreground">Optimize your computational workloads across any infrastructure.</p>
              <Button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
          )}

          {/* STEP 2: USER INFO */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Tell us about you</h2>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Work Email</Label>
                <Input type="email" value={formData.work_email} onChange={e => setFormData({ ...formData, work_email: e.target.value })} placeholder="name@company.com" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select onValueChange={v => setFormData({ ...formData, role: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineer">Engineer</SelectItem>
                    <SelectItem value="Data Scientist">Data Scientist</SelectItem>
                    <SelectItem value="CTO">CTO / Tech Lead</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setStep(3)} className="w-full">Continue</Button>
            </div>
          )}

          {/* STEP 3: COMPANY INFO */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your company</h2>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select onValueChange={v => setFormData({ ...formData, industry: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Industry" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Finance">Finance & Risk Analysis</SelectItem>
                    <SelectItem value="Logistics">Logistics & Supply Chain</SelectItem>
                    <SelectItem value="Pharma">Pharma & Drug Discovery</SelectItem>
                    <SelectItem value="Biotech">Biotech & Genetic Engineering</SelectItem>
                    {/* CORREGIDO: Ahora cierra correctamente con / */}
                    <SelectItem value="Energy">Energy and Grid Optimization</SelectItem>
                    <SelectItem value="Cyber">Cybersecurity & Defense</SelectItem>
                    <SelectItem value="AI">AI & Tech Infrastructure</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Company Size</Label>
                <Select onValueChange={v => setFormData({ ...formData, company_size: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Size" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1–10</SelectItem>
                    <SelectItem value="11-50">11–50</SelectItem>
                    <SelectItem value="51-200">51–200</SelectItem>
                    <SelectItem value="200+">200+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={updateProfile} disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Finish Setup'}
              </Button>
            </div>
          )}

          {/* STEP 4: READY */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="text-4xl">🚀</div>
              <h1 className="text-2xl font-bold text-foreground">You're ready</h1>
              <p className="text-muted-foreground">Let’s run your first analysis</p>
              <Button onClick={() => router.push('/dashboard')} className="w-full bg-green-600 hover:bg-green-700">
                New Analysis
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  )
}