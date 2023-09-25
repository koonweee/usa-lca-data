import { FilterChip } from '@/components/filters-bar/filter-chip';
import { FiltersConfig } from '@/components/lca-table-mobile/hooks/use-filters-bar';
import { Divider, Space} from 'antd';
import React from 'react';

export interface FilterChipsConfig {
  displayName: string; // eg. "💰 Salary"
  onClick: (isSelected: boolean) => any; // callback to parent
  isSelected: boolean; // whether or not this filter is selected
}

interface Props {
  filtersConfig: FiltersConfig[];
}

export function FiltersBar({ filtersConfig }: Props) {
  return (
    <>
      <Divider orientation="left" orientationMargin={0}>Filters</Divider>
      <Space size={[0, 8]} wrap>
        {filtersConfig.map((filterConfig) => {
          return (
          <FilterChip
            key={filterConfig.displayName}
            displayName={filterConfig.displayName}
            onClick={filterConfig.openFilterModal}
            onClear={filterConfig.clearFilter}
            isSelected={filterConfig.isFilterActive}
          />
        )})}
      </Space>
    </>
  );
}
