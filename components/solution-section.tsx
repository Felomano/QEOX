"use client";

import { ArrowDown, Cpu, Atom, Zap, Database } from "lucide-react";

const flowSteps = [
  {
    icon: Database,
    label: "Business Problem",
    description: "Submit your computational challenge",
  },
  {
    icon: Zap,
    label: "QEOX AI Analysis",
    description: "Intelligent problem classification",
  },
  {
    icon: null,
    label: "Algorithm Selection",
    description: "Optimal approach identification",
  },
];

const executionTargets = [
  { icon: Cpu, label: "CPU / GPU Cloud", color: "from-neon-blue to-neon" },
  { icon: Atom, label: "Quantum Hardware", color: "from-neon-purple to-neon-blue" },
];

export function SolutionSection() {
  return (
    <section id="platform" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-neon-blue/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon/30 bg-neon/10 mb-6">
            <span className="text-xs font-medium text-neon">The Solution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            QEOX is an AI-powered Compute Decision Engine
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Instead of guessing infrastructure, QEOX analyzes your problem and recommends the most efficient execution strategy.
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical flow */}
          <div className="flex flex-col items-center gap-4">
            {flowSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative px-8 py-6 rounded-2xl bg-card border border-border group-hover:border-neon-purple/50 transition-all w-80 text-center">
                    {step.icon && (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center mx-auto mb-3">
                        <step.icon className="w-5 h-5 text-foreground" />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold text-foreground">{step.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                </div>
                {index < flowSteps.length - 1 && (
                  <div className="py-2">
                    <ArrowDown className="w-5 h-5 text-neon-purple" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Branch to execution targets */}
          <div className="flex flex-col items-center mt-4">
            <ArrowDown className="w-5 h-5 text-neon-purple" />
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-neon-purple/50" />
              <span className="font-mono">Execution Layer</span>
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-neon-blue/50" />
            </div>
          </div>

          {/* Execution targets */}
          <div className="grid sm:grid-cols-2 gap-6 mt-8">
            {executionTargets.map((target, index) => (
              <div key={index} className="relative group">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${target.color} opacity-10 blur-lg group-hover:opacity-20 transition-opacity`} />
                <div className="relative px-8 py-6 rounded-2xl bg-card border border-border group-hover:border-neon/50 transition-all text-center">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${target.color} flex items-center justify-center mx-auto mb-4`}>
                    <target.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{target.label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
