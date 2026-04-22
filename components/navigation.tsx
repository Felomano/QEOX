"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Importante para optimizar el logo
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Product", href: "/product" },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* LOGO QEOX ACTUALIZADO */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center">
              <Image
                src="/logoqeox.png" // Asegúrate de que el nombre coincida con tu archivo en /public
                alt="QEOX Logo"
                width={140} // Ajuste de tamaño profesional para el navbar
                height={52}
                priority
                className="drop-shadow-[0_0_10px_rgba(100,200,255,0.2)]"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Log in
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 font-bold">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-muted-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>
                  <Button size="sm" className="w-full bg-foreground text-background">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
