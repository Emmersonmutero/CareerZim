import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "CareerZim — Your AI Career Assistant",
  description: "Build your CV, discover Zimbabwe jobs, tailor applications and manage your career — all in one place.",
  openGraph: { title: "CareerZim", description: "Zimbabwe-first AI career assistant: CVs, jobs, matching, applications.", type: "website" },
  manifest: "/manifest.json",
};
export const viewport: Viewport = { themeColor: "#064E3B", width: "device-width", initialScale: 1 };

const themeInit = `(function(){try{var t=localStorage.getItem('cz_theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Browser extensions (e.g. Grammarly) inject data-* attributes onto <body> before React
  // hydrates. suppressHydrationWarning only covers the element it is placed on, so it must be
  // repeated on <body> — the one on <html> does not cascade to children.
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /></head>
      <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

