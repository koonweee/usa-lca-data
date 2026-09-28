import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '../../../graphql-server/node_modules/@prisma/client';
import { DataLoader } from '../load';
import { DataTransformer } from '../transform';

const testUrl = process.env.TEST_DATABASE_URL;
describe.skipIf(!testUrl)('field backfill, API, and ingestion (PostgreSQL)', () => {
  const database = `fields_${randomUUID().replace(/-/g, '')}`;
  const root = path.resolve(__dirname, '../../..');
  let admin: PrismaClient, db: PrismaClient, loader: DataLoader;
  let apiSchema: any, graphql: any;
  const oldUrl = process.env.DATABASE_URL;
  const ids = Array.from({length: 5}, () => randomUUID());
  const titles = [' Software  Engineer ', 'SOFTWARE ENGINEER', 'Software Engineer', 'Engineer II', 'C++ Developer'];
  const cities = [' Boston ', 'BOSTON', 'Boston', 'BOSTON', 'Boston'];
  const postals = ['021101234', '02110-1234', '02110', '2110', '02110-9999'];
  beforeAll(async () => {
    admin = new PrismaClient({datasources:{db:{url:testUrl!}}});
    await admin.$executeRawUnsafe(`CREATE DATABASE "${database}"`);
    const url = new URL(testUrl!); url.pathname = `/${database}`; url.search = '';
    process.env.DATABASE_URL = url.toString();
    db = new PrismaClient({datasources:{db:{url:url.toString()}}});
    const execute = (file: string) => execFileSync(process.execPath, [path.join(root, 'graphql-server/node_modules/prisma/build/index.js'), 'db', 'execute', '--stdin', '--url', url.toString()], {input:readFileSync(path.join(root, file), 'utf8'), stdio:['pipe','pipe','pipe']});
    for (const migration of ['20260305000000_init', '20260928000000_normalize_employers']) execute(`graphql-server/prisma/migrations/${migration}/migration.sql`);
    await db.$executeRaw`INSERT INTO "SOCJob" (code,title) VALUES ('15-1252','Software Developer')`;
    for (let i=0;i<ids.length;i++) {
      const state = i === 3 ? 'TX' : ' ma ';
      await db.$executeRaw`INSERT INTO "Employer" (uuid,name,"normalizedName",city,state,"postalCode","naicsCode") VALUES (${ids[i]}::uuid,'Test LLC','test llc',${cities[i]},${state},${postals[i]},'123')`;
      await db.$executeRaw`INSERT INTO "LCADisclosure" ("caseNumber","jobTitle","socCode","fullTimePosition","receivedDate","decisionDate","beginDate","employerUuid","caseStatus","visaClass","worksiteCity","worksiteState","worksitePostalCode") VALUES (${`field-${i}`},${titles[i]},'15-1252',true,CURRENT_DATE,CURRENT_DATE,CURRENT_DATE,${ids[i]}::uuid,'Certified','H-1B1 Singapore',' New  York ',' ny ','100011234')`;
      await db.$executeRaw`INSERT INTO "RawDisclosureData" ("caseNumber","employerUuid") VALUES (${`field-${i}`},${ids[i]}::uuid)`;
    }
    await db.$executeRaw`INSERT INTO "ResumeSubmission" (name,email,"linkedinUrl") VALUES ('Keep','keep@example.test','https://example.test')`;
    execute('graphql-server/prisma/migrations/20260928010000_normalize_disclosure_fields/migration.sql');
    loader = new DataLoader(); await loader.connect();
    // Compile the GraphQL server before this suite; exercise its actual resolvers and SQL.
    const server = path.join(root, 'graphql-server');
    graphql = require(path.join(server, 'node_modules/graphql')).graphql;
    const {makeSchema} = require(path.join(server, 'node_modules/nexus'));
    apiSchema = makeSchema({outputs:false, types:['LCADisclosure','Employer','SOCJob','scalars/Date','scalars/BigInt','args'].map(file=>require(path.join(server, `dist/src/graphql/${file}.js`)))});
  },60000);
  afterAll(async()=>{
    await loader?.disconnect(); await db?.$disconnect();
    if(admin){await admin.$executeRawUnsafe(`DROP DATABASE IF EXISTS "${database}" WITH (FORCE)`);await admin.$disconnect();}
    if(oldUrl===undefined)delete process.env.DATABASE_URL;else process.env.DATABASE_URL=oldUrl;
  });
  const query = async(source:string, variableValues?:any)=>{
    const result=await graphql({schema:apiSchema,source,variableValues,contextValue:{prisma:db}});
    expect(result.errors).toBeUndefined();return result.data;
  };
  it('backfills locations, preserves ZIP digits, and relinks only equivalent full ZIPs',async()=>{
    const employers=await db.employer.findMany();expect(employers).toHaveLength(4);
    expect(employers.filter(e=>e.state==='MA').every(e=>e.city==='Boston'&&e.normalizedCity==='boston')).toBe(true);
    expect(employers.find(e=>e.postalCode==='2110')).toMatchObject({postalCodeValid:false,state:'TX'});
    expect(employers.find(e=>e.postalCode==='02110')).toMatchObject({postalCodeValid:true});
    expect(employers.find(e=>e.postalCode==='02110-9999')).toBeDefined();
    const rows=await db.lCADisclosure.findMany({orderBy:{caseNumber:'asc'}});expect(rows).toHaveLength(5);
    expect(rows[0].employerUuid).toBe(rows[1].employerUuid);
    expect(rows[0]).toMatchObject({jobTitle:'Software Engineer',normalizedJobTitle:'software engineer',worksiteCity:'New York',normalizedWorksiteCity:'new york',worksiteState:'NY',worksitePostalCode:'10001-1234',worksitePostalCodeValid:true});
    for(const row of rows)expect((await db.rawDisclosureData.findUniqueOrThrow({where:{caseNumber:row.caseNumber}})).employerUuid).toBe(row.employerUuid);
    expect(await db.resumeSubmission.count()).toBe(1);
  });
  it('groups title options and makes old spellings select all matching rows in items, statistics and facets',async()=>{
    const data=await query(`query($filters: LCADisclosureFilters){lcaDisclosures{items(filters:$filters){caseNumber} stats(filters:$filters){totalCount}} uniqueColumnValues{jobTitles(filters:$filters,pagination:{take:10}){uniqueValues{value count}} employers(filters:$filters,pagination:{take:10}){uniqueValues{name count}}}}`,{filters:{jobTitle:[' SOFTWARE   ENGINEER ']}});
    expect(data.lcaDisclosures.items).toHaveLength(3);expect(data.lcaDisclosures.stats.totalCount).toBe(3);
    expect(data.uniqueColumnValues.jobTitles.uniqueValues).toEqual([{value:'Software Engineer',count:3}]);
    expect(data.uniqueColumnValues.employers.uniqueValues.reduce((n:number,e:any)=>n+e.count,0)).toBe(3);
    const all=await query('{uniqueColumnValues{jobTitles(pagination:{take:1}){uniqueValues{value count}hasNext}}}');
    expect(all.uniqueColumnValues.jobTitles).toEqual({uniqueValues:[{value:'Software Engineer',count:3}],hasNext:true});
    const exact=await query('query($filters:LCADisclosureFilters){lcaDisclosures{stats(filters:$filters){totalCount}}}',{filters:{jobTitle:['C Developer']}});
    expect(exact.lcaDisclosures.stats.totalCount).toBe(0);
  });
  it('new imports reuse city spellings, preserve locations, and match existing postal formats',async()=>{
    const input={CASE_NUMBER:'future',CASE_STATUS:'Certified',VISA_CLASS:'H-1B1 Singapore',RECEIVED_DATE:'2026-01-01',BEGIN_DATE:'2026-02-01',JOB_TITLE:'software engineer',SOC_CODE:'15-1252',SOC_TITLE:'Software Developer',EMPLOYER_NAME:'Test LLC',EMPLOYER_CITY:' BOSTON ',EMPLOYER_STATE:'ma',EMPLOYER_POSTAL_CODE:'02110 1234',EMPLOYER_COUNTRY:'UNITED STATES OF AMERICA',EMPLOYER_ADDRESS1:'Test',NAICS_CODE:'123'};
    const result=await loader.addLCADisclosures(await new DataTransformer().transformData([input,{...input,CASE_NUMBER:'future-2',EMPLOYER_NAME:'New Company LLC'}]));
    expect(result.createdEmployers).toBe(1);expect(result.createdLCADisclosures).toBe(2);
    expect(await db.employer.findFirstOrThrow({where:{name:'New Company LLC'}})).toMatchObject({city:'Boston',state:'MA',postalCode:'02110-1234',postalCodeValid:true});
    const data=await query('{lcaDisclosures{stats(filters:{jobTitle:["Software Engineer"]}){totalCount}}}');expect(data.lcaDisclosures.stats.totalCount).toBe(5);
  });
});
