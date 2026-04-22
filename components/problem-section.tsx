import { AlertTriangle, HelpCircle, DollarSign, Puzzle } from "lucide-react";

const challenges = [
  {
    icon: Puzzle,
    title: "Fragmented Platforms",
    description: "Multiple quantum providers with incompatible interfaces and programming models.",
  },
  {
    icon: HelpCircle,
    title: "Complex Programming",
    description: "Quantum algorithms require specialized knowledge that most teams lack.",
  },
  {
    icon: AlertTriangle,
    title: "Uncertain Advantage",
    description: "Difficulty determining when quantum computing actually outperforms classical.",
  },
  {
    icon: DollarSign,
    title: "Expensive Experiments",
    description: "High costs for trial-and-error approaches to quantum computing adoption.",
  },
];

export function ProblemSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/5 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            The Quantum Computing Dilemma
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Organizations struggle to determine when and how to leverage quantum computing effectively.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {challenges.map((challenge, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-neon-purple/50 transition-all duration-300"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <challenge.icon className="w-6 h-6 text-neon-purple" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {challenge.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {challenge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
