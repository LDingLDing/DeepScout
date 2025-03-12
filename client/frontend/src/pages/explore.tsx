import { useState } from 'react';
import { SearchBar } from 'antd-mobile';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import TopicCard from '../components/TopicCard/TopicCard';
import { topicsApi } from '../services/api';
import styles from './explore.module.scss';

interface Topic {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  hot: boolean;
  isSubscribed: boolean;
}

const ExplorePage = () => {
  const { t, i18n } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const { data: topics = [], refetch } = useQuery<Topic[]>('topics', topicsApi.getTopics);

  const handleSubscribe = async (id: string) => {
    try {
      await topicsApi.toggleSubscription(id);
      // 刷新话题列表以获取最新的订阅状态
      refetch();
    } catch (error) {
      console.error('订阅失败:', error);
    }
  };

  const filteredTopics = topics.filter((topic: Topic) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    const titleLower = topic.title.toLowerCase();
    const descLower = topic.description.toLowerCase();
    return titleLower.includes(searchLower) || descLower.includes(searchLower);
  });

  return (
    <div className={styles.container}>
      <SearchBar
        placeholder={t('explore.searchPlaceholder')}
        value={searchText}
        onChange={setSearchText}
        className={styles.searchBar}
      />
      <div className={styles.topicList}>
        {filteredTopics.map((topic: Topic) => (
          <TopicCard
            key={topic.id}
            {...topic}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>
    </div>
  );
};

export default ExplorePage;
