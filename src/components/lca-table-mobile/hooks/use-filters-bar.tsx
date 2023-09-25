import { FilterChipsConfig } from "@/components/filters-bar";
import { OptionType } from "@/components/lca-table-mobile/hooks/types";
import { LcaTableData } from "@/components/lca-table/formatters";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

interface UseFiltersBarProps {
  setFilterModalConfig: (filterModalConfig?: FiltersConfig) => void;
}

interface UseFiltersBarReturnType {
  ActiveFilterModal: JSX.Element;
  filteredItems: LcaTableData[];
  filtersBarConfig: FilterChipsConfig[];
}

const filters = [
  {
    displayName: '💰 Salary',
    dataKey: 'jobData.baseAnnualSalary',
    type: OptionType.CURRENCY_RANGE,
    options: [1, 10000000]
  },
  {
    displayName: '👨‍💻 Job title',
    dataKey: 'jobData.jobTitle',
    type: OptionType.MULTI_SELECT,
    options: ['Software Engineer', 'Product Manager', 'CEO']
  },
  {
    displayName: '🏢 Employer',
    dataKey: 'employerData.name',
    type: OptionType.MULTI_SELECT,
    options: ['Google', 'Facebook', 'Amazon']
  },
  {
    displayName: '🌎 State',
    dataKey: 'employerData.state',
    type: OptionType.MULTI_SELECT,
    options: ['California', 'New York', 'Washington']
  },
  {
    displayName: '🌃 City',
    dataKey: 'employerData.city',
    type: OptionType.MULTI_SELECT,
    options: ['San Francisco', 'New York City', 'Seattle']
  },
  {
    displayName: '📅 Application year',
    dataKey: 'applicationData.receivedDate',
    type: OptionType.DATE_RANGE,
    options: [dayjs('2010-01-01'), dayjs('2024-01-01')]
  },
  {
    displayName: '📝 Case status',
    dataKey: 'applicationData.caseStatus',
    type: OptionType.MULTI_SELECT,
    options: ['Certified', 'Denied', 'Withdrawn']
  },
]

export type FiltersConfig = ReturnType<typeof useFiltersBar>[number];

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
  const { setFilterModalConfig } = props;
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

  return filtersBarConfig
}
