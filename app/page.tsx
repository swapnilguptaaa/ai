
'use client';

import { DoubtSolverPage } from '@/components/doubt-solver-page';
import { MousePointer2 } from 'lucide-react';

export default function Home() {
  return (
    <main className="container relative mx-auto px-4 py-8 md:py-12">
      <header className="text-center mb-4 pt-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-foreground">
          AI Powered Tutor
        </h1>
        <p className="text-md md:text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          wired by
          <br />
          <span className="relative inline-block mt-2">
            <span
              className="font-league-spartan font-bold text-4xl md:text-5xl text-foreground transition-colors hover:text-accent inline-block"
            >
              SWAG
            </span>
            <MousePointer2 className="absolute bottom-0 right-0 h-5 w-5 text-muted-foreground -mb-2 -mr-2 md:-mr-5" />
          </span>
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Responses by Gemini API
        </p>
      </header>
      <DoubtSolverPage />
    </main>
  );
}
