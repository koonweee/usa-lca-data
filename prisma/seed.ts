import { DATA_DIR, LCA_2023_Q3_FILENAME, getLCAData } from '@/data-preprocess/injest';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const data = await getLCAData(DATA_DIR, LCA_2023_Q3_FILENAME)
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
