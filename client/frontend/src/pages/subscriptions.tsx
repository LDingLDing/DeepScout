import { useState, useCallback } from 'react';
import { Space, Button } from 'antd-mobile';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import ArticleCard from '../components/ArticleCard/ArticleCard';
import { fetchTopics, fetchSubscriptions } from '../mock/api';
import styles from './subscriptions.module.scss';

const SubscriptionsPage = () => {
  const { data: topics = [] } = useQuery('topics', fetchTopics);
  const { data: subscriptions = [] } = useQuery('subscriptions', fetchSubscriptions);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set(['all']));

  const handleTopicToggle = useCallback((topicId: string) => {
    setSelectedTopics(prev => {
      const newSet = new Set(prev);
      if (topicId === 'all') {
        if (newSet.has('all')) {
          newSet.clear();
        } else {
          newSet.clear();
          newSet.add('all');
          topics.forEach(topic => newSet.add(topic.id));
        }
      } else {
        if (newSet.has(topicId)) {
          newSet.delete(topicId);
          newSet.delete('all'); // 取消"全部"选中状态
        } else {
          newSet.add(topicId);
          // 如果选中了所有topic，自动选中"全部"
          if (topics.every(topic => newSet.has(topic.id))) {
            newSet.add('all');
          }
        }
      }
      return newSet;
    });
  }, [topics]);

  // 创建话题 ID 到话题数据的映射
  const topicMap = topics.reduce((acc, topic) => {
    acc[topic.id] = topic;
    return acc;
  }, {} as Record<string, typeof topics[0]>);

  const filteredSubscriptions = subscriptions.filter(sub => 
    selectedTopics.has('all') || selectedTopics.has(sub.topicId)
  );

  return (
    <div className={styles.container}>
      <div className={styles.topicsContainer}>
        <div className={styles.topicsGrid}>
          <Button
            className={`${styles.topicButton} ${selectedTopics.has('all') ? styles.selected : ''}`}
            onClick={() => handleTopicToggle('all')}
          >
            {selectedTopics.has('all') ? '取消全部' : '选中全部'}
          </Button>
          {topics.map(topic => (
            <Button
              key={topic.id}
              className={`${styles.topicButton} ${selectedTopics.has(topic.id) ? styles.selected : ''}`}
              onClick={() => handleTopicToggle(topic.id)}
            >
              {topic.title}
            </Button>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {filteredSubscriptions.map(subscription => (
          <ArticleCard
            key={subscription.id}
            {...subscription}
            topic={topicMap[subscription.topicId]}
          />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
