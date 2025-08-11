import { PrismaClient, $Enums, Employer, SOCJob } from '../../graphql-server/node_modules/@prisma/client';
import { Prisma } from '../../graphql-server/node_modules/@prisma/client';
import { PrismaCreateInputs } from './types';

export class DataLoader {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('Connected to database');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
    console.log('Disconnected from database');
  }

  async addLCADisclosures(inputs: PrismaCreateInputs[]) {
    /** Filter to only include H-1B1 */
    const h1b1Only = inputs.filter((input) => input.lcaDisclosure.visaClass === $Enums.visaclass.H_1B1_Singapore)
    console.log(`Filtered from ${inputs.length} total records to ${h1b1Only.length} H-1B1 records`)
    /** Aggregate employer and socJob creates, since LCADisclosure depends on them */
    const employerCreates: Prisma.EmployerCreateInput[] = []
    const socJobCreates: Prisma.SOCJobCreateInput[] = []
    h1b1Only.forEach((inputs) => {
      employerCreates.push(inputs.employer)
      socJobCreates.push(inputs.socJob)
    })
    const [createdEmployers, createdSocJobs] = await Promise.all([
      this.prisma.employer.createMany({
        data: employerCreates,
        skipDuplicates: true
      }),
      this.prisma.sOCJob.createMany({
        data: socJobCreates,
        skipDuplicates: true
      })
    ])
    
    console.log(`Employers: ${createdEmployers.count}/${employerCreates.length} created`)
    console.log(`SOC Jobs: ${createdSocJobs.count}/${socJobCreates.length} created`)

    // For each LCADisclosure, we need to find the actual employer and soc job entity. Fetch all employer and soc job to create map
    const allEmployers = await this.prisma.employer.findMany()
    // Employers can be matched by <name>-<postalcode>
    const employerUuidMap = new Map<string, string>

    allEmployers.forEach((employer) => employerUuidMap.set(`${employer.name}-${employer.postalCode}`, employer.uuid))

    const lcaDisclosuresWithForeignKeys: Prisma.LCADisclosureCreateManyInput[] = h1b1Only.map((input) => {
      const employerUuid = employerUuidMap.get(`${input.employer.name}-${input.employer.postalCode}`)
      if(!employerUuid) {
        throw new Error(`Could not find employer uuid for employer ${JSON.stringify(input.employer, null, 2)}`)
      }
      return {
      ...input.lcaDisclosure,
      employerUuid,
      socCode: input.socJob.code
      }
    })

    const createdLCADisclosures = await this.prisma.lCADisclosure.createMany({
      data: lcaDisclosuresWithForeignKeys,
      skipDuplicates: true
    })

    console.log(`LCA Disclosures: ${createdLCADisclosures.count}/${lcaDisclosuresWithForeignKeys.length} created`)

  }

  async clearAllData(): Promise<void> {
    console.warn('WARNING: This will delete all data from the database!');
    
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.lCADisclosure.deleteMany();
        await tx.resumeSubmission.deleteMany();
        await tx.sOCJob.deleteMany();
        await tx.employer.deleteMany();
        await tx.rawDisclosureData.deleteMany();
      });
      
      console.log('All data cleared from database');
    } catch (error) {
      console.error('Failed to clear database:', error);
      throw error;
    }
  }
}
