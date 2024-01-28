import { LCA_2023_Q3_FILENAME, getAllLCAData, getLCAData } from '@/data-preprocess/injest';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const DATA_DIR = "src/data-preprocess/filtered-data"

async function main() {
  const data = await getAllLCAData(DATA_DIR)

  const response = await prisma.lca_disclosures.createMany(
    {
      data: data.map((d) => {
        const pwOesYearStartDate = d.pwOesYear?.from
        // if date is not Date, console.log
        if (pwOesYearStartDate && !(pwOesYearStartDate instanceof Date)) {
          console.log('pwOesYearStartDate', pwOesYearStartDate)
        }
        const pwOesYearEndDate = d.pwOesYear?.to
        delete d.pwOesYear
        // if type of employerPhoneExt is not string or null, console.log
        if (d.employerPhoneExt && typeof d.employerPhoneExt !== 'string') {
          console.log('employerPhoneExt', d.employerPhoneExt)
        }
        return {
          ...d,
          pwOesYearStartDate,
          pwOesYearEndDate,
          nWorksiteWorkers: d.nWorksiteWorkers ? d.nWorksiteWorkers : 0,
          totalWorksiteLocations: d.totalWorksiteLocations ? d.totalWorksiteLocations : 0,
          prevailingWage: d.prevailingWage ? d.prevailingWage : d.wageRateOfPayFrom ?? d.wageRateOfPayTo ?? 0 ,
        }

      }),
      skipDuplicates: true,
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
