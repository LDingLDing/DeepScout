import React from 'react';
import { Card, Tag } from 'antd-mobile';
import styles from './ArticleCard.module.scss';

interface ArticleCardProps {
  id: string;
  topicId: string;
  title: string;
  content: string;
  publishTime: string;
  readTime: string;
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
  const formattedDate = new Date(publishTime).toLocaleDateString();

  return (
    <Card className={styles.card}>
      <div className={styles.header}>
        <Tag color='primary' fill='outline' className={styles.tag}>
          {topic.title}
        </Tag>
        <span className={styles.date}>{formattedDate}</span>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.text}>{content}</p>
      </div>
      <div className={styles.footer}>
        <span className={styles.readTime}>{readTime}</span>
      </div>
    </Card>
  );
};

export default ArticleCard;
