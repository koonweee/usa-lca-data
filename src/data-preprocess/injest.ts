// given a path to a directory of LCA xlsx files, this script will parse the files and
// return LCADisclosure objects for each row in each file.

// function injestSingleFile(path: string): LCADisclosure {
//     var disclosure: LCADisclosure = {
//         id: "",
//         caseStatus: CaseStatus.DENIED,
//     }

//     return disclosure;
// }


export const DATA_DIR = "src/data-preprocess/data"
export const LCA_2022_Q1_FILENAME = "LCA_Disclosure_Data_FY2022_Q1.xlsx"
export const LCA_2023_Q3_FILENAME = "LCA_Disclosure_Data_FY2023_Q3_H1B1.xlsx"

import { CaseStatus, VisaClass, WageUnitOfPay, PrevailingWageLevel, DateRange, StatutoryBasis, PublicDisclosure, LCADisclosure } from "@/types/lca";
import { Decimal } from "@prisma/client/runtime/library";
import Excel from "exceljs";
import { exit } from "process";

const getCellValue = (row: Excel.Row, cellIndex: number) => {
    const cell = row.getCell(cellIndex);
    if (cell && cell.value) {
        return cell.value;
    }
    return null;
}

const toCaseStatus = (str: string): CaseStatus => {
    switch (str) {
        case "Certified":
            return CaseStatus.CERTIFIED;
        case "Denied":
            return CaseStatus.DENIED;
        case "Withdrawn":
            return CaseStatus.WITHDRAWN;
        case "Certified - Withdrawn":
            return CaseStatus.CERTIFIED_WITHDRAWN;
        default:
            return CaseStatus.NOT_SPECIFIED;
    }
}

const toVisaClass = (str: string): VisaClass => {
    switch (str) {
        case "H-1B":
            return VisaClass.H1B;
        case "H-1B1 Chile":
            return VisaClass.H1B1_CHILE;
        case "H-1B1 Singapore":
            return VisaClass.H1B1_SINGAPORE;
        case "E-3 Australian":
            return VisaClass.E3_AUSTRALIAN;
        default:
            throw new Error(`Unknown visa class: ${str}`);
    }
}

const toWageUnitOfPay = (str: string): WageUnitOfPay => {
    switch (str) {
        case "Year":
            return WageUnitOfPay.YEAR;
        case "Month":
            return WageUnitOfPay.MONTH;
        case "Bi-Weekly":
            return WageUnitOfPay.BI_WEEKLY;
        case "Week":
            return WageUnitOfPay.WEEK;
        case "Hour":
            return WageUnitOfPay.HOUR;
        default:
            throw new Error(`Unknown wage unit of pay: ${str}`);
    }
}

const toPrevailingWageLevel = (str: string): PrevailingWageLevel => {
    switch (str) {
        case "I":
            return PrevailingWageLevel.I;
        case "II":
            return PrevailingWageLevel.II;
        case "III":
            return PrevailingWageLevel.III;
        case "IV":
            return PrevailingWageLevel.IV;
        default:
            return PrevailingWageLevel.NOT_SPECIFIED;
    }
}

const toDateRange = (str: string): DateRange => {
    if (str.includes(" - ") === false) {
        return {
            from: undefined,
            to: undefined,
        }
    }
    const [from, to] = str.split(" - ");
    return {
        from: new Date(from),
        to: new Date(to),
    }
}

const toStatutoryBasis = (str: string): StatutoryBasis | undefined => {
    switch (str) {
        case "$60,000 or higher annual wage":
            return StatutoryBasis.ANNUAL_WAGE;
        case "Master's or higher degree from U.S. institution":
            return StatutoryBasis.MASTERS_DEGREE;
        case "Both $60,000 or higher in annual wage and Masters Degree or higher in related specialty":
            return StatutoryBasis.BOTH;
        default:
            return undefined;
    }
}

const toPublicDisclosure = (str: string): PublicDisclosure => {
    switch (str) {
        case 'Disclose Business':
            return PublicDisclosure.DISCLOSE_BUSINESS;
        case 'Disclose Employment':
            return PublicDisclosure.DISCLOSE_EMPLOYMENT;
        case 'Disclose Business and Employment':
            return PublicDisclosure.DISCLOSE_BUSINESS_AND_EMPLOYMENT;
        default:
            return PublicDisclosure.NOT_SPECIFIED;
    }
}

//copy pasted from formatters/lca.ts
function calculateBaseAnnualSalary(wageRateOfPayFrom: number, wageUnitOfPay: string): number {
    // convert prisma decimal to number
    const wageRateOfPayFromNumber = wageRateOfPayFrom;
    let yearlyWage: number;
    switch (wageUnitOfPay) {
      case WageUnitOfPay.YEAR:
        yearlyWage = wageRateOfPayFromNumber;
        break;
      case WageUnitOfPay.MONTH:
        yearlyWage = wageRateOfPayFromNumber * 12;
        break;
      case WageUnitOfPay.BI_WEEKLY:
        yearlyWage = wageRateOfPayFromNumber * 26;
        break;
      case WageUnitOfPay.WEEK:
        yearlyWage = wageRateOfPayFromNumber * 52;
        break;
      case WageUnitOfPay.HOUR:
        yearlyWage = wageRateOfPayFromNumber * 2080;
        break;
      default:
        throw new Error(`Unknown wage unit of pay: ${wageUnitOfPay}`);
    }
    return yearlyWage
}

// convert mon jan 03 2022 16:00:00 gmt-0800 (pacific standard time) to Jan 3 2022
function convertDateToMDYformat(date: Date): string {
    const dateStr = date.toString()
    const dateArr = dateStr.split(' ')
    const month = dateArr[1]
    const day = dateArr[2]
    const year = dateArr[3]
    return `${month} ${day} ${year}`
    
}

export async function getLCAData(dataDir: string, filename: string): Promise<LCADisclosure[]> {
    const workbook = new Excel.Workbook();
    console.log('start reading file')
    const content = await workbook.xlsx.readFile(
        `${dataDir}/${filename}`
    )
    console.log('start reading worksheet')
    const worksheet = content.worksheets[0];
    const rowStartIndex = 2; // 1st row is header
    const nDataRows = worksheet.actualRowCount;
    console.log('start reading rows')
    const dataRows = worksheet.getRows(rowStartIndex, nDataRows - 1) ?? [];
    console.log('end reading rows')
    if (dataRows.length === 0) {
        console.error("No data rows found");
        return [];
    }
    console.log('start mapping LCA')
    console.log('n rows', dataRows.length)

    const LCAs = dataRows.map((row) => {
        // console.log('row', row.values)
        const receivedDate = getCellValue(row, 3) as Date;
        const decisionDate = getCellValue(row, 4) as Date;
        const jobTitle =  String(getCellValue(row, 7));
        const status = toCaseStatus(String(getCellValue(row, 2)));
        const employerName = String(getCellValue(row, 20));
        const employerCity = String(getCellValue(row, 24));
        const employerState = String(getCellValue(row, 25));

        const wageRateOfPayFrom = getCellValue(row, 72) as number;
        const wageUnitOfPay = toWageUnitOfPay(String(getCellValue(row, 74)));

        //combine all above values into one searchable text and apply all as lowercase string
        const searchableText =  `${String(convertDateToMDYformat(receivedDate))} ${String(convertDateToMDYformat(decisionDate))} ${jobTitle} ${status} ${String(calculateBaseAnnualSalary(wageRateOfPayFrom, wageUnitOfPay))} ${employerName} ${employerCity} ${employerState}`.toLowerCase(); 
                
        const lcaDisclosure: LCADisclosure = {
            id: String(getCellValue(row, 1)),
            caseStatus: status,
            receivedDate: receivedDate,
            decisionDate: decisionDate,
            originalCertifiedDate: getCellValue(row, 5) as Date | undefined,
            visaClass: toVisaClass(String(getCellValue(row, 6))),
            jobTitle: jobTitle,
            socCode: String(getCellValue(row, 8)),
            socTitle: String(getCellValue(row, 9)),
            fullTimePosition: getCellValue(row, 10) === "Y",
            beginDate: getCellValue(row, 11) as Date,
            endDate: getCellValue(row, 12) as Date,
            totalWorkerPositions: getCellValue(row, 13) as number,
            nNewEmployment: getCellValue(row, 14) as number,
            nContinuedEmployment: getCellValue(row, 15) as number,
            nChangePreviousEmployment: getCellValue(row, 16) as number,
            nNewConcurrentEmployment: getCellValue(row, 17) as number,
            nChangeEmployer: getCellValue(row, 18) as number,
            nAmendedPetition: getCellValue(row, 19) as number,
            employerName: employerName,
            tradeNameDba: String(getCellValue(row, 21)),
            employerAddress1: String(getCellValue(row, 22)),
            employerAddress2: String(getCellValue(row, 23)),
            employerCity: employerCity,
            employerState: employerState,
            employerPostalCode: String(getCellValue(row, 26)),
            employerCountry: String(getCellValue(row, 27)),
            employerProvince: String(getCellValue(row, 28)),
            employerPhone: String(getCellValue(row, 29)),
            employerPhoneExt: String(getCellValue(row, 30)),
            naicsCode: String(getCellValue(row, 31)),
            employerPocLastName: String(getCellValue(row, 32)),
            employerPocFirstName: String(getCellValue(row, 33)),
            employerPocMiddleName: getCellValue(row, 34) ? String(getCellValue(row, 34)) : undefined,
            employerPocJobTitle: String(getCellValue(row, 35)),
            employerPocAddress1: String(getCellValue(row, 36)),
            employerPocAddress2: String(getCellValue(row, 37)),
            employerPocCity: String(getCellValue(row, 38)),
            employerPocState: String(getCellValue(row, 39)),
            employerPocPostalCode: String(getCellValue(row, 40)),
            employerPocCountry: String(getCellValue(row, 41)),
            employerPocProvince: String(getCellValue(row, 42)),
            employerPocPhone: String(getCellValue(row, 43)),
            employerPocPhoneExt: String(getCellValue(row, 44)),
            employerPocEmail: String(getCellValue(row, 45)),
            agentRepresentingEmployer: String(getCellValue(row, 46)) == "Yes",
            agentAttorneyLastName: String(getCellValue(row, 47)),
            agentAttorneyFirstName: String(getCellValue(row, 48)),
            agentAttorneyMiddleName: String(getCellValue(row, 49)),
            agentAttorneyAddress1: String(getCellValue(row, 50)),
            agentAttorneyAddress2: String(getCellValue(row, 51)),
            agentAttorneyCity: String(getCellValue(row, 52)),
            agentAttorneyState: String(getCellValue(row, 53)),
            agentAttorneyPostalCode: String(getCellValue(row, 54)),
            agentAttorneyCountry: String(getCellValue(row, 55)),
            agentAttorneyProvince: String(getCellValue(row, 56)),
            agentAttorneyPhone: String(getCellValue(row, 57)),
            agentAttorneyPhoneExt: String(getCellValue(row, 58)),
            agentAttorneyEmail: String(getCellValue(row, 59)),
            lawfirmNameBusinessName: String(getCellValue(row, 60)),
            stateOfHighestCourt: String(getCellValue(row, 61)),
            nameOfHighestStateCourt: String(getCellValue(row, 62)),
            nWorksiteWorkers: getCellValue(row, 63) as number,
            secondaryEntity: String(getCellValue(row, 64)) == "Yes",
            secondaryEntityBusinessName: String(getCellValue(row, 65)),
            worksiteAddress1: String(getCellValue(row, 66)),
            worksiteAddress2: String(getCellValue(row, 67)),
            worksiteCity: String(getCellValue(row, 68)),
            worksiteCounty: String(getCellValue(row, 69)),
            worksiteState: String(getCellValue(row, 70)),
            worksitePostalCode: String(getCellValue(row, 71)),
            wageRateOfPayFrom: getCellValue(row, 72) as number,
            wageRateOfPayTo: getCellValue(row, 73) as number,
            wageUnitOfPay: toWageUnitOfPay(String(getCellValue(row, 74))),
            prevailingWage: getCellValue(row, 75) as number,
            pwUnitOfPay: toWageUnitOfPay(String(getCellValue(row, 76))),
            pwTrackingNumber: String(getCellValue(row, 77)),
            pwWageLevel: toPrevailingWageLevel(String(getCellValue(row, 78))),
            pwOesYear: toDateRange(String(getCellValue(row, 79))),
            pwOtherSource: String(getCellValue(row, 80)),
            pwOtherYear: getCellValue(row, 81) as number,
            pwSurveyPublisher: String(getCellValue(row, 82)),
            pwSurveyName: String(getCellValue(row, 83)),
            totalWorksiteLocations: getCellValue(row, 84) as number,
            agreeToLcStatement: String(getCellValue(row, 85)) == "Yes",
            h1bDependent: String(getCellValue(row, 86)) == "Yes",
            willfulViolator: String(getCellValue(row, 87)) == "Yes",
            supportH1b: String(getCellValue(row, 88)) == "Yes",
            statutoryBasis: toStatutoryBasis(String(getCellValue(row, 89))),
            appendixAAttached: String(getCellValue(row, 90)) == "Yes",
            publicDisclosure: toPublicDisclosure(String(getCellValue(row, 91))),
            preparerLastName: String(getCellValue(row, 92)),
            preparerFirstName: String(getCellValue(row, 93)),
            preparerMiddleInitial: String(getCellValue(row, 94)),
            preparerBusinessName: String(getCellValue(row, 95)),
            preparerEmail: String(getCellValue(row, 96)),
            searchableText: searchableText,
        }
        // print type of each field
        // Object.keys(lcaDisclosure).forEach((key) => {
        //     console.log(`${key}: ${typeof lcaDisclosure[key as keyof LCADisclosure]}, value: ${lcaDisclosure[key as keyof LCADisclosure]}`);
        // });
        // exit(0);
        return lcaDisclosure;
    });
    console.log("n LCA disclosures:", LCAs.length);
    return LCAs;
}
