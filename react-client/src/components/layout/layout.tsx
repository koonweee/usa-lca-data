import { PageFooter } from "@/components/layout/page-footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <main>
        <div className="container px-6 pt-6">
          <section>
            <div className="rounded-[1rem] border bg-background shadow">
              {children}
            </div>
          </section>
        </div>
      </main>
      <PageFooter />
    </>
  );
}
