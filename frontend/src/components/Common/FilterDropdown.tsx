import { Select, Space, Typography, Grid } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { useBreakpoint } = Grid;

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  loading?: boolean;
}

export default function FilterDropdown({
  options,
  value,
  onChange,
  placeholder = '筛选',
  style,
  loading = false
}: FilterDropdownProps) {
  const screens = useBreakpoint();
  
  return (
    <div style={{ ...style }}>
      {screens.md ? (
        // PC端显示带标签的下拉框
        <Space>
          <Text>筛选:</Text>
          <Select
            value={value}
            onChange={onChange}
            style={{ width: 120 }}
            options={options}
            loading={loading}
            placeholder={placeholder}
          />
        </Space>
      ) : (
        // 移动端显示紧凑型下拉框
        <Select
          value={value}
          onChange={onChange}
          style={{ width: '100%' }}
          options={options}
          loading={loading}
          placeholder={placeholder}
          suffixIcon={<FilterOutlined />}
          dropdownMatchSelectWidth={false}
        />
      )}
    </div>
  );
}
