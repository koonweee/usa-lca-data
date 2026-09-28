import { PageFooter } from "@/components/layout/page-footer";

interface LayoutProps {
  children: React.ReactNode;
  variant?: "jobs" | "article";
  footer?: React.ReactNode;
}

export default function Layout({ children, variant = "jobs", footer = <PageFooter /> }: LayoutProps) {
  return (
    <div className={`app-shell${variant === "article" ? " article-layout" : ""}`}>
      <main className="app-main">
        <div className="app-container container px-0 xl:px-6 xl:pt-6">
          <section className="app-section">
            <div className="app-panel rounded-[1rem] xl:border bg-background xl:shadow">
              {children}
            </div>
          </section>
        </div>
      </main>
      {footer}
    </div>
  );
}
