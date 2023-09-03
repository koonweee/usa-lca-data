'use client'
import { formatColumnTypesWithFilters, LCA_TABLE_COLUMNS } from "@/components/lca-table/column-type";
import { LCADataToTableDataSource } from "@/components/lca-table/formatters";
import { LCAData } from "@/pages/api/get_lca_data";
import { Table } from "antd";

interface Props {
  lcaData: LCAData[];
}

export function LCATable({ lcaData }: Props) {

  // format lcaData as a dataSource
  const lcaDataSource = LCADataToTableDataSource(lcaData);

  // format table columns with filters based on pulled data
  const formattedColumnsWithFilter = formatColumnTypesWithFilters(LCA_TABLE_COLUMNS, lcaDataSource);
  return (
    <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-auto mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Labour Condition Applications (LCA)</h2>
        </div>
      </div>
      <div className="divide-y divide-gray-900/5">
          <div>
            <Table dataSource={lcaDataSource} columns={formattedColumnsWithFilter} />
          </div>
      </div>
    </div>
  )
}
