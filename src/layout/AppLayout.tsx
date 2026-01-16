import { AppstoreOutlined, FileTextOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { MenuNode } from '@/config/mockMenuConfig';
import { DEFAULT_SCREEN_KEY } from '@/config/mockMenuConfig';
import MDITabs from '@/layout/MdiTabs';
import PageHost from '@/layout/PageHost';
import SystemLinks from '@/layout/SystemLinks';
import { useMdiStore } from '@/store/mdi.store';
import { useMenuStore } from '@/store/menu.store';
import { Footer } from 'antd/es/layout/layout';

const { Header, Sider, Content } = Layout;

const HEADER_HEIGHT = 64;
const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 56;

type BuildMenuOpts = {
  siderCollapsed?: boolean;
  onRootEnter?: (rootKey: string) => void;
  onRootLeave?: () => void;
  onRootClick?: (rootKey: string) => void;
};

const buildMenuItems = (tree: MenuNode[], opts?: BuildMenuOpts): NonNullable<MenuProps['items']> => {
  const toItem = (node: MenuNode, depth = 0): NonNullable<MenuProps['items']>[number] => {
    const isRoot = depth === 0;
    const baseIcon = node.isLeaf ? <FileTextOutlined /> : <AppstoreOutlined />;
    const icon =
      opts?.siderCollapsed && isRoot
        ? (
            <span
              onMouseEnter={(e) => {
                e.stopPropagation();
                opts.onRootEnter?.(node.key);
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                opts.onRootLeave?.();
              }}
              onClick={(e) => {
                e.stopPropagation();
                opts.onRootClick?.(node.key);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}
            >
              {baseIcon}
            </span>
          )
        : baseIcon;

    // leaf
    if (node.isLeaf) {
      return {
        key: node.key,
        label: node.label,
        icon,
      };
    }

    // group
    return {
      key: node.key,
      label: node.label,
      icon,
      children: (node.children ?? []).map((c: MenuNode) => toItem(c, depth + 1)),
    };
  };

  return tree.filter((node) => node.key !== 'HOME').map((n: MenuNode) => toItem(n));
};

const AppLayout = () => {
  const systemKey = useMenuStore((s) => s.systemKey);
  const menuTree = useMenuStore((s) => s.menuTree);
  const ensureDashboard = useMdiStore((s) => s.ensureDashboard);
  const openTab = useMdiStore((s) => s.openTab);
  const setActive = useMdiStore((s) => s.setActive);

  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [hoverPanelOpen, setHoverPanelOpen] = useState(false);
  const [hoverRootKey, setHoverRootKey] = useState<string | null>(null);

  const closeTimer = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleCloseHoverPanel = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setHoverPanelOpen(false);
      setHoverRootKey(null);
    }, 120);
  }, [clearCloseTimer]);

  const onRootEnter = useCallback(
    (rootKey: string) => {
      if (!siderCollapsed) return;
      clearCloseTimer();
      setHoverRootKey(rootKey);
      setHoverPanelOpen(true);
    },
    [clearCloseTimer, siderCollapsed],
  );

  const onRootLeave = useCallback(() => {
    if (!siderCollapsed) return;
    scheduleCloseHoverPanel();
  }, [scheduleCloseHoverPanel, siderCollapsed]);

  const onRootClick = useCallback(
    (_rootKey: string) => {
      if (!siderCollapsed) return;
      setSiderCollapsed(false);
      setHoverPanelOpen(false);
      setHoverRootKey(null);
    },
    [siderCollapsed],
  );

  // URL은 시스템 prefix로 고정(예: /spp, /etc)
  useEffect(() => {
    try {
      const nextPath = `/${systemKey}`;
      if (window.location.pathname !== nextPath) {
        window.history.replaceState(null, '', nextPath);
      }
    } catch {
      // ignore
    }
  }, [systemKey]);

  // 처음 접속 시 기본 대시보드 탭 오픈
  useEffect(() => {
    ensureDashboard();
  }, [ensureDashboard]);

  const items = useMemo<NonNullable<MenuProps['items']>>(() => {
    // eslint-disable-next-line react-hooks/refs
    return buildMenuItems(menuTree, {
      siderCollapsed,
      onRootEnter,
      onRootLeave,
      onRootClick,
    });
  }, [menuTree, onRootClick, onRootEnter, onRootLeave, siderCollapsed]);

  const hoverItems = useMemo<NonNullable<MenuProps['items']>>(() => {
    if (!hoverRootKey) return [];
    const root = menuTree.find((n) => n.key === hoverRootKey);
    if (!root || !root.children || root.children.length === 0) return [];
    // hover 패널에서는 icon hover wrapper가 필요없음
    return buildMenuItems(root.children);
  }, [hoverRootKey, menuTree]);

  const defaultOpenKeys = useMemo(() => {
    return menuTree.filter((n) => n.key !== 'HOME').map((n) => n.key);
  }, [menuTree]);

  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);

  // 시스템/메뉴 트리가 바뀌면 좌측 그룹 오픈 상태도 초기화
  useEffect(() => {
    setOpenKeys(defaultOpenKeys);
  }, [defaultOpenKeys]);

  const labelMap = useMemo(() => {
    const m = new Map<string, string>();

    const walk = (nodes: MenuNode[]) => {
      for (const n of nodes) {
        m.set(n.key, n.label);
        if (n.children && n.children.length > 0) walk(n.children);
      }
    };

    walk(menuTree);
    return m;
  }, [menuTree]);

  const onClick: MenuProps['onClick'] = (info) => {
    const key = String(info.key);
    const label = labelMap.get(key) || key;

    openTab({ key, title: label });

    // 접힌 상태에서 hover 패널로 누른 경우 닫아주기
    if (siderCollapsed) {
      // 클릭 시 좌측 메뉴를 다시 펼친 상태로 전환
      setSiderCollapsed(false);
      setHoverPanelOpen(false);
    }
  };



  return (
    <Layout style={{ height: '100vh' }}>
      <Header className={'header_wrap'} style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
        <Typography.Title
          level={5}
          style={{ margin: 0, color: '#fff', cursor: 'pointer' }}
          onClick={() => {
            ensureDashboard();
            setActive(DEFAULT_SCREEN_KEY);
          }}
        >
          GNB
        </Typography.Title>
      </Header>

      <Layout>
        <Sider
          width={SIDEBAR_WIDTH}
          collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
          collapsed={siderCollapsed}
          trigger={null}
          style={{
            background: '#fff',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            position: 'relative',
          }}
        >
          {/* 접기 버튼: 메뉴가 펼쳐져 있을 때만 보이고, 우측 라인 끝(중앙)에 붙임 */}
          {!siderCollapsed && (
            <Button
              size="small"
              type="primary"
              icon={<MenuFoldOutlined />}
              onClick={() => {
                setSiderCollapsed(true);
                setHoverPanelOpen(false);
              }}
              style={{
                position: 'absolute',
                top: '10%',
                right: -12,
                transform: 'translateY(-50%)',
                zIndex: 10,
                borderRadius: '0 8px 8px 0',
                paddingInline: 6,
              }}
            />
          )}

          <Menu
            mode="inline"
            items={items}
            onClick={onClick}
            openKeys={siderCollapsed ? [] : openKeys}
            onOpenChange={(keys) => setOpenKeys(keys as string[])}
            inlineCollapsed={siderCollapsed}
            style={{ height: '100%' }}
          />
        </Sider>

        {/* 접힌 상태에서 마우스 오버 시 메뉴 목록 패널 */}
		{siderCollapsed && hoverPanelOpen && hoverRootKey && hoverItems.length > 0 && (
          <div
            onMouseEnter={() => clearCloseTimer()}
            onMouseLeave={() => scheduleCloseHoverPanel()}
            style={{
              position: 'fixed',
              top: HEADER_HEIGHT,
              left: SIDEBAR_COLLAPSED_WIDTH,
              height: `calc(100vh - ${HEADER_HEIGHT}px)`,
              width: SIDEBAR_WIDTH,
              background: '#fff',
              borderRight: '1px solid rgba(0,0,0,0.10)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
              zIndex: 2000,
              overflow: 'auto',
            }}
          >
			<Menu
			  mode="inline"
			  items={hoverItems}
              onClick={onClick}
              openKeys={openKeys}
              onOpenChange={(keys) => setOpenKeys(keys as string[])}
              style={{ height: '100%' }}
            />
          </div>
        )}

        <Layout>
          <MDITabs />
          <Content style={{ padding: 16, overflow: 'auto' }}>
            <PageHost />
          </Content>
          <Footer style={{ textAlign: 'center' }}>Footer</Footer>
        </Layout>
      </Layout>

      {/* 오른쪽 시스템 링크 토글 */}
      <SystemLinks />
    </Layout>
  );
};

export default AppLayout;
