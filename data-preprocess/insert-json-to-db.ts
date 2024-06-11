import { prisma } from "../graphql-server/src/db"
import * as fs from "fs"
import { YEAR_TO_MAPPING_MAP } from "./mapping"
import { RawDiscolsureDataRow } from "./types";

const MAPPING = YEAR_TO_MAPPING_MAP[2023]

const PATH = './json_all_others';

async function main() {
  // List all json files in ./json
  const jsonFiles = fs.readdirSync(PATH).filter(file => file.endsWith('.json'));

  // Fetch all caseNumbers from the database
  // This is used to check if the case number already exists in the database
  console.log("Fetching all case numbers from the database...")
  const existingCaseNumbers = await prisma.rawDisclosureData.findMany({
    select: {
      caseNumber: true
    }
  })
  const existingCaseNumberSet = new Set(existingCaseNumbers.map(row => row.caseNumber))

  for (const fileName of jsonFiles) {
    console.log(`Parsing data from ${fileName}`)
    const rows = JSON.parse(fs.readFileSync(`${PATH}/${fileName}`, 'utf-8'));
    // rows is an array of arrays, where each array is a row (0th is header)
    // Map over rows

    // Map of case number to row data
    const dataToInsert: Map<string, RawDiscolsureDataRow> = new Map()

    rows.forEach((row: any[], index: number) => {
      // Skip the header row
      if (index === 0) return;
      const rawDisclosureData: any = {}
      row.forEach((cell: any, cellIndex: number) => {
        const attributeName = MAPPING[cellIndex]
        if (!attributeName) {
          // Skip if the cellIndex is not in the mapping
          return;
        }
        const cleanedString = !cell ? null : String(cell).trim()
        rawDisclosureData[attributeName] = cleanedString?.length === 0 ? null : cleanedString
      })
      const castedRow = rawDisclosureData as RawDiscolsureDataRow
      const caseNumber = castedRow['caseNumber']
      // Throw if duplicate case number
      if (dataToInsert[caseNumber]) {
        throw new Error(`Duplicate case number: ${caseNumber} in file ${fileName}`)
      }
      dataToInsert[caseNumber] = castedRow
    })

    const allCaseNumbers = Object.keys(dataToInsert)

    // Check if case numbers already exist in the database
    // Separate the rows to insert and the rows to update
    const rowsToInsert: RawDiscolsureDataRow[] = []
    const rowsToUpdate: RawDiscolsureDataRow[] = []

    allCaseNumbers.forEach(caseNumber => {
      const row = dataToInsert[caseNumber]
      if (existingCaseNumberSet.has(caseNumber)) {
        rowsToUpdate.push(row)
      } else {
        rowsToInsert.push(row)
      }
    })

    console.log(`Inserting ${rowsToInsert.length} rows...`)
    await prisma.rawDisclosureData.createMany({
      data: rowsToInsert,
    })
    // Add the new case numbers to the set
    rowsToInsert.forEach(row => existingCaseNumberSet.add(row.caseNumber))
    console.log(`Updating ${rowsToUpdate.length} rows...`)
    await prisma.$transaction(rowsToUpdate.map(row => {
      return prisma.rawDisclosureData.update({
        where: {
          caseNumber: row.caseNumber
        },
        data: row
      })
    })
    )
  };
}

main().then(() => {
  console.log("Data inserted...");
});
