import { BASE_LCA_TABLE_COLUMNS } from "@/components/lca-table/column-type";
import { LCADataToTableDataSource } from "@/components/lca-table/formatters";
import { Layout, Table } from "antd";

import { LCAData } from "@/types/lca";
interface Props {
  lcaData: LCAData[];
}


export function LCATableMobile({ lcaData }: Props) {

  // format lcaData as a dataSource
  const lcaDataSource = LCADataToTableDataSource(lcaData);


  // render the infinite scroll

  //on reach end of page, load more cards or data

  // if there is no more data, show a message that we reached the end
  
  return (
    <Layout>
      <Table dataSource={lcaDataSource} columns={BASE_LCA_TABLE_COLUMNS} />
    </Layout>
  )
}
