import { BASE_LCA_TABLE_COLUMNS } from "@/components/lca-table/column-type";
import { LCADataToTableDataSource } from "@/components/lca-table/formatters";
import { Layout, Table } from "antd";

import { LCAData } from "@/types/lca";
interface Props {
  lcaData: LCAData[];
}


export function LCATable({ lcaData }: Props) {

  // format lcaData as a dataSource
  const lcaDataSource = LCADataToTableDataSource(lcaData);

  return (
    <Layout>
      <Table dataSource={lcaDataSource} columns={BASE_LCA_TABLE_COLUMNS} />
    </Layout>
  )
}
