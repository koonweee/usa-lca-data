// given a path to a directory of LCA xlsx files, this script will parse the files and
// return LCADisclosure objects for each row in each file.

// function injest_single_file(path: string): LCADisclosure {
//     var disclosure: LCADisclosure = {
//         id: "",
//         case_status: CaseStatus.DENIED,
//     }

//     return disclosure;
// }

const DATA_DIR = "data-preprocess/data"

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

const toStatutoryBasis = (str: string): StatutoryBasis => {
    switch (str) {
        case "$60,000 or higher annual wage":
            return StatutoryBasis.ANNUAL_WAGE;
        case "Master's or higher degree from U.S. institution":
            return StatutoryBasis.MASTERS_DEGREE;
        case "Both $60,000 or higher in annual wage and Masters Degree or higher in related specialty":
            return StatutoryBasis.BOTH;
        default:
            throw new Error(`Unknown statutory basis: ${str}`);
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


const LCA_2022_Q1_FILENAME = "LCA_Disclosure_Data_FY2022_Q1.xlsx"

async function main() {
    const workbook = new Excel.Workbook();
    const content = await workbook.xlsx.readFile(
        `${DATA_DIR}/${LCA_2022_Q1_FILENAME}`
    )
    const worksheet = content.worksheets[0];
    const rowStartIndex = 1; // 0th row is header
    const nRows = worksheet.rowCount;

    const dataRows = worksheet.getRows(rowStartIndex, nRows) ?? [];

    if (dataRows.length === 0) {
        console.error("No data rows found");
        return;
    }

    const LCAs = dataRows.map((row) => {

        const lcaDisclosure: LCADisclosure = {
            id: getCellValue(row, 0) as string,
            case_status: toCaseStatus(getCellValue(row, 1) as string),
            received_date: getCellValue(row, 2) as Date,
            decision_date: getCellValue(row, 3) as Date,
            original_certified_date: getCellValue(row, 4) as Date,
            visa_class: toVisaClass(getCellValue(row, 5) as string),
            job_title: getCellValue(row, 6) as string,
            soc_code: getCellValue(row, 7) as string,
            soc_title: getCellValue(row, 8) as string,
            full_time_position: getCellValue(row, 9) === "Y",
            begin_date: getCellValue(row, 10) as Date,
            end_date: getCellValue(row, 11) as Date,
            total_worker_positions: getCellValue(row, 12) as number,
            n_new_employment: getCellValue(row, 13) as number,
            n_continued_employment: getCellValue(row, 14) as number,
            n_change_previous_employment: getCellValue(row, 15) as number,
            n_new_concurrent_employment: getCellValue(row, 16) as number,
            n_change_employer: getCellValue(row, 17) as number,
            n_amended_petition: getCellValue(row, 18) as number,
            employer_name: getCellValue(row, 19) as string,
            trade_name_dba: getCellValue(row, 20) as string,
            employer_address_1: getCellValue(row, 21) as string,
            employer_address_2: getCellValue(row, 22) as string,
            employer_city: getCellValue(row, 23) as string,
            employer_state: getCellValue(row, 24) as string,
            employer_postal_code: getCellValue(row, 25) as string,
            employer_country: getCellValue(row, 26) as string,
            employer_province: getCellValue(row, 27) as string,
            employer_phone: getCellValue(row, 28) as string,
            employer_phone_ext: getCellValue(row, 29) as string,
            naics_code: getCellValue(row, 30) as string,
            employer_poc_last_name: getCellValue(row, 31) as string,
            employer_poc_first_name: getCellValue(row, 32) as string,
            employer_poc_middle_name: getCellValue(row, 33) ? getCellValue(row, 33) as string : undefined,
            employer_poc_job_title: getCellValue(row, 34) as string,
            employer_poc_address_1: getCellValue(row, 35) as string,
            employer_poc_address_2: getCellValue(row, 36) as string,
            employer_poc_city: getCellValue(row, 37) as string,
            employer_poc_state: getCellValue(row, 38) as string,
            employer_poc_postal_code: getCellValue(row, 39) as string,
            employer_poc_country: getCellValue(row, 40) as string,
            employer_poc_province: getCellValue(row, 41) as string,
            employer_poc_phone: getCellValue(row, 42) as string,
            employer_poc_phone_ext: getCellValue(row, 43) as string,
            employer_poc_email: getCellValue(row, 44) as string,
            agent_representing_employer: getCellValue(row, 45) as string == "Yes",
            agent_attorney_last_name: getCellValue(row, 46) as string,
            agent_attorney_first_name: getCellValue(row, 47) as string,
            agent_attorney_middle_name: getCellValue(row, 48) as string,
            agent_attorney_address_1: getCellValue(row, 49) as string,
            agent_attorney_address_2: getCellValue(row, 50) as string,
            agent_attorney_city: getCellValue(row, 51) as string,
            agent_attorney_state: getCellValue(row, 52) as string,
            agent_attorney_postal_code: getCellValue(row, 53) as string,
            agent_attorney_country: getCellValue(row, 54) as string,
            agent_attorney_province: getCellValue(row, 55) as string,
            agent_attorney_phone: getCellValue(row, 56) as string,
            agent_attorney_phone_ext: getCellValue(row, 57) as string,
            agent_attorney_email: getCellValue(row, 58) as string,
            lawfirm_name_business_name: getCellValue(row, 59) as string,
            state_of_highest_court: getCellValue(row, 60) as string,
            name_of_highest_state_court: getCellValue(row, 61) as string,
            n_worksite_workers: getCellValue(row, 62) as number,
            secondary_entity: getCellValue(row, 63) as string == "Yes",
            secondary_entity_business_name: getCellValue(row, 64) as string,
            worksite_address_1: getCellValue(row, 65) as string,
            worksite_address_2: getCellValue(row, 66) as string,
            worksite_city: getCellValue(row, 67) as string,
            worksite_county: getCellValue(row, 68) as string,
            worksite_state: getCellValue(row, 69) as string,
            worksite_postal_code: getCellValue(row, 70) as string,
            wage_rate_of_pay_from: getCellValue(row, 71) as number,
            wage_rate_of_pay_to: getCellValue(row, 72) as number,
            wage_unit_of_pay: toWageUnitOfPay(getCellValue(row, 73) as string),
            prevailing_wage: getCellValue(row, 74) as number,
            pw_unit_of_pay: toWageUnitOfPay(getCellValue(row, 75) as string),
            pw_tracking_number: getCellValue(row, 76) as string,
            pw_wage_level: toPrevailingWageLevel(getCellValue(row, 77) as string),
            pw_oes_year: toDateRange(getCellValue(row, 78) as string),
            pw_other_source: getCellValue(row, 79) as string,
            pw_other_year: getCellValue(row, 80) as number,
            pw_survey_publisher: getCellValue(row, 81) as string,
            pw_survey_name: getCellValue(row, 82) as string,
            total_worksite_locations: getCellValue(row, 83) as number,
            agree_to_lc_statement: getCellValue(row, 84) as string == "Yes",
            h_1b_dependent: getCellValue(row, 85) as string == "Yes",
            willful_violator: getCellValue(row, 86) as string == "Yes",
            support_h_1b: getCellValue(row, 87) as string == "Yes",
            statutory_basis: toStatutoryBasis(getCellValue(row, 88) as string),
            appendix_a_attached: getCellValue(row, 89) as string == "Yes",
            public_disclosure: toPublicDisclosure(getCellValue(row, 90) as string),
            preparer_last_name: getCellValue(row, 91) as string,
            preparer_first_name: getCellValue(row, 92) as string,
            preparer_middle_initial: getCellValue(row, 93) as string,
            preparer_business_name: getCellValue(row, 94) as string,
            preparer_email: getCellValue(row, 95) as string,
        }
        return lcaDisclosure;
    });
}

main();