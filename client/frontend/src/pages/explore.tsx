import { useState } from 'react';
import { SearchBar } from 'antd-mobile';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import TopicCard from '../components/TopicCard/TopicCard';
import { fetchTopics } from '../mock/api';
import styles from './explore.module.scss';

const ExplorePage = () => {
  const { t, i18n } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const { data: topics = [] } = useQuery('topics', fetchTopics);
  const currentLanguage = i18n.language as 'zh-CN' | 'en-US';

  const handleSubscribe = (id: string) => {
    // TODO: 实现订阅功能
    console.log('Subscribe to:', id);
  };

  const filteredTopics = topics.filter(topic => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    const titleLower = topic.title[currentLanguage].toLowerCase();
    const descLower = topic.description[currentLanguage].toLowerCase();
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
        {filteredTopics.map((topic) => (
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
