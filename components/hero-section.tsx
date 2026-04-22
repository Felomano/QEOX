"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react"; // He quitado Play si no lo usas
import { HeroVisual } from "./hero-visual";
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/10 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* COLUMNA IZQUIERDA: TEXTO */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-purple/30 bg-neon-purple/10 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
              </span>
              <span className="text-xs font-medium text-neon"></span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance leading-tight">
              The Intelligent Layer Between Classical and Quantum Computing
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 text-pretty">
              QEOX analyzes your computational problem and automatically selects the best algorithm and infrastructure — classical, GPU, or quantum.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/request-demo" className="contents">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 gap-2">
                  Request Demo
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* COLUMNA DERECHA: VISUAL */}
          <div className="relative flex justify-center lg:justify-end">
            <HeroVisual />
          </div>

        </div> {/* Cierre del Grid */}
      </div> {/* Cierre del Container */}
    </section>
  );
}