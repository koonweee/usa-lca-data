enum CaseStatus {
    CERTIFIED = 'Certified',
    DENIED = 'Denied',
    WITHDRAWN = 'Withdrawn',
    CERTIFIED_WITHDRAWN = 'Certified - Withdrawn'
}

enum VisaClass {
    H1B = 'H-1B',
    H1B1_CHILE = 'H-1B1 Chile',
    H1B1_SINGAPORE = 'H-1B1 Singapore',
    E3_AUSTRALIAN = 'E-3 Australian'
}

enum WageUnitOfPay {
    YEAR = 'Year',
    MONTH = 'Month',
    BI_WEEKLY = 'Bi-Weekly',
    WEEK = 'Week',
    HOUR = 'Hour'
}

enum PrevailingWageLevel {
    I = 'I',
    II = 'II',
    III = 'III',
    IV = 'IV'
}

enum StatutoryBasis {
    ANNUAL_WAGE = '$60,000 or higher annual wage',
    MASTERS_DEGREE = 'Masters Degree or higher in related specialty',
    BOTH = 'Both $60,000 or higher in annual wage and Masters Degree or higher in related specialty'
}

enum PublicDisclosure {
    DISCLOSE_BUSINESS = 'Disclose Business',
    DISCLOSE_EMPLOYMENT = 'Disclose Employment',
    DISCLOSE_BUSINESS_AND_EMPLOYMENT = 'Disclose Business and Employment'
}

type DateRange = {
    from: Date;
    to: Date;
}

type LCADisclosure = {
    id: string;
    case_status: CaseStatus;
    received_date: Date;
    decision_date: Date;
    original_certified_date: Date;
    visa_class: VisaClass;
    job_title: string;
    soc_code: string; // to maintain list of soc codes (& titles?
    soc_title: string;
    full_time_position: boolean;
    begin_date: Date;
    end_date: Date;
    total_worker_positions: number;
    n_new_employment: number;
    n_continued_employment: number;
    n_change_previous_employment: number;
    n_new_concurrent_employment: number;
    n_change_employer: number;
    n_amended_petition: number;
    employer_name: string;
    trade_name_dba?: string;
    employer_address_1: string;
    employer_address_2?: string;
    employer_city: string;
    employer_state: string;
    employer_postal_code: string;
    employer_country: string;
    employer_province?: string;
    employer_phone: string;
    employer_phone_ext?: string;
    naics_code: string;
    employer_poc_last_name: string;
    employer_poc_first_name: string;
    employer_poc_middle_name?: string;
    employer_poc_job_title: string;
    employer_poc_address_1: string;
    employer_poc_address_2?: string;
    employer_poc_city: string;
    employer_poc_state: string;
    employer_poc_postal_code: string;
    employer_poc_country: string;
    employer_poc_province?: string;
    employer_poc_phone: string;
    employer_poc_phone_ext?: string;
    employer_poc_email: string;
    agent_representing_employer: boolean;
    agent_attorney_last_name?: string;
    agent_attorney_first_name?: string;
    agent_attorney_middle_name?: string;
    agent_attorney_address_1?: string;
    agent_attorney_address_2?: string;
    agent_attorney_city?: string;
    agent_attorney_state?: string;
    agent_attorney_postal_code?: string;
    agent_attorney_country?: string;
    agent_attorney_province?: string;
    agent_attorney_phone?: string;
    agent_attorney_phone_ext?: string;
    agent_attorney_email?: string;
    lawfirm_name_business_name?: string;
    state_of_highest_court?: string;
    name_of_highest_state_court?: string;
    n_worksite_workers: number;
    secondary_entity: boolean;
    secondary_entity_business_name?: string;
    worksite_address_1: string;
    worksite_address_2?: string;
    worksite_city: string;
    worksite_county: string;
    worksite_state: string;
    worksite_postal_code: string;
    wage_rate_of_pay_from: number;
    wage_rate_of_pay_to?: number;
    wage_unit_of_pay: WageUnitOfPay;
    prevailing_wage: number;
    pw_unit_of_pay: WageUnitOfPay;
    pw_tracking_number?: string;
    pw_wage_level: PrevailingWageLevel;
    pw_oes_year?: DateRange;
    pw_other_source?: string;
    pw_other_year?: number;
    pw_survey_publisher?: string;
    pw_survey_name?: string;
    total_worksite_locations: number;
    agree_to_lc_statement: boolean;
    h_1b_dependent: boolean;
    willful_violator: boolean;
    support_h_1b?: boolean;
    statutory_basis?: StatutoryBasis;
    appendix_a_attached?: boolean;
    public_disclosure: PublicDisclosure;
    preparer_last_name?: string;
    preparer_first_name?: string;
    preparer_middle_initial?: string;
    preparer_business_name?: string;
    preparer_email?: string;
}