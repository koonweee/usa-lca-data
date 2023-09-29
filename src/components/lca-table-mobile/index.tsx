import { BASE_LCA_TABLE_COLUMNS } from "@/components/lca-table/column-type";
import { LCADataToTableDataSource, LcaTableData } from "@/components/lca-table/formatters";
import InfiniteScroll from 'react-infinite-scroll-component';

import { Card, Divider, Layout, Space, Table } from "antd";

import { LCAData } from "@/types/lca";
import { useState } from "react";
import { FiltersBar } from "@/components/filters-bar";
import { FiltersConfig, useFiltersBar } from "@/components/lca-table-mobile/hooks/use-filters-bar";
import { FilterModal } from "@/components/lca-table-mobile/components/filter-modal";
interface Props {
  lcaData: LCAData[];
}

const { Meta } = Card;


export function LCATableMobile({ lcaData }: Props) {


  //change all caps string to title case
  const titleCase = (str: string): string => {
    return str.toLowerCase().split(' ').map(function(word) {
      return word[0] ? word.replace(word[0], word[0].toUpperCase()) : '';
    }).join(' ');
  }


  const buildCardDescription = (data: LcaTableData): JSX.Element => {

    //return a list of p elements with the data
    return (
      <div>
        <p>Base Salary: {data.baseSalary}</p>
        <p>LCA case number: {data.lcaCaseNumber}</p>
        <p>Received Date: {data.receivedDate}</p>
        <p>Decision Date: {data.decisionDate}</p>
        <br/>
        <p>Employer Name: {data.employerName}</p>
        <p>Case Status: {data.caseStatus} {data.caseStatus.includes('Certified') ? "✅" : "🚫" }</p>
        <p>Employer State: {data.employerState}</p>
      </div>
    )
  }

  // setup state for filter modal
  // type of modal is determined by what key is set
  const [filterModalConfig, setFilterModalConfig] = useState<FiltersConfig | undefined>(undefined);

  // setup hook and states for filters
  const filtersConfig = useFiltersBar({ setFilterModalConfig });

  // format lcaData as a dataSource
  const lcaDataSource = LCADataToTableDataSource(lcaData);

  const [loadedItems, setLoadedItems] = useState(lcaDataSource.slice(0, 20));
  const [hasMore, setHasMore] = useState(true);

  //on reach end of page, load more cards or data
  const fetchMoreData = () => {
    if (loadedItems.length >= 500) {
      setHasMore(false);
      return;
    }
    // a fake async api call like which adds
    // 20 more records in 1 secs
    setTimeout(() => {
      setLoadedItems(loadedItems.concat(lcaDataSource.slice(loadedItems.length, loadedItems.length + 20)));
    }, 1000);
  };

  return (
    <Layout>
      {filterModalConfig &&
        <FilterModal
          filterConfig={filterModalConfig}
          onCancel={() => setFilterModalConfig(undefined)}
        />
      }
      <FiltersBar filtersConfig={filtersConfig}/>
      <Divider/>
      <InfiniteScroll
        dataLength={loadedItems.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={
          <Card style={{ width: '100%', marginTop: 16 }} loading >
            <Meta
              title="Card title"
              description="dummy description"
              />
          </Card>}
        height='70vh'
        endMessage={
            // if there is no more data, show a message that we reached the end
          <p style={{ textAlign: "center" }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        {loadedItems.map((i) => (
          <Card style={{ width: '100%', marginTop: 16, borderColor: 'white' }} key={i.lcaCaseNumber} >
            <Meta
              title={`${titleCase(i.jobTitle)}`}
              description            />
            {buildCardDescription(i)}
          </Card>
        ))}
      </InfiniteScroll>
    </Layout>

  )
}
