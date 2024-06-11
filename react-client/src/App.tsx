import { useQuery } from "@apollo/client"
import LCADisclosureDisplay from "./components/lca-disclosure-display"
import { PaginatedLcaDisclosuresDocument, SortOrder } from "./graphql/generated"
function App() {

  const { loading, data } = useQuery(PaginatedLcaDisclosuresDocument, {
    variables: {
      take: 20,
      skip: 0,
      orderBy: [
        {
          beginDate: SortOrder.Desc
        }
      ]
    }
  })

  const { items, count } = data?.lcaDisclosures || {}

  return (
    <div className="bg-zinc-800 flex-col h-screen w-full flex items-center justify-center p-4 gap-y-12 overflow-scroll">
      {
        loading ? <p>Loading...</p> :
        <>
        {items?.map((lcaDisclosure) => (
          <LCADisclosureDisplay lcaDisclosure={lcaDisclosure} />
        ))}
        <div className="text-sm text-gray-200 font-md">
          {count} total LCA disclosures in our database
        </div>
        </>
      }
    </div>
  )
}

export default App
