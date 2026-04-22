export function ArchitectureSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
            Platform Architecture
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            A layered approach to computational orchestration.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Architecture Layers */}
          <div className="space-y-4">
            {/* Applications Layer */}
            <div className="relative">
              <div className="px-8 py-6 rounded-2xl bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border border-neon-purple/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Applications</h3>
                    <p className="text-sm text-muted-foreground">Your business applications and services</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 rounded-full bg-secondary text-xs font-mono text-muted-foreground">Web</div>
                    <div className="px-3 py-1 rounded-full bg-secondary text-xs font-mono text-muted-foreground">API</div>
                    <div className="px-3 py-1 rounded-full bg-secondary text-xs font-mono text-muted-foreground">SDK</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="w-px h-8 bg-gradient-to-b from-neon-purple/50 to-neon/50" />
            </div>

            {/* QEOX intelligence Layer */}
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 blur-lg" />
              <div className="relative px-8 py-8 rounded-2xl bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 border border-neon/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center">
                        <span className="font-mono text-xs font-bold text-foreground">Q</span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground">QNEX AI Orchestration Layer</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Intelligent routing, algorithm selection, and resource optimization</p>
                  </div>
                  <div className="hidden sm:flex flex-col gap-1 text-right">
                    <span className="text-xs font-mono text-neon">Problem Analysis</span>
                    <span className="text-xs font-mono text-neon-purple">Algorithm Selection</span>
                    <span className="text-xs font-mono text-neon-blue">Resource Optimization</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="w-px h-8 bg-gradient-to-b from-neon/50 to-neon-blue/50" />
            </div>

            {/* Execution Layer */}
            <div className="relative">
              <div className="px-8 py-6 rounded-2xl bg-card border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Execution Layer</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Classical Cloud */}
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <h4 className="font-medium text-foreground mb-2">Classical Cloud</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-neon-blue/10 text-xs font-mono text-neon-blue">AWS</span>
                      <span className="px-2 py-0.5 rounded-md bg-neon-blue/10 text-xs font-mono text-neon-blue">GCP</span>
                      <span className="px-2 py-0.5 rounded-md bg-neon-blue/10 text-xs font-mono text-neon-blue">Azure</span>
                    </div>
                  </div>
                  {/* Quantum Cloud */}
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <h4 className="font-medium text-foreground mb-2">Quantum Cloud</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-neon-purple/10 text-xs font-mono text-neon-purple">IBM</span>
                      <span className="px-2 py-0.5 rounded-md bg-neon-purple/10 text-xs font-mono text-neon-purple">IonQ</span>
                      <span className="px-2 py-0.5 rounded-md bg-neon-purple/10 text-xs font-mono text-neon-purple">Rigetti</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
