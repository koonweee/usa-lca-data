'use client'
import prisma from '@/lib/prisma'
import { timeAgo } from '@/lib/utils'
import { users } from '@prisma/client'
import Image from 'next/image'
import RefreshButton from './refresh-button'
import { Table } from 'antd';

const dataSource = [
  {
    key: '1',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '2',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '3',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '4',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '5',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '6',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '7',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '8',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '9',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '10',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '11',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '12',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '13',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '14',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '15',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '16',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '17',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '18',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '19',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '20',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '21',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '22',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '23',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '24',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '25',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '26',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
  {
    key: '27',
    status: 'Withdrawn',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/31/23',
    lcaCaseNumber: 'xxx'
  },
  {
    key: '28',
    status: 'Approved',
    jobTitle: 'Software Engineer',
    baseSalary: '100000',
    startDate: '12/34/1234'
  },
];

const columns = [
  {
    title: 'CASE number',
    dataIndex: 'lcaCaseNumber',
    key: 'lcaCaseNumber',
    filterSearch: true, // filterSearch is used to enable search of filter items, 
    //and you can set a custom filter method through filterSearch:(input, record) => boolean.
    filters:[ //needs to be dynamically built
      {
        text: 'xxx',
        value: 'xxx',
      }
    ]
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Job title',
    dataIndex: 'jobTitle',
    key: 'jobTitle',
  },
  {
    title: 'Base Salary (USD)',
    dataIndex: 'baseSalary',
    key: 'baseSalary',
  },
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    key: 'startDate',
  },
];

export default async function TableWrapper() {
  const startTime = Date.now()
  // TODO: the fetching of data needs to be in a server component, refactored into a purely data fetching function
  // const users = await prisma.users.findMany()
  const users: users[] = [];
  const duration = Date.now() - startTime

  return (
    <div className="bg-white/30 p-12 shadow-xl ring-1 ring-gray-900/5 rounded-lg backdrop-blur-lg max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Recent Users</h2>
        </div>
        <RefreshButton />
      </div>
      <div className="divide-y divide-gray-900/5">
          <div>
            <Table dataSource={dataSource} columns={columns} />
          </div>
        {users.map((user) => (
          <div
            key={user.name}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center space-x-4">
              <Image
                src={user.image}
                alt={user.name}
                width={48}
                height={48}
                className="rounded-full ring-1 ring-gray-900/5"
              />
              <div className="space-y-1">
                <p className="font-medium leading-none">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">{timeAgo(user.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
