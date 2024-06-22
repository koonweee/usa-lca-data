import Layout from "@/components/layout/layout";
import { ThemeProvider } from "@/components/theme-provider";
import LCADisclosuresPage from "@/features/disclosures/page";
import { Analytics } from "@vercel/analytics/react";
function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Layout>
        <Analytics />
        <LCADisclosuresPage />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
