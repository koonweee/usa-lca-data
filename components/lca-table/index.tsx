'use client'
import { formatColumnTypesWithFilters, BASE_LCA_TABLE_COLUMNS } from "@/components/lca-table/column-type";
import { LCADataToTableDataSource } from "@/components/lca-table/formatters";
import { Layout, Table } from "antd";

import type { ColumnsType, ColumnType } from 'antd/es/table';
import { Button, DatePicker, DatePickerProps, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { RangePickerProps } from "antd/es/date-picker";
import { FilterConfirmProps } from "antd/es/table/interface";
import { LcaTableData } from '@/components/lca-table/formatters';
import { useEffect, useState } from "react";
import compareAsc from "date-fns/compareAsc";
import { LCAData } from "@/types/lca";
interface Props {
  lcaData: LCAData[];
}
const { RangePicker } = DatePicker;
export type DataIndex = keyof LcaTableData;

//compare dates and return true if the date is between first and second date
function isDateBetween(dateToBeComparedTo: Date, firstDate: Date, secondDate: Date): boolean {
  if (compareAsc(firstDate, secondDate) == 1){
    throw new Error("firstDate is after secondDate");

  }

  // `compareAsc` compares the two dates and return 1 if the first date is after the second,
  // -1 if the first date is before the second or 0 if dates are equal.
  const isDateAfterFirstDate = compareAsc(dateToBeComparedTo,firstDate) >=0;
  const isDateBeforeSecondDate = compareAsc(dateToBeComparedTo,secondDate)<=0;


  const isDateBetween = isDateAfterFirstDate && isDateBeforeSecondDate;
  return isDateBetween;
}

function isDatestringValid(dateString: string): boolean {
  return !!dateString;
}

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

  /**
   * This function is used to customize the filter drop down for the date columns
   * @param dataIndex
   * @returns
   */
  const getDateColumnSearchProps = (dataIndex: DataIndex): ColumnType<LcaTableData> => ({
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
                  console.log("receivedDateFilter is set to: ", dateString);
                } else if (dataIndex === "decisionDate"){
                  setDecisionDateFilter(dateString);
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
       /**
        * dummy function here because it is not able to take in state
        */
        return true;
      }
  })

  // format table columns with filters based on pulled data
  const [formattedColumnsWithFilter, setFormattedColumnsWithFilter] =
        useState<ColumnsType<LcaTableData>>(
          formatColumnTypesWithFilters(BASE_LCA_TABLE_COLUMNS, lcaDataSource, getDateColumnSearchProps));

  //update the filters for the columns when the receivedDateFilter or decisionDateFilter is updated
  useEffect(() => {
    const newColumns = [...formattedColumnsWithFilter];

    newColumns[1].onFilter = (value, record) =>{
      // console.log("value: ", value);
      /**
       * Hacky approach to set filter state using index
       * because the value param in (value, record) here does not give me the range of date filters
       */
      console.log('current receivedDateFilter while filtering: ', receivedDateFilter);
      if (!isDatestringValid(receivedDateFilter[0]) && !isDatestringValid(receivedDateFilter[1])){
        return true
      }

      return isDateBetween(new Date(record['receivedDate']), new Date(receivedDateFilter[0]), new Date(receivedDateFilter[1]));
    };
    newColumns[2].onFilter = (value, record) => {
      // console.log("record[dataIndex]: ", record['decisionDate']);
      // console.log("value: ", value);
      /**
       * Hacky approach to set filter state using index
       * because the value param in (value, record) here does not give me the range of date filters
       */
      console.log('current decisionDateFilter while filtering: ', decisionDateFilter);
      if (!isDatestringValid(decisionDateFilter[0]) && !isDatestringValid(decisionDateFilter[1])){
        return true;
      }

      return isDateBetween(new Date(record['decisionDate']), new Date(decisionDateFilter[0]), new Date(decisionDateFilter[1]));
    };

    setFormattedColumnsWithFilter(newColumns);
  }, [receivedDateFilter, decisionDateFilter]);

  return (
    <Layout>
      <Table dataSource={lcaDataSource} columns={formattedColumnsWithFilter} />
    </Layout>
  )
}
