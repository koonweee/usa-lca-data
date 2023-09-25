import { FilterChipsConfig } from "@/components/filters-bar";
import { OptionType } from "@/components/lca-table-mobile/hooks/types";
import { LcaTableData } from "@/components/lca-table/formatters";
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
    dataKey: 'baseSalary',
    type: OptionType.CURRENCY_RANGE,
    options: [0, 10000000]
  },
  {
    displayName: '👨‍💻 Job title',
    dataKey: 'jobTitle',
    type: OptionType.MULTI_SELECT,
    options: ['Software Engineer', 'Product Manager', 'CEO']
  },
  {
    displayName: '🏢 Employer',
    dataKey: 'employerName',
    type: OptionType.MULTI_SELECT,
    options: ['Google', 'Facebook', 'Amazon']
  },
  {
    displayName: '🌎 State',
    dataKey: 'employerState',
    type: OptionType.MULTI_SELECT,
    options: ['California', 'New York', 'Washington']
  },
  {
    displayName: '🌃 City',
    dataKey: 'employerCity',
    type: OptionType.MULTI_SELECT,
    options: ['San Francisco', 'New York City', 'Seattle']
  },
  {
    displayName: '📅 Application year',
    dataKey: 'receivedDate',
    type: OptionType.DATE_RANGE,
    options: [new Date('2019-01-01'), new Date('2024-01-01')]
  },
  {
    displayName: '📝 Case status',
    dataKey: 'caseStatus',
    type: OptionType.MULTI_SELECT,
    options: ['Certified', 'Denied', 'Withdrawn']
  },
]

export type FiltersConfig = ReturnType<typeof useFiltersBar>[number];

export function useFiltersBar(props: UseFiltersBarProps) {
  const { setFilterModalConfig } = props;
  // create a toggleModal and filterInput state for each filter
  const filtersBarConfig = filters.map((filter) => {
    const [filterInput, setFilterInput] = useState<string | undefined>(undefined);
    const [isFilterActive, setFilterActive] = useState<boolean>(false);
    const clearFilter = () => {
      setFilterInput(undefined);
      setFilterActive(false);
    }
    const wrappedSetFilterInput = (input: string | undefined) => {
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
