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
  image_url?: string;
  hot: boolean;
  is_subscribed: boolean;
}

interface Subscription {
  id: string;
  topic_id: string;
  title: string;
  content: string;
  publish_time: number;
  read_time: number;
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
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 获取用户订阅的话题
  const { data: topics = [], isLoading: isTopicsLoading } = useQuery<Topic[]>(
    'subscribedTopics',
    topicsApi.getUserSubscribedTopics
  );
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set(['all']));

  // 节流函数
  const throttle = (fn: Function, delay: number) => {
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }
    throttleTimerRef.current = setTimeout(() => {
      fn();
      throttleTimerRef.current = null;
    }, delay);
  };

  // 获取分页订阅数据
  const fetchSubscriptions = async (pageNum: number) => {
    if (isLoading || !hasMore) return;
    
    // 如果话题列表为空，直接返回
    if (topics.length === 0 && !isTopicsLoading) {
      setSubscriptions([]);
      setHasMore(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const selectedTopicIds = Array.from(selectedTopics).filter(id => id !== 'all');
      
      const response = await subscriptionsApi.getSubscriptions(
        pageNum,
        10,
        selectedTopicIds
      );
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

  // 初始加载数据 - 等待话题加载完成
  useEffect(() => {
    if (!isTopicsLoading) {
      fetchSubscriptions(1);
    }
  }, [isTopicsLoading]);

  // 设置无限滚动
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isLoading && hasMore) {
          // 使用节流处理滚动加载
          throttle(() => fetchSubscriptions(page + 1), 500);
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
      // 清理定时器
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
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
          newSet.delete('all');
        } else {
          newSet.add(topicId);
          if (newSet.size === topics.length) {
            newSet.add('all');
          }
        }
      }
      return newSet;
    });
    
    // 重置分页并使用节流重新获取数据
    setPage(1);
    setHasMore(true);
    throttle(() => fetchSubscriptions(1), 500);
  }, [topics]);

  // 根据选中的话题过滤订阅内容
  const filteredSubscriptions = selectedTopics.has('all')
    ? subscriptions
    : subscriptions.filter(sub => selectedTopics.has(sub.topic_id));

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
          {!isTopicsLoading && topics.map(topic => (
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
            const topic = topics.find(t => t.id === sub.topic_id) || {
              id: 'unknown',
              title: t('subscriptions.unknownTopic'),
              description: '',
              hot: false,
              is_subscribed: false
            };
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
