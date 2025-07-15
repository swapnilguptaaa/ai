import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import './globals.css';
import { Brain, Coffee, Glasses, Heart, Instagram, Linkedin } from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'AI Powered Tutor',
  description: 'Wired by -ash.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex-grow">{children}</div>
            <footer className="w-full py-6 mt-auto border-t border-border bg-background">
            <div className="container mx-auto text-center">
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                Crafted with
                <Brain className="h-4 w-4 inline-block" />
                <Coffee className="h-4 w-4 inline-block" />
                <Glasses className="h-4 w-4 inline-block" />
                <Heart className="h-4 w-4 inline-block fill-current" />
                by SWAG ~ Swapnil Gupta
                </p>
                <div className="flex justify-center gap-6 mt-4">
                <a
                    href="https://www.instagram.com/swapnilguptaaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-muted-foreground transition-transform hover:scale-105 hover:text-foreground"
                >
                    <Instagram className="h-6 w-6" />
                </a>
                <a
                    href="https://www.linkedin.com/in/swapnilguptaaa"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-muted-foreground transition-transform hover:scale-105 hover:text-foreground"
                >
                    <Linkedin className="h-6 w-6" />
                </a>
                </div>
            </div>
            </footer>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
