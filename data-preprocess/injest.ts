// given a path to a directory of LCA xlsx files, this script will parse the files and
// return LCADisclosure objects for each row in each file.

// function injestSingleFile(path: string): LCADisclosure {
//     var disclosure: LCADisclosure = {
//         id: "",
//         caseStatus: CaseStatus.DENIED,
//     }

//     return disclosure;
// }

import { CaseStatus,  VisaClass, WageUnitOfPay, PrevailingWageLevel, DateRange, StatutoryBasis, PublicDisclosure, LCADisclosure} from "./lca_types";

export const DATA_DIR = "data-preprocess/data"
export const LCA_2022_Q1_FILENAME = "LCA_Disclosure_Data_FY2022_Q1.xlsx"
export const LCA_2023_Q3_FILENAME = "LCA_Disclosure_Data_FY2023_Q3_H1B1.xlsx"

import Excel from "exceljs";

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
            throw new Error(`Unknown case status: ${str}`);
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
            throw new Error(`Unknown prevailing wage level: ${str}`);
    }
}

const toDateRange = (str: string): DateRange => {
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
            throw new Error(`Unknown public disclosure: ${str}`);
    }
}

export async function getLCAData(dataDir: string, filename: string): Promise<LCADisclosure[]> {
    const workbook = new Excel.Workbook();
    console.log('start reading file')
    const content = await workbook.xlsx.readFile(
        `${dataDir}/${filename}`
    )
    console.log('start reading worksheet')
    const worksheet = content.worksheets[0];
    const rowStartIndex = 2; // 0th row is header
    const nRows = worksheet.rowCount;
    // limit to first 20 rows
    const nRowsLimit = 22;
    console.log('start reading rows')
    const dataRows = worksheet.getRows(rowStartIndex, nRows < nRowsLimit ? nRows : nRowsLimit) ?? [];
    console.log('end reading rows')
    if (dataRows.length === 0) {
        console.error("No data rows found");
        return [];
    }
    console.log('start mapping LCA')

    const LCAs = dataRows.map((row) => {

        const lcaDisclosure: LCADisclosure = {
            id: getCellValue(row, 1) as string,
            caseStatus: toCaseStatus(getCellValue(row, 2) as string),
            receivedDate: getCellValue(row, 3) as Date,
            decisionDate: getCellValue(row, 4) as Date,
            originalCertifiedDate: getCellValue(row, 5) as Date,
            visaClass: toVisaClass(getCellValue(row, 6) as string),
            jobTitle: getCellValue(row, 7) as string,
            socCode: getCellValue(row, 8) as string,
            socTitle: getCellValue(row, 9) as string,
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
            employerName: getCellValue(row, 20) as string,
            tradeNameDba: getCellValue(row, 21) as string,
            employerAddress1: getCellValue(row, 22) as string,
            employerAddress2: getCellValue(row, 23) as string,
            employerCity: getCellValue(row, 24) as string,
            employerState: getCellValue(row, 25) as string,
            employerPostalCode: getCellValue(row, 26) as string,
            employerCountry: getCellValue(row, 27) as string,
            employerProvince: getCellValue(row, 28) as string,
            employerPhone: getCellValue(row, 29) as string,
            employerPhoneExt: getCellValue(row, 30) as string,
            naicsCode: getCellValue(row, 31) as string,
            employerPocLastName: getCellValue(row, 32) as string,
            employerPocFirstName: getCellValue(row, 33) as string,
            employerPocMiddleName: getCellValue(row, 34) ? getCellValue(row, 34) as string : undefined,
            employerPocJobTitle: getCellValue(row, 35) as string,
            employerPocAddress1: getCellValue(row, 36) as string,
            employerPocAddress2: getCellValue(row, 37) as string,
            employerPocCity: getCellValue(row, 38) as string,
            employerPocState: getCellValue(row, 39) as string,
            employerPocPostalCode: getCellValue(row, 40) as string,
            employerPocCountry: getCellValue(row, 41) as string,
            employerPocProvince: getCellValue(row, 42) as string,
            employerPocPhone: getCellValue(row, 43) as string,
            employerPocPhoneExt: getCellValue(row, 44) as string,
            employerPocEmail: getCellValue(row, 45) as string,
            agentRepresentingEmployer: getCellValue(row, 46) as string == "Yes",
            agentAttorneyLastName: getCellValue(row, 47) as string,
            agentAttorneyFirstName: getCellValue(row, 48) as string,
            agentAttorneyMiddleName: getCellValue(row, 49) as string,
            agentAttorneyAddress1: getCellValue(row, 50) as string,
            agentAttorneyAddress2: getCellValue(row, 51) as string,
            agentAttorneyCity: getCellValue(row, 52) as string,
            agentAttorneyState: getCellValue(row, 53) as string,
            agentAttorneyPostalCode: getCellValue(row, 54) as string,
            agentAttorneyCountry: getCellValue(row, 55) as string,
            agentAttorneyProvince: getCellValue(row, 56) as string,
            agentAttorneyPhone: getCellValue(row, 57) as string,
            agentAttorneyPhoneExt: getCellValue(row, 58) as string,
            agentAttorneyEmail: getCellValue(row, 59) as string,
            lawfirmNameBusinessName: getCellValue(row, 60) as string,
            stateOfHighestCourt: getCellValue(row, 61) as string,
            nameOfHighestStateCourt: getCellValue(row, 62) as string,
            nWorksiteWorkers: getCellValue(row, 63) as number,
            secondaryEntity: getCellValue(row, 64) as string == "Yes",
            secondaryEntityBusinessName: getCellValue(row, 65) as string,
            worksiteAddress1: getCellValue(row, 66) as string,
            worksiteAddress2: getCellValue(row, 67) as string,
            worksiteCity: getCellValue(row, 68) as string,
            worksiteCounty: getCellValue(row, 69) as string,
            worksiteState: getCellValue(row, 70) as string,
            worksitePostalCode: getCellValue(row, 71) as string,
            wageRateOfPayFrom: getCellValue(row, 72) as number,
            wageRateOfPayTo: getCellValue(row, 73) as number,
            wageUnitOfPay: toWageUnitOfPay(getCellValue(row, 74) as string),
            prevailingWage: getCellValue(row, 75) as number,
            pwUnitOfPay: toWageUnitOfPay(getCellValue(row, 76) as string),
            pwTrackingNumber: getCellValue(row, 77) as string,
            pwWageLevel: toPrevailingWageLevel(getCellValue(row, 78) as string),
            pwOesYear: toDateRange(getCellValue(row, 79) as string),
            pwOtherSource: getCellValue(row, 80) as string,
            pwOtherYear: getCellValue(row, 81) as number,
            pwSurveyPublisher: getCellValue(row, 82) as string,
            pwSurveyName: getCellValue(row, 83) as string,
            totalWorksiteLocations: getCellValue(row, 84) as number,
            agreeToLcStatement: getCellValue(row, 85) as string == "Yes",
            h1bDependent: getCellValue(row, 86) as string == "Yes",
            willfulViolator: getCellValue(row, 87) as string == "Yes",
            supportH1b: getCellValue(row, 88) as string == "Yes",
            statutoryBasis: toStatutoryBasis(getCellValue(row, 89) as string),
            appendixAAttached: getCellValue(row, 90) as string == "Yes",
            publicDisclosure: toPublicDisclosure(getCellValue(row, 91) as string),
            preparerLastName: getCellValue(row, 92) as string,
            preparerFirstName: getCellValue(row, 93) as string,
            preparerMiddleInitial: getCellValue(row, 94) as string,
            preparerBusinessName: getCellValue(row, 95) as string,
            preparerEmail: getCellValue(row, 96) as string,
        }
        return lcaDisclosure;
    });
    console.log("n LCA disclosures:", LCAs.length);
    return LCAs;
}
