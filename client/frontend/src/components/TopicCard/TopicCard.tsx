import React from 'react';
import { Card, Badge, Button } from 'antd-mobile';
import { AddOutline, CloseOutline } from 'antd-mobile-icons';
import { formatNumber } from '../../utils/format';
import { useTranslation } from 'react-i18next';
import styles from './TopicCard.module.scss';

interface TopicCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  hot?: boolean;
  isSubscribed: boolean;
  onSubscribe: (id: string) => void;
}

const TopicCard: React.FC<TopicCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  hot,
  isSubscribed,
  onSubscribe,
}) => {
  const { t } = useTranslation();

  return (
    <Card className={styles.card}>
      {imageUrl && (
        <div className={styles.imageWrapper}>
          <img src={imageUrl} alt={title} loading="lazy" />
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.titleRow}>
          {hot && (
            <Badge content="🔥" className={styles.hotBadge} />
          )}
          <h3>{title}</h3>
        </div>
        <p className={styles.description}>{description}</p>
        <div className={styles.footer}>
          <Button
            className={styles.subscribeBtn}
            onClick={() => onSubscribe(id)}
            data-subscribed={isSubscribed}
          >
            {isSubscribed ? <CloseOutline /> : <AddOutline />}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TopicCard;
