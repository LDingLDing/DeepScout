import { useState } from 'react';
import { Input, Button, Space, Grid } from 'antd';
import { SearchOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;
const { Search } = Input;

interface SearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  allowClear?: boolean;
  loading?: boolean;
  defaultValue?: string;
  style?: React.CSSProperties;
}

export default function SearchBar({
  placeholder = '搜索...',
  onSearch,
  allowClear = true,
  loading = false,
  defaultValue = '',
  style
}: SearchBarProps) {
  const [searchValue, setSearchValue] = useState(defaultValue);
  const screens = useBreakpoint();
  
  const handleSearch = (value: string) => {
    onSearch(value);
  };
  
  const handleClear = () => {
    setSearchValue('');
    onSearch('');
  };
  
  return (
    <div style={{ width: '100%', ...style }}>
      {screens.md ? (
        // PC端使用标准搜索框
        <Search
          placeholder={placeholder}
          allowClear={allowClear}
          enterButton
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          loading={loading}
          style={{ width: '100%' }}
        />
      ) : (
        // 移动端使用自定义搜索框
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onPressEnter={() => handleSearch(searchValue)}
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            suffix={
              allowClear && searchValue ? (
                <CloseCircleOutlined
                  style={{ color: '#bfbfbf', cursor: 'pointer' }}
                  onClick={handleClear}
                />
              ) : null
            }
            style={{ borderRadius: '4px 0 0 4px' }}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={() => handleSearch(searchValue)}
            style={{ 
              borderRadius: '0 4px 4px 0',
              padding: '0 8px',
              minHeight: '40px'
            }}
          />
        </Space.Compact>
      )}
    </div>
  );
}
