import { useState, useCallback, useRef, useEffect } from 'react';
import { Space, Button, DotLoading } from 'antd-mobile';
import { useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';
import ArticleCard from '../components/ArticleCard/ArticleCard';
import { topicsApi, subscriptionsApi } from '../services/api';
import styles from './subscriptions.module.scss';

interface Topic {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  subscribers: number;
  hot: boolean;
  isSubscribed: boolean;
}

interface Subscription {
  id: string;
  topicId: string;
  title: string;
  content: string;
  publishTime: number;
  readTime: number;
}

interface PaginatedSubscriptions {
  items: Subscription[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const SubscriptionsPage = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const { data: topics = [] } = useQuery<Topic[]>('topics', topicsApi.getTopics);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set(['all']));

  // 获取分页订阅数据
  const fetchSubscriptions = async (pageNum: number) => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    try {
      const response = await subscriptionsApi.getPaginatedSubscriptions(pageNum);
      const paginatedData = response as PaginatedSubscriptions;
      
      if (pageNum === 1) {
        setSubscriptions(paginatedData.items);
      } else {
        setSubscriptions(prev => [...prev, ...paginatedData.items]);
      }
      
      setHasMore(paginatedData.hasMore);
      setPage(paginatedData.page);
    } catch (error) {
      console.error(t('subscriptions.fetchError'), error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchSubscriptions(1);
  }, []);

  // 设置无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          fetchSubscriptions(page + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [page, isLoading, hasMore]);

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
          newSet.delete('all'); // 取消全选
        } else {
          newSet.add(topicId);
          // 如果选择了所有话题，则添加'all'
          if (newSet.size === topics.length) {
            newSet.add('all');
          }
        }
      }
      return newSet;
    });
    
    // 重置分页并重新获取数据
    setPage(1);
    setHasMore(true);
    fetchSubscriptions(1);
  }, [topics]);

  // 根据选中的话题过滤订阅内容
  const filteredSubscriptions = selectedTopics.has('all')
    ? subscriptions
    : subscriptions.filter(sub => selectedTopics.has(sub.topicId));

  return (
    <div className={styles.container}>
      <div className={styles.topicFilter}>
        <Space wrap>
          <Button
            color={selectedTopics.has('all') ? 'primary' : 'default'}
            fill={selectedTopics.has('all') ? 'solid' : 'outline'}
            onClick={() => handleTopicToggle('all')}
            size='small'
          >
            {t('subscriptions.all')}
          </Button>
          {topics.map(topic => (
            <Button
              key={topic.id}
              color={selectedTopics.has(topic.id) ? 'primary' : 'default'}
              fill={selectedTopics.has(topic.id) ? 'solid' : 'outline'}
              onClick={() => handleTopicToggle(topic.id)}
              size='small'
            >
              {topic.title}
            </Button>
          ))}
        </Space>
      </div>

      <div className={styles.subscriptionList}>
        {filteredSubscriptions.length > 0 ? (
          filteredSubscriptions.map(sub => {
            const topic = topics.find(t => t.id === sub.topicId) || { title: t('subscriptions.unknownTopic') };
            return (
              <ArticleCard
                key={sub.id}
                {...sub}
                topic={topic}
              />
            );
          })
        ) : (
          <div className={styles.emptyState}>{t('subscriptions.noContent')}</div>
        )}
        
        {/* 加载更多指示器 */}
        <div ref={loadMoreRef} className={styles.loadMoreIndicator}>
          {isLoading && (
            <div className={styles.loadingMore}>
              <DotLoading color='primary' />
              <span>{t('subscriptions.loading')}</span>
            </div>
          )}
          {!hasMore && subscriptions.length > 0 && (
            <div className={styles.noMoreData}>{t('subscriptions.noMoreContent')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
