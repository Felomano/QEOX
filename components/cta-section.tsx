import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section id="contact" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-neon-purple/10 via-neon-blue/5 to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl" />
      
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
          Join the Next Generation of Computing Infrastructure
        </h2>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
          Be among the first to experience the future of computational orchestration.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 gap-2">
            Request Demo
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="border-neon-purple/50 text-foreground hover:bg-neon-purple/10">
            Join Early Access
          </Button>
        </div>
      </div>
    </section>
  );
}
