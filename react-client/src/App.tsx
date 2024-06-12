import Layout from "@/components/layout/layout";
import { ThemeProvider } from "@/components/theme-provider";
import LCADisclosuresPage from "@/features/disclosures/page";
function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Layout>
        <LCADisclosuresPage />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
