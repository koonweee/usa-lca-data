'use client'
import { LCA_TABLE_COLUMNS } from "@/components/lca-table/consts";
import { LCADataToTableDataSource } from "@/components/lca-table/formatters";
import { LCAData } from "@/hooks/get_lca_data";
import { Table } from "antd";
import { useEffect, useState } from "react";

interface Props {
  lcaData: LCAData[];
}

export function LCATable({ lcaData }: Props) {

  // format lcaData as a dataSource
  const lcaDataSource = LCADataToTableDataSource(lcaData);

  return (
    <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Labour Condition Applications (LCA)</h2>
        </div>
      </div>
      <div className="divide-y divide-gray-900/5">
          <div>
            <Table dataSource={lcaDataSource} columns={LCA_TABLE_COLUMNS} />
          </div>
      </div>
    </div>
  )
}
