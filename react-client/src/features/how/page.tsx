import { ArrowLeft, ArrowRight } from "lucide-react";
import { ModeToggle } from "@/components/dark-mode-toggle";
import Layout from "@/components/layout/layout";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { GuideContent } from "./content";

export default function HowPage() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <a className="guide-skip" href="#guide">Skip to guide</a>
      <Layout variant="article">
        <nav className="guide-nav" aria-label="Main navigation">
          <Button asChild variant="outline" className="gap-2">
            <a href="/"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to jobs</a>
          </Button>
          <ModeToggle />
        </nav>
        <div className="guide-scroll" role="region" aria-label="Visa guide" tabIndex={0}>
        <article id="guide" className="guide-article" tabIndex={-1}>
          <header className="guide-header">
            <p className="guide-eyebrow">THE H-1B1 GUIDE</p>
            <h1>How does the H-1B1 visa work?</h1>
            <p className="guide-intro">A practical guide for employers hiring Singaporeans to work in the United States.</p>
            <p className="guide-edition">Guide and tips for employers · 2025 edition</p>
          </header>
          <nav className="guide-contents" aria-label="On this page">
            <p>On this page</p>
            <a href="#costs"><span>01</span> Costs for employers</a>
            <a href="#timeline"><span>02</span> Processing timeline</a>
            <a href="#documentation"><span>03</span> Required documentation</a>
          </nav>
          <GuideContent />
          <div className="guide-next">
            <Button asChild className="gap-2">
              <a href="/">Browse the jobs table <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
            </Button>
          </div>
          <p className="guide-disclaimer">
            This guide is for general information only and does not constitute legal advice.
          </p>
        </article>
        </div>
      </Layout>
    </ThemeProvider>
  );
}
