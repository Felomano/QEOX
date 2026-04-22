"use client";

import { useEffect, useState } from "react";
import { Cpu, Atom, Zap, CircuitBoard } from "lucide-react";

export function HeroVisual() {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-square max-w-lg mx-auto">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 blur-2xl animate-pulse" />

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="lineGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.65 0.25 280)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="oklch(0.75 0.3 180)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="oklch(0.6 0.2 240)" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.65 0.25 280)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="oklch(0.6 0.2 240)" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Lines from center to outer nodes */}
        <line x1="200" y1="200" x2="200" y2="60" stroke="url(#lineGradient2)" strokeWidth="2" className={activeNode === 0 ? "opacity-100" : "opacity-30"} />
        <line x1="200" y1="200" x2="340" y2="200" stroke="url(#lineGradient2)" strokeWidth="2" className={activeNode === 1 ? "opacity-100" : "opacity-30"} />
        <line x1="200" y1="200" x2="200" y2="340" stroke="url(#lineGradient2)" strokeWidth="2" className={activeNode === 2 ? "opacity-100" : "opacity-30"} />
        <line x1="200" y1="200" x2="60" y2="200" stroke="url(#lineGradient2)" strokeWidth="2" className={activeNode === 3 ? "opacity-100" : "opacity-30"} />

        {/* Animated pulse circles */}
        <circle cx="200" cy="200" r="50" fill="none" stroke="url(#lineGradient1)" strokeWidth="1" className="animate-ping" style={{ animationDuration: "3s" }} />
        <circle cx="200" cy="200" r="100" fill="none" stroke="url(#lineGradient1)" strokeWidth="1" className="animate-ping" style={{ animationDuration: "4s", animationDelay: "1s" }} />
      </svg>

      {/* Center AI Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-blue rounded-2xl blur-lg opacity-60" />
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center border border-neon/30">
            <Zap className="w-10 h-10 text-foreground" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-mono text-neon">QEOX</span>
          </div>
        </div>
      </div>

      {/* Classical Computing Node - Top */}
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 transition-all duration-500 ${activeNode === 0 ? "scale-110" : "scale-100"}`}>
        <div className="relative">
          <div className={`absolute inset-0 rounded-xl blur-md transition-opacity ${activeNode === 0 ? "bg-neon/40 opacity-100" : "opacity-0"}`} />
          <div className="relative w-16 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center">
            <Cpu className={`w-8 h-8 transition-colors ${activeNode === 0 ? "text-neon" : "text-muted-foreground"}`} />
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-mono text-muted-foreground">CPU/GPU</span>
          </div>
        </div>
      </div>

      {/* Quantum Node - Right */}
      <div className={`absolute top-1/2 right-4 -translate-y-1/2 transition-all duration-500 ${activeNode === 1 ? "scale-110" : "scale-100"}`}>
        <div className="relative">
          <div className={`absolute inset-0 rounded-xl blur-md transition-opacity ${activeNode === 1 ? "bg-neon-purple/40 opacity-100" : "opacity-0"}`} />
          <div className="relative w-16 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center">
            <Atom className={`w-8 h-8 transition-colors ${activeNode === 1 ? "text-neon-purple" : "text-muted-foreground"}`} />
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-mono text-muted-foreground">Quantum</span>
          </div>
        </div>
      </div>

      {/* Hybrid Node - Bottom */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 transition-all duration-500 ${activeNode === 2 ? "scale-110" : "scale-100"}`}>
        <div className="relative">
          <div className={`absolute inset-0 rounded-xl blur-md transition-opacity ${activeNode === 2 ? "bg-neon-blue/40 opacity-100" : "opacity-0"}`} />
          <div className="relative w-16 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center">
            <CircuitBoard className={`w-8 h-8 transition-colors ${activeNode === 2 ? "text-neon-blue" : "text-muted-foreground"}`} />
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-mono text-muted-foreground">Hybrid</span>
          </div>
        </div>
      </div>

      {/* Cloud Node - Left */}
      <div className={`absolute top-1/2 left-4 -translate-y-1/2 transition-all duration-500 ${activeNode === 3 ? "scale-110" : "scale-100"}`}>
        <div className="relative">
          <div className={`absolute inset-0 rounded-xl blur-md transition-opacity ${activeNode === 3 ? "bg-neon/40 opacity-100" : "opacity-0"}`} />
          <div className="relative w-16 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center">
            <svg className={`w-8 h-8 transition-colors ${activeNode === 3 ? "text-neon" : "text-muted-foreground"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-mono text-muted-foreground">Cloud</span>
          </div>
        </div>
      </div>
    </div>
  );
}
