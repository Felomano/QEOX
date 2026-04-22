import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Check } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for learning and experimentation',
      features: [
        '1,000 API calls/month',
        'Access to quantum simulators',
        'Community support',
        'Basic analytics',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$99',
      period: '/month',
      description: 'For teams building quantum-powered applications',
      features: [
        '50,000 API calls/month',
        'Real quantum hardware access',
        'Priority support',
        'Advanced analytics',
        'Team collaboration',
        'Custom integrations',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For organizations with advanced needs',
      features: [
        'Unlimited API calls',
        'Dedicated quantum resources',
        '24/7 premium support',
        'Custom SLAs',
        'On-premise deployment',
        'Advanced security',
        'Custom algorithms',
      ],
      cta: 'Contact Sales',
      popular: false,
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
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                Start free and scale as you grow. No hidden fees, no surprises.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {plans.map((plan) => (
                <Card 
                  key={plan.name} 
                  className={`border-border bg-card relative ${plan.popular ? 'border-neon-purple ring-1 ring-neon-purple' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-neon-purple text-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-foreground text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    <CardDescription className="text-muted-foreground mt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3 text-muted-foreground">
                          <Check className="h-5 w-5 text-neon shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/auth/sign-up" className="block">
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-neon-purple text-foreground hover:bg-neon-purple/90' : 'bg-secondary text-foreground hover:bg-muted'}`}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 border-t border-border">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Need a Custom Solution?</h2>
            <p className="text-muted-foreground mb-8">
              Contact our sales team to discuss your specific requirements and get a tailored pricing plan.
            </p>
            <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-muted">
              Talk to Sales
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
