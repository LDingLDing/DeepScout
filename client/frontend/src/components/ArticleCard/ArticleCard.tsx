import React, { useState, useRef, useEffect } from 'react';
import { Card, Tag, Button } from 'antd-mobile';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import styles from './ArticleCard.module.scss';

interface ArticleCardProps {
  id: string;
  topicId: string;
  title: string;
  content: string;
  publishTime: number;
  readTime: number;
  topic: {
    title: string;
  };
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  content,
  publishTime,
  readTime,
  topic,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [contentOverflows, setContentOverflows] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // 将毫秒时间戳转换为本地日期
  const formattedDate = new Date(publishTime).toLocaleDateString();
  
  // 将秒数转换为可读的时间格式
  const formatReadTime = (seconds: number): string => {
    if (seconds < 60) {
      return t('articleCard.secondsRead', { seconds });
    } else {
      const minutes = Math.floor(seconds / 60);
      return t('articleCard.minutesRead', { minutes });
    }
  };

  // 检测内容是否溢出容器
  useEffect(() => {
    if (contentRef.current) {
      // 获取内容元素
      const element = contentRef.current;
      // 检查内容是否溢出（实际高度是否大于最大显示高度）
      // 这里的最大显示高度与CSS中设置的line-clamp和max-height对应
      const isOverflowing = element.scrollHeight > element.clientHeight;
      setContentOverflows(isOverflowing);
    }
  }, [content]);

  return (
    <Card className={`${styles.card} ${expanded ? styles.expandedCard : ''}`}>
      <div className={styles.header}>
        <Tag color='primary' fill='outline' className={styles.tag}>
          {topic.title}
        </Tag>
        <span className={styles.date}>{formattedDate}</span>
      </div>
      <div className={`${styles.content} ${expanded ? styles.expanded : ''}`}>
        <h3 className={styles.title}>{title}</h3>
        <div 
          ref={contentRef} 
          className={styles.text}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        {contentOverflows && (
          <div className={styles.readMoreContainer}>
            <Button 
              className={styles.readMoreButton}
              fill='none'
              size='small'
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? t('articleCard.collapse') : t('articleCard.readMore')}
            </Button>
          </div>
        )}
      </div>
      <div className={styles.footer}>
        <span className={styles.readTime}>{formatReadTime(readTime)}</span>
      </div>
    </Card>
  );
};

export default ArticleCard;
