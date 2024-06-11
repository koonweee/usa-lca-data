-- Formatting date strings in RawDisclosureData as date type

-- Add date type receivedDate, decisionDate and beginDate column (ie. receivedDate_date) to RawDisclosureData
alter table "RawDisclosureData"
ADD COLUMN "receivedDate_date" date,
ADD COLUMN "decisionDate_date" date,
ADD COLUMN "beginDate_date" date

-- Copy date string to date column, formatting as 'MM/DD/YY'
update "RawDisclosureData"
set "receivedDate_date" = to_date("receivedDate", 'MM/DD/YY'),
  "decisionDate_date" = to_date("decisionDate", 'MM/DD/YY'),
  "beginDate_date" = to_date("beginDate", 'MM/DD/YY')

-- Inspect the new columns (and the old ones)
select "receivedDate", "receivedDate_date", "decisionDate", "decisionDate_date", "beginDate", "beginDate_date" from "RawDisclosureData" limit 10

-- Ensure no nulls in new columns
select count(*) from "RawDisclosureData" where "receivedDate_date" is null or "decisionDate_date" is null or "beginDate_date" is null

-- Creating SOCJob entries

-- Create column for cleaned SOC code (max length of 10 ie. xx-xxxx.xx)
alter table "RawDisclosureData" add COLUMN "socCode_clean" varchar(10)

-- if SOC code length is 7 (ie. xx-xxxx), add .00 to the end
-- if SOC code is more than 10 (ie. xx-xxxx.xx.xx), remove the last 3 characters
update public."RawDisclosureData"
set "socCode_clean" =
  case
    when length("socCode") = 7 then "socCode" || '.00'
    when length("socCode") > 10 then substring("socCode" from 1 for 10)
    else "socCode"
  end

-- Inspect the new column
select "socCode", "socCode_clean" from "RawDisclosureData" limit 500

-- Ensure no nulls in new column
select count(*) from "RawDisclosureData" where "socCode_clean" is null

-- Find codes where length is not 10 (TODO: Clean)
select distinct "socCode_clean", length("socCode_clean") from "RawDisclosureData" where length("socCode_clean") != 10

-- Find unqiue codes
select distinct "socCode_clean" from "RawDisclosureData"

-- -- Empty LCADisclosure table
-- delete from "LCADisclosure"
-- -- Empty SOCJob table
-- delete from "SOCJob"

-- For each code, create a new SOCJob entry (set title as 'Placeholder', since we will fetch official definitions later)
insert into "SOCJob" ("code", "title")
select distinct "socCode_clean", 'Placeholder' from "RawDisclosureData"

-- Inspect the new table
select * from "SOCJob" limit 10


-- Creating Employer entries

-- Select distinct employers (using name, postalCode) (TODO: some postal codes invalid, not 5 digits or more)
select distinct on ("employerName", "employerPostalCode") gen_random_uuid(), "employerName", "employerCity", "employerState", "employerPostalCode", "employerNaicsCode" from "RawDisclosureData"

-- Empty Employer table
delete from "Employer"

-- For each distinct employer, create a new Employer entry
insert into "Employer" ("uuid", "name", "city", "state", "postalCode", "naicsCode")
select distinct on ("employerName", "employerPostalCode") gen_random_uuid(), "employerName", "employerCity", "employerState", "employerPostalCode", "employerNaicsCode" from "RawDisclosureData"

-- Inspect the new table
select * from "Employer" limit 10

-- Insert employerUuid into RawDisclosureData
alter table "RawDisclosureData" add COLUMN "employerUuid" uuid

-- Update RawDisclosureData with employerUuid
update "RawDisclosureData" set "employerUuid" = "Employer"."uuid"
from "Employer"
where "RawDisclosureData"."employerName" = "Employer"."name" and "RawDisclosureData"."employerPostalCode" = "Employer"."postalCode"

-- Ensure all employerUuids are not null
select count(*) from "RawDisclosureData" where "employerUuid" is null


-- Format fullTimePosition as boolean

-- Add column fullTimePosition_bool
alter table "RawDisclosureData" add COLUMN "fullTimePosition_bool" boolean

-- Get unique values from fullTimePosition
select distinct "fullTimePosition" from "RawDisclosureData"

-- Update fullTimePosition_bool
update "RawDisclosureData" set "fullTimePosition_bool" = "fullTimePosition" = 'Y'

-- Inspect the new column (get counts of true and false)
select "fullTimePosition", "fullTimePosition_bool", count(*) from "RawDisclosureData" group by "fullTimePosition", "fullTimePosition_bool"


-- Format wages (wageRateOfPayFrom, wageRateOfPayTo, prevailingWageRateOfPay) as numeric

-- Add column wageRateOfPayFrom_numeric, wageRateOfPayTo_numeric, prevailingWageRateOfPay_numeric
alter table "RawDisclosureData"
add COLUMN "wageRateOfPayFrom_numeric" numeric,
add COLUMN "wageRateOfPayTo_numeric" numeric,
add COLUMN "prevailingWageRateOfPay_numeric" numeric

-- Inspect distinct values for each wage column and check if all values contain $
select distinct "wageRateOfPayFrom" from public."RawDisclosureData";
select count(*) from public."RawDisclosureData" where "wageRateOfPayFrom" not like '$%';

select distinct "wageRateOfPayTo" from public."RawDisclosureData";
select * from public."RawDisclosureData" where "wageRateOfPayTo" not like '$%';

select distinct "prevailingWageRateOfPay" from public."RawDisclosureData";
select distinct "prevailingWageRateOfPay" from public."RawDisclosureData" where "prevailingWageRateOfPay" not like '$%' and "prevailingWageRateOfPay" not like '%,%';

-- Wage values are of form $xx,xxx or xx,xxx or xxx where x is a digit
-- Strip $ and , from wage values and cast to numeric
update "RawDisclosureData"
set "wageRateOfPayFrom_numeric" = cast(replace(replace("wageRateOfPayFrom", '$', ''), ',', '') as numeric),
  "wageRateOfPayTo_numeric" = cast(replace(replace("wageRateOfPayTo", '$', ''), ',', '') as numeric),
  "prevailingWageRateOfPay_numeric" = cast(replace(replace("prevailingWageRateOfPay", '$', ''), ',', '') as numeric)

-- Inspect the new columns (print unique values for each column)
select distinct "wageRateOfPayFrom", "wageRateOfPayFrom_numeric" from "RawDisclosureData";
select distinct "wageRateOfPayTo", "wageRateOfPayTo_numeric" from "RawDisclosureData";
select distinct "prevailingWageRateOfPay", "prevailingWageRateOfPay_numeric" from "RawDisclosureData";

-- Format pay units (wageRateOfPayUnit, prevailingWageRateOfPayUnit)

-- Inspect distinct values for each pay unit column
select distinct "wageRateOfPayUnit" from "RawDisclosureData";
select distinct "prevailingWageRateOfPayUnit" from "RawDisclosureData";

-- Define new enum type for pay units (Hour, wWeek, Bi-Weekly, Month, Year)
create type payUnit as enum ('Hour', 'Week', 'Bi-Weekly', 'Month', 'Year');

-- Add column wageRateOfPayUnit_enum, prevailingWageRateOfPayUnit_enum
alter table "RawDisclosureData"
add COLUMN "wageRateOfPayUnit_enum" payUnit,
add COLUMN "prevailingWageRateOfPayUnit_enum" payUnit

-- Update pay unit columns
update "RawDisclosureData"
set "wageRateOfPayUnit_enum" =
  case
    when "wageRateOfPayUnit" = 'Hour' then 'Hour'::payUnit
    when "wageRateOfPayUnit" = 'Week' then 'Week'::payUnit
    when "wageRateOfPayUnit" = 'Bi-Weekly' then 'Bi-Weekly'::payUnit
    when "wageRateOfPayUnit" = 'Month' then 'Month'::payUnit
    when "wageRateOfPayUnit" = 'Year' then 'Year'::payUnit
  end,
  "prevailingWageRateOfPayUnit_enum" =
  case
    when "prevailingWageRateOfPayUnit" = 'Hour' then 'Hour'::payUnit
    when "prevailingWageRateOfPayUnit" = 'Week' then 'Week'::payUnit
    when "prevailingWageRateOfPayUnit" = 'Bi-Weekly' then 'Bi-Weekly'::payUnit
    when "prevailingWageRateOfPayUnit" = 'Month' then 'Month'::payUnit
    when "prevailingWageRateOfPayUnit" = 'Year' then 'Year'::payUnit
  end

-- Inspect the new columns
select "wageRateOfPayUnit", "wageRateOfPayUnit_enum", "prevailingWageRateOfPayUnit", "prevailingWageRateOfPayUnit_enum" from "RawDisclosureData" limit 10

-- Format visaClass as enum
-- Inspect distinct values for visaClass
select distinct "visaClass" from "RawDisclosureData";
-- Create new enum E-3 Australian, H-1B, H-1B1 Chile, H-1B1 Singapore
create type visaClass as enum ('E-3 Australian', 'H-1B', 'H-1B1 Chile', 'H-1B1 Singapore');
-- Add column visaClass_enum
alter table "RawDisclosureData" add COLUMN "visaClass_enum" visaClass;
-- Update visaClass_enum
update "RawDisclosureData"
set "visaClass_enum" =
  case
    when "visaClass" = 'E-3 Australian' then 'E-3 Australian'::visaClass
    when "visaClass" = 'H-1B' then 'H-1B'::visaClass
    when "visaClass" = 'H-1B1 Chile' then 'H-1B1 Chile'::visaClass
    when "visaClass" = 'H-1B1 Singapore' then 'H-1B1 Singapore'::visaClass
  end;
-- Inspect the new column
select "visaClass", "visaClass_enum" from "RawDisclosureData" limit 10;

-- Format caseStatus as enum
-- Inspect distinct values for caseStatus
select distinct "caseStatus" from "RawDisclosureData";
-- Create new enum Certified, Certified - Withdrawn, Denied, Withdrawn
create type caseStatus as enum ('Certified', 'Certified - Withdrawn', 'Denied', 'Withdrawn');
-- Add column caseStatus_enum
alter table "RawDisclosureData" add COLUMN "caseStatus_enum" caseStatus;
-- Update caseStatus_enum
update "RawDisclosureData"
set "caseStatus_enum" =
  case
    when "caseStatus" = 'Certified' then 'Certified'::caseStatus
    when "caseStatus" = 'Certified - Withdrawn' then 'Certified - Withdrawn'::caseStatus
    when "caseStatus" = 'Denied' then 'Denied'::caseStatus
    when "caseStatus" = 'Withdrawn' then 'Withdrawn'::caseStatus
  end;
-- Inspect the new column
select "caseStatus", "caseStatus_enum" from "RawDisclosureData" limit 10;



-- Start moving data to LCADisclosure table
-- Ensure LCADisclosure table is empty
delete from "LCADisclosure"

-- Insert data from RawDisclosureData to LCADisclosure
insert into public."LCADisclosure" ("caseNumber", "caseStatus", "visaClass", "jobTitle", "socCode", "fullTimePosition", "receivedDate", "decisionDate", "beginDate", "worksitePostalCode", "worksiteCity", "worksiteState", "wageRateOfPayFrom", "wageRateOfPayTo", "wageRateOfPayUnit", "prevailingWageRateOfPay", "prevailingWageRateOfPayUnit", "employerUuid")
select "caseNumber", "caseStatus_enum", "visaClass_enum", "jobTitle", "socCode_clean", "fullTimePosition_bool", "receivedDate_date", "decisionDate_date", "beginDate_date", "worksitePostalCode", "worksiteCity", "worksiteState", "wageRateOfPayFrom_numeric", "wageRateOfPayTo_numeric", "wageRateOfPayUnit_enum", "prevailingWageRateOfPay_numeric", "prevailingWageRateOfPayUnit_enum", "employerUuid" from "RawDisclosureData"

-- Inspect the new table
-- Get count from raw
select count(*) from "RawDisclosureData";
-- Get count from new
select count(*) from "LCADisclosure";
-- Get count per visa class from new
select "visaClass", count(*) from "LCADisclosure" group by "visaClass";

-- Update wageRateOfPayFrom, wageRateOfPayTo, prevailingWageRateOfPay to be cents, and bigInt
alter table "LCADisclosure"
alter COLUMN "wageRateOfPayFrom" type bigint using "wageRateOfPayFrom"::numeric * 100,
alter COLUMN "wageRateOfPayTo" type bigint using "wageRateOfPayTo"::numeric * 100,
alter COLUMN "prevailingWageRateOfPay" type bigint using "prevailingWageRateOfPay"::numeric * 100

-- Inspect the new columns
select "wageRateOfPayFrom", "wageRateOfPayTo", "prevailingWageRateOfPay" from "LCADisclosure" limit 10
