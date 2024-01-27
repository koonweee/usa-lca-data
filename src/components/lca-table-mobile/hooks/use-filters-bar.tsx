import { FilterChipsConfig } from "@/components/filters-bar";
import { filterLcaData } from "@/components/lca-table-mobile/hooks/filter-lca-data";
import { OptionType } from "@/components/lca-table-mobile/hooks/types";
import { LCADataToTableDataSource, LcaTableData } from "@/components/lca-table/formatters";
import { LCAData } from "@/types/lca";
import dayjs, { Dayjs } from "dayjs";
import minMax from 'dayjs/plugin/minMax';
import { useEffect, useState } from "react";

dayjs.extend(minMax)

interface UseFiltersBarProps {
  allLcaData: LCAData[];
  setFilterModalConfig: (filterModalConfig?: FiltersConfig) => void;
  setLoadedItems?: (loadedItems: LcaTableData[]) => void;
}

export interface FiltersConfig {
  displayName: string;
  dataKey: string;
  isFilterActive: boolean;
  setFilterInput: (newFilterInput: PossibleInput) => void;
  openFilterModal: () => void;
  filterInput: PossibleInput;
  clearFilter: () => void;
  options: string[] | number[] | Dayjs[];
  type: OptionType;
}

interface GetFiltersInput {
  salary: {
    min: number,
    max: number,
  },
  jobTitles: string[],
  employers: string[],
  states: string[],
  cities: string[],
  receivedDates: {
    min: Dayjs,
    max: Dayjs,
  },
  decisionDates: {
    min: Dayjs,
    max: Dayjs,
  },
}

export function getFilters(input: GetFiltersInput) {
  const { salary, jobTitles, employers, states, cities, receivedDates, decisionDates } = input;
   const filters = [
    {
      displayName: '💰 Salary',
      dataKey: 'jobData.baseAnnualSalary',
      type: OptionType.CURRENCY_RANGE,
      options: [salary.min, salary.max]
    },
    {
      displayName: '👨‍💻 Job title',
      dataKey: 'jobData.jobTitle',
      type: OptionType.MULTI_SELECT,
      options: jobTitles
    },
    {
      displayName: '🏢 Employer',
      dataKey: 'employerData.name',
      type: OptionType.MULTI_SELECT,
      options: employers
    },
    {
      displayName: '🌎 State',
      dataKey: 'employerData.state',
      type: OptionType.MULTI_SELECT,
      options: states
    },
    {
      displayName: '🌃 City',
      dataKey: 'employerData.city',
      type: OptionType.MULTI_SELECT,
      options: cities
    },
    {
      displayName: '📅 Application received date',
      dataKey: 'applicationData.receivedDate',
      type: OptionType.DATE_RANGE,
      options: [receivedDates.min, receivedDates.max]
    },
    {
      displayName: '📅 Application decision date',
      dataKey: 'applicationData.decisionDate',
      type: OptionType.DATE_RANGE,
      options: [decisionDates.min, decisionDates.max]
    },
    {
      displayName: '📝 Case status',
      dataKey: 'applicationData.caseStatus',
      type: OptionType.MULTI_SELECT,
      options: ['Certified', 'Denied', 'Withdrawn']
    },
  ]
  return filters;
}

export interface NumberRangeInput {
  min: number | undefined;
  max: number | undefined;
}

export interface DateRangeInput {
  min: Dayjs | undefined;
  max: Dayjs | undefined;
}

export interface MultiSelectInput {
  selectedOptions: string[];
}

export type PossibleInput = NumberRangeInput | DateRangeInput | MultiSelectInput | undefined;

export function useFiltersBar(props: UseFiltersBarProps) {
  // Desctructure props
  const { setFilterModalConfig, allLcaData, setLoadedItems } = props;

  // State to keep track of filtered data
  const [filteredLcaData, setFilteredLcaData] = useState<LCAData[]>(allLcaData);

  const filtersInput = parseFiltersInputFromAllData(allLcaData)

  const filters = getFilters(filtersInput);

  // create a toggleModal and filterInput state for each filter
  const filtersBarConfig = filters.map((filter) => {
    const [filterInput, setFilterInput] = useState<PossibleInput>(undefined);
    const [isFilterActive, setFilterActive] = useState<boolean>(false);
    const clearFilter = () => {
      setFilterInput(undefined);
      setFilterActive(false);

    }
    const wrappedSetFilterInput = (input: PossibleInput) => {
      setFilterInput(input);
      setFilterActive(input !== undefined)
    }

    useEffect(() => {
      const filteredData = filterLcaData(filtersBarConfig, allLcaData)
      setFilteredLcaData(filteredData)
      setLoadedItems?.(LCADataToTableDataSource(filteredData.slice(0, 20)));
    }, [filterInput, isFilterActive])

    const config = {
      displayName: filter.displayName,
      dataKey: filter.dataKey,
      isFilterActive,
      setFilterInput: wrappedSetFilterInput,
      openFilterModal: (): void => setFilterModalConfig(config),
      filterInput,
      clearFilter,
      options: filter.options,
      type: filter.type,
    }
    return config;
  });

  return {
    filtersBarConfig,
    filteredLcaData,
  }
}


export function parseFiltersInputFromAllData(allLcaData: LCAData[]): GetFiltersInput {
  const minSalary = Math.min(...allLcaData.map((lca) => lca.jobData.baseAnnualSalary));
  const maxSalary = Math.max(...allLcaData.map((lca) => lca.jobData.baseAnnualSalary));
  const jobTitles = [...new Set(allLcaData.map((lca) => lca.jobData.jobTitle))];
  const employers = [...new Set(allLcaData.map((lca) => lca.employerData.name))];
  const states = [...new Set(allLcaData.map((lca) => lca.employerData.state))];
  const cities = [...new Set(allLcaData.map((lca) => lca.employerData.city))];
  const receivedDates = [...new Set(allLcaData.map((lca) => dayjs(lca.applicationData.receivedDate)))];
  const earliestReceivedDate = dayjs.min(receivedDates)
  const latestReceivedDate = dayjs.max(receivedDates)
  const decisionDates = [...new Set(allLcaData.map((lca) => dayjs(lca.applicationData.decisionDate)))];
  const earliestDecisionDate = dayjs.min(decisionDates)
  const latestDecisionDate = dayjs.max(decisionDates)
  return {
    salary: {
      min: minSalary,
      max: maxSalary,
    },
    jobTitles,
    employers,
    states,
    cities,
    receivedDates: {
      min: earliestReceivedDate,
      max: latestReceivedDate,
    },
    decisionDates: {
      min: earliestDecisionDate,
      max: latestDecisionDate,
    },
  }
}
