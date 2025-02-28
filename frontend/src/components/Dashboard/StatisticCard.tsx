import { Card, Statistic, Tooltip } from 'antd';
import { ReactNode } from 'react';

interface StatisticCardProps {
  title: string;
  value: number;
  prefix?: ReactNode;
  suffix?: string;
  precision?: number;
  valueStyle?: React.CSSProperties;
  loading?: boolean;
  tooltip?: string;
}

export default function StatisticCard({
  title,
  value,
  prefix,
  suffix,
  precision,
  valueStyle,
  loading = false,
  tooltip,
}: StatisticCardProps) {
  const cardTitle = tooltip ? (
    <Tooltip title={tooltip}>
      <span>{title}</span>
    </Tooltip>
  ) : (
    title
  );

  return (
    <Card hoverable>
      <Statistic
        title={cardTitle}
        value={value}
        precision={precision}
        valueStyle={valueStyle}
        prefix={prefix}
        suffix={suffix}
        loading={loading}
      />
    </Card>
  );
}
