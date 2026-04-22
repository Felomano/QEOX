import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Cpu, Zap, Shield, BarChart3, Cloud, Code2 } from 'lucide-react'

export default function ProductPage() {
  const features = [
    {
      icon: Cpu,
      title: 'Quantum Algorithm Library',
      description: 'Access our extensive library of pre-optimized quantum algorithms including QAOA, VQE, Grover, and Shor.',
    },
    {
      icon: Zap,
      title: 'Intelligent Routing',
      description: 'AI-powered decision engine automatically routes your problems to the most efficient compute resource.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'End-to-end encryption, SOC2 compliance, and dedicated instances for sensitive workloads.',
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Real-time dashboards showing quantum vs classical performance comparisons and cost analysis.',
    },
    {
      icon: Cloud,
      title: 'Multi-Cloud Support',
      description: 'Seamlessly connect to IBM, Google, IonQ, Rigetti, and AWS quantum hardware providers.',
    },
    {
      icon: Code2,
      title: 'SDK & APIs',
      description: 'Native SDKs for Python, JavaScript, and REST APIs for easy integration into your workflow.',
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
                The Complete Quantum Computing Platform
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                QEOX provides everything you need to harness the power of quantum computing,
                from algorithm selection to hardware optimization.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="border-border bg-card hover:border-neon-purple/50 transition-colors">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-neon-purple mb-2" />
                    <CardTitle className="text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-16">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-neon-purple text-foreground hover:bg-neon-purple/90">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 px-4 border-t border-border">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">How It Works</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Submit Your Problem</h3>
                <p className="text-muted-foreground">Describe your computational problem using our intuitive API or web interface.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI Analysis</h3>
                <p className="text-muted-foreground">Our AI analyzes your problem and selects the optimal algorithm and hardware.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-neon-purple/20 text-neon-purple flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Get Results</h3>
                <p className="text-muted-foreground">Receive optimized results with detailed performance metrics and insights.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
