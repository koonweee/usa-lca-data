'use client'
import { formatColumnTypesWithFilters, LCA_TABLE_COLUMNS } from "@/components/lca-table/column-type";
import { LCADataToTableDataSource } from "@/components/lca-table/formatters";
import { LCAData } from "@/pages/api/get_lca_data";
import { Layout, Table } from "antd";

interface Props {
  lcaData: LCAData[];
}

export function LCATable({ lcaData }: Props) {

  // format lcaData as a dataSource
  const lcaDataSource = LCADataToTableDataSource(lcaData);

  // format table columns with filters based on pulled data
  const formattedColumnsWithFilter = formatColumnTypesWithFilters(LCA_TABLE_COLUMNS, lcaDataSource);
  return (
    <Layout>
      <Table dataSource={lcaDataSource} columns={formattedColumnsWithFilter} />
    </Layout>
  )
}
