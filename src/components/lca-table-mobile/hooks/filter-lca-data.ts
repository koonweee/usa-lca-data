import { OptionType } from "@/components/lca-table-mobile/hooks/types";
import { DateRangeInput, FiltersConfig, MultiSelectInput, NumberRangeInput } from "@/components/lca-table-mobile/hooks/use-filters-bar";
import { LCAData } from "@/types/lca";
import dayjs, { Dayjs } from "dayjs";
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)

export function filterLcaData(filterConfigs: FiltersConfig[], data: LCAData[]) {
  // filters are applied as AND filters
  let filteredData = data;
  filterConfigs.forEach((filterConfig) => {
    const { dataKey, filterInput, type, isFilterActive } = filterConfig;
    if (isFilterActive && filterInput !== undefined) {
      if (type === OptionType.CURRENCY_RANGE) {
        // cast filter input
        const castedFilterInput = filterInput as NumberRangeInput;
        const { min, max } = castedFilterInput;
        const minWage = min ? min : 0;
        const maxWage = max ? max : Number.MAX_SAFE_INTEGER;
        // filter data
        filteredData = filteredData.filter((lca) => {
          const wage = findValueMatchingKey(lca, dataKey);
          return wage >= minWage && wage <= maxWage;
        });
      }
      if (type === OptionType.MULTI_SELECT) {
        // cast filter input
        const castedFilterInput = filterInput as MultiSelectInput;
        const { selectedOptions } = castedFilterInput;
        // filter data
        filteredData = filteredData.filter((lca) => {
          const value = findValueMatchingKey(lca, dataKey);
          return selectedOptions.includes(value);
        });
      }
      if (type === OptionType.DATE_RANGE) {
        // cast filter input
        const castedFilterInput = filterInput as DateRangeInput;
        const { min, max } = castedFilterInput;
        // filter data
        filteredData = filteredData.filter((lca) => {
          const date = findValueMatchingKey(lca, dataKey);
          const dayjsDate = dayjs(date);
          return dayjsDate.isBetween(min, max)
        });
      }
    }


  });
  console.log('filtered data lenght', filteredData.length)
  return filteredData;
}

function findValueMatchingKey(lcaData: LCAData, dataKey: string) {
  const keys = dataKey.split('.');
  let value: any = lcaData;
  keys.forEach((key) => {
    const keyValue = Object.entries(value).find(([k, v]) => k === key);
    value = keyValue ? keyValue[1] : undefined;
  });
  return value;
}
