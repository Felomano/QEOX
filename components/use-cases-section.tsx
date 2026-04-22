import { Truck, TrendingUp, Microscope, Zap, Brain } from "lucide-react";

const useCases = [
  {
    icon: Truck,
    title: "Logistics Optimization",
    description: "Route planning and supply chain optimization at scale.",
  },
  {
    icon: TrendingUp,
    title: "Financial Portfolio",
    description: "Portfolio optimization and risk analysis with quantum advantage.",
  },
  {
    icon: Microscope,
    title: "Drug Discovery",
    description: "Molecular simulations for pharmaceutical research.",
  },
  {
    icon: Zap,
    title: "Energy Grid",
    description: "Power distribution and renewable energy optimization.",
  },
  {
    icon: Brain,
    title: "Advanced AI Training",
    description: "Accelerated machine learning model optimization.",
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/5 via-transparent to-neon-blue/5" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            Use Cases
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            QEOX powers computational breakthroughs across industries.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-card/50 border border-border hover:border-neon/50 hover:bg-card transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center shrink-0 group-hover:from-neon-purple/30 group-hover:to-neon-blue/30 transition-all">
                  <useCase.icon className="w-6 h-6 text-neon" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {useCase.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {useCase.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
