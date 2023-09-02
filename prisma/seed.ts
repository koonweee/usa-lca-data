import { PrismaClient } from '@prisma/client'

import {getLCAData, LCA_2023_Q3_FILENAME, DATA_DIR} from '../data-preprocess/injest'

const prisma = new PrismaClient()

async function main() {
  const data = await getLCAData(DATA_DIR, LCA_2023_Q3_FILENAME)
  const response = await prisma.lca_disclosures.createMany(
    {
      data: data.map((d) => ({
        ...d,
        pwOesYearStartDate: d.pwOesYear?.from,
        pwOesYearEndDate: d.pwOesYear?.to,
      })),
    }
  );
  console.log('response', response)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
