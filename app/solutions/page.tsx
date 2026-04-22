import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { FlaskConical, TrendingUp, Shield, Factory, Microscope, Landmark } from 'lucide-react'

export default function SolutionsPage() {
  const solutions = [
    {
      icon: FlaskConical,
      title: 'Drug Discovery',
      description: 'Accelerate molecular simulation and protein folding analysis for pharmaceutical research.',
      benefits: ['50x faster molecular modeling', 'Reduced R&D costs', 'Novel compound discovery'],
    },
    {
      icon: TrendingUp,
      title: 'Financial Optimization',
      description: 'Portfolio optimization, risk analysis, and derivative pricing with quantum advantage.',
      benefits: ['Real-time portfolio optimization', 'Enhanced risk modeling', 'Better trading strategies'],
    },
    {
      icon: Shield,
      title: 'Cryptography',
      description: 'Post-quantum cryptography and quantum key distribution for future-proof security.',
      benefits: ['Quantum-safe encryption', 'Secure key distribution', 'Threat detection'],
    },
    {
      icon: Factory,
      title: 'Supply Chain',
      description: 'Optimize logistics, routing, and inventory management with quantum algorithms.',
      benefits: ['30% cost reduction', 'Optimal routing', 'Demand forecasting'],
    },
    {
      icon: Microscope,
      title: 'Materials Science',
      description: 'Discover new materials and optimize chemical processes with quantum simulation.',
      benefits: ['New material discovery', 'Process optimization', 'Energy efficiency'],
    },
    {
      icon: Landmark,
      title: 'Government & Defense',
      description: 'Secure communications, optimization, and advanced modeling for government applications.',
      benefits: ['National security', 'Resource optimization', 'Strategic planning'],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <section className="py-24 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">
                Industry Solutions
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                QEOX delivers quantum advantage across industries, solving problems that
                were previously impossible or impractical with classical computing.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {solutions.map((solution) => (
                <Card key={solution.title} className="border-border bg-card hover:border-neon-purple/50 transition-colors">
                  <CardHeader>
                    <solution.icon className="h-10 w-10 text-neon mb-2" />
                    <CardTitle className="text-foreground">{solution.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {solution.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {solution.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-neon-purple" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-16">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-neon-purple text-foreground hover:bg-neon-purple/90">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
