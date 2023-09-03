'use client'
import { formatColumnTypesWithFilters, BASE_LCA_TABLE_COLUMNS } from "@/components/lca-table/column-type";
import { LCADataToTableDataSource } from "@/components/lca-table/formatters";
import { LCAData } from "@/pages/api/get_lca_data";
import { Layout, Table } from "antd";

import type { ColumnsType, ColumnType } from 'antd/es/table';
import { Button, DatePicker, DatePickerProps, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { RangePickerProps } from "antd/es/date-picker";
import { FilterConfirmProps } from "antd/es/table/interface";
import { LcaTableData } from '@/components/lca-table/formatters';
import { useState } from "react";
interface Props {
  lcaData: LCAData[];
}
const { RangePicker } = DatePicker;
export type DataIndex = keyof LcaTableData;

export function LCATable({ lcaData }: Props) {

  // format lcaData as a dataSource
  const lcaDataSource = LCADataToTableDataSource(lcaData);

  const [receivedDateFilter, setReceivedDateFilter] = useState<string[]>([]);
  const [decisionDateFilter, setDecisionDateFilter] = useState<string[]>([]);
  
  const handleDateFilter = (
    confirm: (param?: FilterConfirmProps) => void,
  ) => {
    confirm();
  };
  console.log("receivedDateFilter in LCA TABLE: ", receivedDateFilter);
  console.log("decisionDateFilter in LCA TABLE: ", decisionDateFilter);
  /**
   * This function is used to customize the filter drop down for the columns - which currently is only used for the date columns and the money columns
   * @param dataIndex 
   * @returns 
   */
  const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<LcaTableData> => ({
    filterDropdown: ({ setSelectedKeys, confirm, close }) => {
      return (
        <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
          <RangePicker onChange={(
              value: DatePickerProps['value'] | RangePickerProps['value'],
              dateString: [string, string] ,
            ) =>{                
                /**
                 * Hacky approach to set filter state because onFilter does not expose the values of the stored filters
                 */
                if (dataIndex === "receivedDate"){
                  setReceivedDateFilter(dateString);
                  console.log("receivedDateFilter: ", receivedDateFilter);
                  console.log("receivedDateFilter is set to: ", dateString);
                } else if (dataIndex === "decisionDate"){
                  setDecisionDateFilter(dateString);
                  console.log("decisionDateFilter: ", decisionDateFilter);
                  console.log("decisionDateFilter is set to: ", dateString);
                }
                setSelectedKeys(dateString);
            }} />
          <Space>
            <Button
              type="primary"
              onClick={() => handleDateFilter(confirm)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                close();
              }}
            >
              close
            </Button>
          </Space>
        </div>
      )
    },
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>{
        console.log("record[dataIndex]: ", record[dataIndex]);
        console.log("value: ", value);
        /**
         * Hacky approach to set filter state because the value param here does not give me the range of date filters
         */
        if (dataIndex === "receivedDate"){
            console.log('current receivedDateFilter while filtering: ', receivedDateFilter);
        } else if (dataIndex === "decisionDate"){
          console.log('current decisionDateFilter while filtering: ', decisionDateFilter);
        }

        return true;
      }
    })
  
      // format table columns with filters based on pulled data
  const formattedColumnsWithFilter = formatColumnTypesWithFilters(BASE_LCA_TABLE_COLUMNS, lcaDataSource, getColumnSearchProps);

  return (
    <Layout>
      <Table dataSource={lcaDataSource} columns={formattedColumnsWithFilter} />
    </Layout>
  )
}
