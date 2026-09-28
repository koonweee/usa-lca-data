import { PageFooter } from "@/components/layout/page-footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <main className="app-main">
        <div className="app-container container px-0 xl:px-6 xl:pt-6">
          <section className="app-section">
            <div className="app-panel rounded-[1rem] xl:border bg-background xl:shadow">
              {children}
            </div>
          </section>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
