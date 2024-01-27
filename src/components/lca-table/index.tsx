import { BASE_LCA_TABLE_COLUMNS } from "@/components/lca-table/column-type";
import { LCADataToTableDataSource } from "@/components/lca-table/formatters";
import { Divider, Layout, Table } from "antd";

import { LCAData } from "@/types/lca";
import { FilterModal } from "../lca-table-mobile/components/filter-modal";
import { useState } from "react";
import { FiltersConfig, useFiltersBar } from "../lca-table-mobile/hooks/use-filters-bar";
import { FiltersBar } from "@/components/filters-bar";
interface Props {
  lcaData: LCAData[];
}

export function LCATable({ lcaData }: Props) {
  const [filterModalConfig, setFilterModalConfig] = useState<FiltersConfig | undefined>(undefined);
  const {filtersBarConfig, filteredLcaData} = useFiltersBar({ setFilterModalConfig, allLcaData: lcaData });

  // format lcaData as a dataSource
  const lcaDataSource = LCADataToTableDataSource(filteredLcaData);

  return (
    <Layout>
      {filterModalConfig && (
        <FilterModal
        filterConfig={filterModalConfig}
        onCancel={() => setFilterModalConfig(undefined)}
        />
      )}
      <FiltersBar filtersConfig={filtersBarConfig}/>
      <Divider/>
      <Table dataSource={lcaDataSource} columns={BASE_LCA_TABLE_COLUMNS} />
    </Layout>
  )
}
