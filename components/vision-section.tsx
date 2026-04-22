export function VisionSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-purple/10 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
          &ldquo;QEOX is building the intelligence layer for the future of computation.&rdquo;
        </h2>
        <p className="mt-8 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          We envision a future where classical CPUs, GPUs, and quantum processors work together seamlessly — where developers focus on problems, not infrastructure.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-neon">3+</div>
            <div className="text-sm text-muted-foreground mt-1">Quantum Providers</div>
          </div>
          <div className="w-px h-16 bg-border hidden sm:block" />
          <div className="text-center">
            <div className="text-4xl font-bold text-neon-purple">99.9%</div>
            <div className="text-sm text-muted-foreground mt-1">Uptime SLA</div>
          </div>
          <div className="w-px h-16 bg-border hidden sm:block" />
          <div className="text-center">
            <div className="text-4xl font-bold text-neon-blue">10x</div>
            <div className="text-sm text-muted-foreground mt-1">Faster Development</div>
          </div>
        </div>
      </div>
    </section>
  );
}
