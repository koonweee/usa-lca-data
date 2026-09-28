import Layout from "@/components/layout/layout";
import { DataCoverageFooter } from "@/components/layout/data-coverage-footer";
import { ThemeProvider } from "@/components/theme-provider";
import LCADisclosuresPage from "@/features/disclosures/page";
function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Layout footer={<DataCoverageFooter />}>
        <LCADisclosuresPage />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
