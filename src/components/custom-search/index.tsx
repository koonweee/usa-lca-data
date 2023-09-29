import { Input, Layout } from 'antd';
import { useRouter } from 'next/router';

const { Content } = Layout;
const { Search } = Input;

export function CustomSelectSearch(){
    const router = useRouter();
    const { query } = router.query;


    const handleSearch = (value: string) => {
        router.push({
            pathname: router.asPath.split('?')[0] + 'results',
            query: value? 
                    { query: value }:
                    undefined,
            });
    }

    return (
        <div style={{'display': 'flex', 'justifyContent': 'space-between'}}>
            <Content>
                <div style={{maxWidth: '100%', margin: '0% 5%'}}>
                <Search
                    placeholder="Search by 'Software Engineer' or 'Google' here"
                    allowClear
                    enterButton="Search"
                    size="large"
                    onSearch={handleSearch}
                    value={query}
                    style={{ width: '100%', borderColor: 'white', borderWidth: '2px', borderRadius: '10px'}}
                />
                </div>
            </Content>
        </div>
    )
}