"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

const codeExample = `import qnex

# Initialize the QNEX client
client = qnex.Client(api_key="your_api_key")

# Submit an optimization problem
result = client.solve(
    problem_type="optimization",
    dataset=data,
    config={
        "max_iterations": 1000,
        "precision": "high"
    }
)

# QNEX automatically selects optimal compute
print(f"Execution: {result.compute_type}")  # classical | quantum | hybrid
print(f"Solution: {result.solution}")`;

export function DevelopersSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/5 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-blue/30 bg-neon-blue/10 mb-6">
              <span className="text-xs font-medium text-neon-blue">For Developers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
              Simple API, Powerful Results
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Submit complex computational problems with a few lines of code. QEOX handles the complexity of choosing and executing on the right infrastructure.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button className="bg-foreground text-background hover:bg-foreground/90">
                View Documentation
              </Button>
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary">
                Explore Examples
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 blur-xl" />
            <div className="relative rounded-2xl bg-card border border-border overflow-hidden">
              {/* Code header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-chart-4/50" />
                  <div className="w-3 h-3 rounded-full bg-neon/50" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">example.py</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-md hover:bg-secondary transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-neon" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              {/* Code content */}
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono">
                  <code className="text-muted-foreground">
                    {codeExample.split('\n').map((line, i) => (
                      <div key={i} className="leading-relaxed">
                        <span className="text-muted-foreground/50 select-none mr-4">{String(i + 1).padStart(2, ' ')}</span>
                        {line.includes('import') && <span className="text-neon-purple">{line}</span>}
                        {line.includes('#') && !line.includes('import') && <span className="text-muted-foreground/70">{line}</span>}
                        {line.includes('client') && !line.includes('#') && (
                          <span>
                            <span className="text-foreground">{line.split('=')[0]}=</span>
                            <span className="text-neon-blue">{line.split('=')[1]}</span>
                          </span>
                        )}
                        {line.includes('result') && !line.includes('#') && !line.includes('print') && (
                          <span>
                            <span className="text-foreground">{line.split('=')[0]}=</span>
                            <span className="text-neon">{line.split('=').slice(1).join('=')}</span>
                          </span>
                        )}
                        {line.includes('print') && (
                          <span className="text-neon">{line}</span>
                        )}
                        {(line.includes('problem_type') || line.includes('dataset') || line.includes('config') || line.includes('max_iterations') || line.includes('precision')) && (
                          <span className="text-foreground">{line}</span>
                        )}
                        {line.trim() === ')' && <span className="text-foreground">{line}</span>}
                        {line.trim() === '}' && <span className="text-foreground">{line}</span>}
                        {line.trim() === '' && ' '}
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
