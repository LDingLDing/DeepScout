import { Button, Dialog, Toast, Radio } from 'antd-mobile';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import styles from './profile.module.scss';

const ProfilePage = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const userEmail = 'example@email.com'; // TODO: 从用户状态获取

  const handleCopy = () => {
    Toast.show({
      icon: 'success',
      content: '邮箱已复制',
    });
  };

  const handleLogout = () => {
    Dialog.confirm({
      content: '确定要退出登录吗？',
      onConfirm: async () => {
        // TODO: 清除用户状态
        Toast.show({
          icon: 'success',
          content: '已退出登录',
        });
        router.push('/login');
      },
    });
  };

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem('language', value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>个人信息</h2>
        <div className={styles.info}>
          <div className={styles.item}>
            <span className={styles.label}>邮箱</span>
            <div className={styles.value}>
              <span>{userEmail}</span>
              <CopyToClipboard text={userEmail} onCopy={handleCopy}>
                <Button size='small'>复制</Button>
              </CopyToClipboard>
            </div>
          </div>
        </div>
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
        退出登录
      </Button>
    </div>
  );
};

export default ProfilePage;
