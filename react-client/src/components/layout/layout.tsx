import { PageFooter } from "@/components/layout/page-footer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <main>
        <div className="container px-0 pt-3 md:px-6 md:pt-6">
          <section>
            <div className="rounded-[1rem] md:border bg-background md:shadow">
              {children}
            </div>
          </section>
        </div>
      </main>
      <PageFooter />
    </>
  );
}
