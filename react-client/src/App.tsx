import { useQuery } from "@apollo/client"
import LCADisclosureDisplay from "./components/lca-disclosure-display"
import { AllLcaDisclosuresDocument } from "./graphql/generated"
function App() {

  const { loading, data } = useQuery(AllLcaDisclosuresDocument)

  return (
    <div className="bg-zinc-800 flex-col h-screen w-full flex items-center justify-center p-4 gap-y-12 overflow-scroll">
      {
        loading ? <p>Loading...</p> :
        data?.lcaDisclosures.map((lcaDisclosure) => (
          <LCADisclosureDisplay lcaDisclosure={lcaDisclosure} />
        ))
      }
    </div>
  )
}

export default App
