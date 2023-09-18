import { BASE_LCA_TABLE_COLUMNS } from "@/components/lca-table/column-type";
import { LCADataToTableDataSource, LcaTableData } from "@/components/lca-table/formatters";
import InfiniteScroll from 'react-infinite-scroll-component';

import { Card, Layout, Table } from "antd";

import { LCAData } from "@/types/lca";
import { useState } from "react";
interface Props {
  lcaData: LCAData[];
}

const { Meta } = Card;


export function LCATableMobile({ lcaData }: Props) {
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
        <p>LCA case number: {data.lcaCaseNumber}</p>
        <p>Received Date: {data.receivedDate}</p>
        <p>Decision Date: {data.decisionDate}</p>
        <br/>
        <p>Employer Name: {data.employerName}</p>
        <p>Case Status: {data.caseStatus} {data.caseStatus.includes('Certified') ? "✅" : "🚫" }</p>
        <p>Employer City: {data.employerCity}</p>
      </div>  
    )      
  }

  return (
    <Layout>
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
              style = {{ textOverflow: 'break-word', whiteSpace: 'normal', overflowWrap: 'break-word'}}
                title={`${titleCase(i.jobTitle)}`}
                description            />
              {buildCardDescription(i)}
            </Card>
          ))}
        </InfiniteScroll>
    </Layout>
  )
}
