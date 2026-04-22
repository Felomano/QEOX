import { Brain, Network, Layers, Code2 } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Decision Engine",
    description: "Automatically determines whether classical or quantum computing is optimal for your specific problem.",
    gradient: "from-neon-purple to-neon-blue",
  },
  {
    icon: Network,
    title: "Infrastructure Comparison",
    description: "Presents clear insights across leading providers and technology alternatives to optimize your specific workload.",
    gradient: "from-neon-blue to-neon",
  },
  {
    icon: Layers,
    title: "Hybrid Computing Engine",
    description: "Seamlessly combines classical optimization algorithms with quantum circuits for maximum efficiency.",
    gradient: "from-neon to-neon-purple",
  },
  {
    icon: Code2,
    title: "Inefficiency Detection",
    description: "Submit complex computational problems via our dedicated intelligence interface.",
    gradient: "from-neon-purple to-neon",
  },
];

export function FeaturesSection() {
  return (
    <section id="technology" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/30 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            Key Features
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Built for the future of computation with enterprise-grade capabilities.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-3xl bg-card border border-border hover:border-neon-purple/50 transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-neon-purple/5 via-transparent to-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
