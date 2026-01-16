import { LinkOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Drawer, List, Typography } from 'antd';
import { useMemo, useState } from 'react';

import { useMessage } from '@/hook/useMessage';
import { useMenuStore, type SystemKey } from '@/store/menu.store';
import { useMdiStore } from '@/store/mdi.store';
import { menuTreeEtc, menuTreeSpp } from '@/config/mockMenuConfig';

type SystemLink = {
  label: string;
  href: string;
};

const SystemLinks = () => {
  const [open, setOpen] = useState(false);
  const { alertMessage } = useMessage();
  const systemKey = useMenuStore((s) => s.systemKey);
  const setSystemKey = useMenuStore((s) => s.setSystemKey);
  const setMenuTree = useMenuStore((s) => s.setMenuTree);
  const resetTabs = useMdiStore((s) => s.resetTabs);

  // Header(=GNB) + MDI 탭바 높이 만큼 내려서, "MDI 바로 밑"에 붙게 처리
  const TOP_OFFSET = 64 + 52;

  // 실제 링크가 있다면 href만 바꿔주면 됨
  const links = useMemo<SystemLink[]>(
    () => [
      { label: '문서반출 시스템', href: 'spp' },
      { label: '개인정보 관리시스템', href: '#' },
      { label: '영상정보중앙 관리시스템', href: '#' },
      { label: '이상징후모니터링', href: '#' },
      { label: '정보보호모니터링', href: '#' },
      { label: '정보보호리더토크', href: '#' },
      { label: '보안성 심의시스템', href: '#' },
      { label: '인프라취약점 점검시스템', href: '#' },
      { label: '위탁계좌 관리시스템', href: '#' },
      { label: '그룹정보보호협의체', href: '#' },
      { label: '정보보호 인증평가 관리시스템', href: '#' },
      { label: '보안취약점통합 관리시스템', href: '#' },
      { label: '가명처리솔루션', href: '#' },
    ],
    [],
  );

  const DRAWER_WIDTH = 320;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          // 시스템 링크가 열렸을 때는 버튼이 Drawer 왼쪽에 붙도록 이동
          right: open ? DRAWER_WIDTH : 0,
          top: TOP_OFFSET,
          zIndex: 2500,
        }}
      >
        <Button
          type="primary"
          onClick={() => setOpen((v) => !v)}
          style={{
            borderRadius: '8px 0 0 8px',
            height: 140,
            padding: '10px 10px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <span style={{ writingMode: 'vertical-rl', letterSpacing: 2 }}>시스템링크</span>
            <span>{open ? <MinusOutlined /> : <PlusOutlined />}</span>
          </div>
        </Button>
      </div>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LinkOutlined />
            <Typography.Text strong>시스템 링크</Typography.Text>
          </div>
        }
        placement="right"
        width={DRAWER_WIDTH}
        open={open}
        onClose={() => setOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        <List
          dataSource={links}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                background: item.href === systemKey ? 'rgba(22, 119, 255, 0.10)' : undefined,
              }}
              onClick={() => {
                // href가 없으면 "준비중" 알럿
                if (!item.href || item.href === '#') {
                  alertMessage('준비중입니다.');
                  return;
                }

                // 내부 시스템 전환: /{systemKey} 로 URL 변경 + 메뉴 트리 교체 + 탭 초기화
                const nextSystem = item.href as SystemKey;
                if (nextSystem !== 'spp' && nextSystem !== 'etc') {
                  alertMessage('준비중입니다.');
                  return;
                }

                setSystemKey(nextSystem);
                setMenuTree(nextSystem === 'etc' ? menuTreeEtc : menuTreeSpp);
                resetTabs();
                setOpen(false);

                try {
                  const nextPath = `/${nextSystem}`;
                  if (window.location.pathname !== nextPath) {
                    window.history.replaceState(null, '', nextPath);
                  }
                } catch {
                  // ignore
                }
              }}
            >
              <Typography.Text strong={item.href === systemKey}>{item.label}</Typography.Text>
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
};

export default SystemLinks;
