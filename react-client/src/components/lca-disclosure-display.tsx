import { LCADisclosure } from "../types"

type Props = {
    lcaDisclosure: LCADisclosure
}

function LCADisclosureDisplay({ lcaDisclosure }: Props) {
  return  <div className="rounded-lg flex justify-center items-center drop-shadow-md bg-neutral-700 p-4">
        <ul className="text-sm text-gray-200 font-md">
            {
                Object.entries(lcaDisclosure).map(([key, value]) =>
                    {
                        // Skip if key contains underscore
                        if (key.includes('_')) return null
                        return (
                            <li key={key}>{key}: {JSON.stringify(value)}</li>
                        )
                    }
                    )
            }
        </ul>
      </div>
}

export default LCADisclosureDisplay
