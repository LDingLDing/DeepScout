import { Button, Dialog, Toast, Radio, Switch } from 'antd-mobile';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { userApi, authApi } from '../services/api';
import styles from './profile.module.scss';

// 导入 RadioValue 类型
import type { RadioValue } from 'antd-mobile/es/components/radio';

interface UserProfile {
  email: string;
  enable_email_push: boolean;
  // 可以根据实际后端返回的用户信息扩展此接口
}

const ProfilePage = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const data = await userApi.getUserProfile();
        setUserProfile(data);
      } catch (error) {
        console.error('获取用户信息失败:', error);
        Toast.show({
          icon: 'fail',
          content: t('profile.fetchFailed'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [t]);

  const handleCopy = () => {
    Toast.show({
      icon: 'success',
      content: t('profile.emailCopied'),
    });
  };

  const handleLogout = () => {
    Dialog.confirm({
      content: t('profile.logoutConfirm'),
      onConfirm: async () => {
        try {
          await authApi.logout();
          // 清除本地存储的token
          localStorage.removeItem('access_token');
          Toast.show({
            icon: 'success',
            content: t('profile.logoutSuccess'),
          });
          router.push('/login');
        } catch (error) {
          console.error('登出失败:', error);
          Toast.show({
            icon: 'fail',
            content: t('profile.logoutFailed'),
          });
        }
      },
    });
  };

  const handleLanguageChange = (value: RadioValue) => {
    // 确保 value 是字符串类型
    if (typeof value === 'string') {
      i18n.changeLanguage(value);
      localStorage.setItem('language', value);
    }
  };

  const handleEmailPushChange = async (checked: boolean) => {
    if (!userProfile) return;
    
    try {
      setUpdatingProfile(true);
      await userApi.updateUserProfile({ enable_email_push: checked });
      setUserProfile({ ...userProfile, enable_email_push: checked });
      Toast.show({
        icon: 'success',
        content: t('profile.updateSuccess'),
      });
    } catch (error) {
      console.error('更新用户配置失败:', error);
      Toast.show({
        icon: 'fail',
        content: t('profile.updateFailed'),
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>{t('profile.personalInfo')}</h2>
        {loading ? (
          <div className={styles.loading}>{t('common.loading')}</div>
        ) : (
          <div className={styles.info}>
            <div className={styles.item}>
              <span className={styles.label}>{t('profile.email')}</span>
              <div className={styles.value}>
                <span>{userProfile?.email}</span>
                {userProfile?.email && (
                  <CopyToClipboard text={userProfile.email} onCopy={handleCopy}>
                    <Button size='small'>{t('profile.copy')}</Button>
                  </CopyToClipboard>
                )}
              </div>
            </div>
            <div className={styles.item}>
              <span className={styles.label}>{t('profile.enableEmailPush')}</span>
              <div className={styles.value}>
                <Switch
                  checked={userProfile?.enable_email_push}
                  onChange={(checked) => handleEmailPushChange(checked)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.card}>
        <h2>{t('profile.language')}</h2>
        <div className={styles.settings}>
          <Radio.Group
            value={i18n.language}
            onChange={handleLanguageChange}
          >
            <Radio value="zh-CN" className={styles.radioItem}>
              {t('profile.zh-CN')}
            </Radio>
            <Radio value="en-US" className={styles.radioItem}>
              {t('profile.en-US')}
            </Radio>
          </Radio.Group>
        </div>
      </div>

      <Button
        block
        color='danger'
        className={styles.logoutButton}
        onClick={handleLogout}
      >
        {t('profile.logout')}
      </Button>
    </div>
  );
};

export default ProfilePage;
