import { Button, Card, Space, Typography } from 'antd';

import { DEFAULT_SCREEN_KEY } from '@/config/mockMenuConfig';
import { useMdiStore } from '@/store/mdi.store';
import { useMenuStore } from '@/store/menu.store';

const NotFoundPage = () => {
  const systemKey = useMenuStore((s) => s.systemKey);
  const activeKey = useMdiStore((s) => s.activeKey);
  const closeTab = useMdiStore((s) => s.closeTab);
  const ensureDashboard = useMdiStore((s) => s.ensureDashboard);
  const setActive = useMdiStore((s) => s.setActive);

  const goHome = () => {
    // 현재 열린 탭만 닫고, 대시보드로 이동
    closeTab(activeKey);
    ensureDashboard();
    setActive(DEFAULT_SCREEN_KEY);

    // URL은 시스템 prefix로 유지
    try {
      const nextPath = `/${systemKey}`;
      if (window.location.pathname !== nextPath) {
        window.history.replaceState(null, '', nextPath);
      }
    } catch {
      // ignore
    }
  };

  return (
    <Card>
      <Typography.Title level={4} style={{ marginTop: 0 }}>
        페이지를 찾을 수 없습니다.
      </Typography.Title>

      <Typography.Paragraph>요청하신 페이지가 존재하지 않거나 메뉴 설정에 포함되어 있지 않습니다.</Typography.Paragraph>

      <Space>
        <Button type="primary" onClick={goHome}>
          대시보드로
        </Button>
      </Space>
    </Card>
  );
};

export default NotFoundPage;
