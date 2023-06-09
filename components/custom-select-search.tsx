'use client'
import { Button, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation'
import { NextRouter } from 'next/router';
import { useState } from 'react';



const { Option } = Select;




export function CustomSelectSearch(){
    const router = useRouter();
    const [searchValues,setSearchValues] = useState<string[]>([]);

    const handleSelect = (value: string[]) => {
        setSearchValues(value);
        console.log(`selected ${searchValues}`);
      };
    
    const handleSearch = (router: NextRouter) => {
        console.log('search with the selected values');
        //hit the new page with the query params based
        router.push(`/results?query=${searchValues.join("+")}`);
    }
    
    return (
        <div style={{'display': 'flex', 'justifyContent': 'space-between'}}>
      <Select
            mode="multiple"
            style={{ width: '88%' }}
            placeholder="Search for job titles, location or companies"
            defaultValue={[]}
            onChange={handleSelect}
            optionLabelProp="label"
        >
            <Option value="china" label="China">
                <Space>
                    <span role="img" aria-label="China">
                    🇨🇳
                    </span>
                    China (中国)
                </Space>
            </Option>
            <Option value="usa" label="USA">
                <Space>
                    <span role="img" aria-label="USA">
                    🇺🇸
                    </span>
                    USA (美国)
                </Space>
            </Option>
            <Option value="japan" label="Japan">
                <Space>
                    <span role="img" aria-label="Japan">
                    🇯🇵
                    </span>
                    Japan (日本)
                </Space>
            </Option>
            <Option value="korea" label="Korea">
                <Space>
                    <span role="img" aria-label="Korea">
                    🇰🇷
                    </span>
                    Korea (韩国)
                </Space>
            </Option>
        </Select>
        <Button type="primary" icon={<SearchOutlined />} style={{backgroundColor: '#1677ff'}} onClick={() => handleSearch(router)}>Search</Button>
      </div>
    )
}