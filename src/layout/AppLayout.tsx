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

const buildMenuItems = (tree: MenuNode[]): NonNullable<MenuProps['items']> => {
  const toItem = (node: MenuNode): NonNullable<MenuProps['items']>[number] => {
    const icon = node.isLeaf ? <FileTextOutlined /> : <AppstoreOutlined />;

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
      children: (node.children ?? []).map((c: MenuNode) => toItem(c)),
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

  const topMenus = useMemo(() => {
    return menuTree.filter((n) => n.key !== 'HOME');
  }, [menuTree]);

  // 좌측은 항상 아이콘 바(고정) + 플로팅 메뉴(hover/click)
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [floatingPinned, setFloatingPinned] = useState(false);
  const [floatingRootKey, setFloatingRootKey] = useState<string | null>(null);

  const pinnedRef = useRef(false);
  useEffect(() => {
    pinnedRef.current = floatingPinned;
  }, [floatingPinned]);

  // 메뉴 트리가 바뀌면 기본 루트도 첫 번째 1뎁스로 맞춤
  useEffect(() => {
    if (!floatingRootKey && topMenus.length > 0) {
      setFloatingRootKey(topMenus[0].key);
      return;
    }

    if (floatingRootKey) {
      const exists = topMenus.some((m) => m.key === floatingRootKey);
      if (!exists) {
        setFloatingRootKey(topMenus.length > 0 ? topMenus[0].key : null);
      }
    }
  }, [floatingRootKey, topMenus]);

  const closeTimer = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const scheduleCloseFloating = useCallback(() => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      if (pinnedRef.current) return;
      setFloatingOpen(false);
    }, 120);
  }, [clearCloseTimer]);

  const openFloating = useCallback(() => {
    clearCloseTimer();
    setFloatingOpen(true);
  }, [clearCloseTimer]);

  const closeFloating = useCallback(() => {
    clearCloseTimer();
    setFloatingOpen(false);
    setFloatingPinned(false);
  }, [clearCloseTimer]);

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
    return buildMenuItems(menuTree);
  }, [menuTree]);

  const floatingItems = useMemo<NonNullable<MenuProps['items']>>(() => {
    if (!floatingRootKey) return [];

    const root = (items ?? []).find((it) => String(it?.key) === floatingRootKey) as any;
    if (!root) return [];

    // 1뎁스가 그룹이면 children만 보여주기(스크린샷 2처럼)
    if (Array.isArray(root.children) && root.children.length > 0) {
      return root.children as NonNullable<MenuProps['items']>;
    }

    // 1뎁스가 leaf인 경우는 단일 항목만
    return [root] as NonNullable<MenuProps['items']>;
  }, [floatingRootKey, items]);

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

    // leaf 클릭하면 플로팅은 계속 열린 상태 유지(고정)
    clearCloseTimer();
    setFloatingPinned(true);
    setFloatingOpen(true);
  };

  const onHoverTopMenu = useCallback(
    (node: MenuNode) => {
      if (floatingPinned) return;
      setFloatingRootKey(node.key);
      openFloating();
    },
    [floatingPinned, openFloating]
  );

  const onClickTopMenu = useCallback(
    (node: MenuNode) => {
      clearCloseTimer();

      // 같은 루트가 이미 고정되어 있으면 토글로 닫기
      if (floatingOpen && floatingPinned && floatingRootKey === node.key) {
        closeFloating();
        return;
      }

      setFloatingRootKey(node.key);
      setFloatingOpen(true);
      setFloatingPinned(true);

      // 1뎁스가 leaf면 탭 오픈까지
      if (node.isLeaf) {
        const label = labelMap.get(node.key) || node.label || node.key;
        openTab({ key: node.key, title: label });
      }
    },
    [clearCloseTimer, closeFloating, floatingOpen, floatingPinned, floatingRootKey, labelMap, openTab]
  );

  const onTopIconEnter = useCallback(
    (rootKey: string) => {
      if (floatingPinned) return;
      setFloatingRootKey(rootKey);
      openFloating();
    },
    [floatingPinned, openFloating],
  );

  const onTopIconLeave = useCallback(() => {
    if (floatingPinned) return;
    scheduleCloseFloating();
  }, [floatingPinned, scheduleCloseFloating]);

  const onTopIconClick = useCallback(
    (rootKey: string) => {
      clearCloseTimer();

      if (floatingOpen && floatingPinned && floatingRootKey === rootKey) {
        closeFloating();
        return;
      }

      setFloatingRootKey(rootKey);
      setFloatingOpen(true);
      setFloatingPinned(true);

      const root = topMenus.find((m) => m.key === rootKey);
      if (root?.isLeaf) {
        const label = labelMap.get(rootKey) || rootKey;
        openTab({ key: rootKey, title: label });
      }
    },
    [
      clearCloseTimer,
      closeFloating,
      floatingOpen,
      floatingPinned,
      floatingRootKey,
      labelMap,
      openTab,
      topMenus,
    ],
  );



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
        {/* 1) 고정 아이콘 바 */}
        <Sider
          width={SIDEBAR_COLLAPSED_WIDTH}
          collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
          collapsed
          trigger={null}
          style={{
            background: '#fff',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            position: 'relative',
          }}
        >
          <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {topMenus.map((m) => {
              const active = floatingRootKey === m.key;

              return (
                <Button
                  key={m.key}
                  type={floatingPinned && active ? 'primary' : 'default'}
                  icon={m.isLeaf ? <FileTextOutlined /> : <AppstoreOutlined />}
                  onMouseEnter={() => {
                    // 1뎁스 아이콘 위에 갔을 때만 플로팅 오픈
                    if (floatingPinned) return;
                    setFloatingRootKey(m.key);
                    openFloating();
                  }}
                  onMouseLeave={() => {
                    if (floatingPinned) return;
                    scheduleCloseFloating();
                  }}
                  onClick={() => {
                    clearCloseTimer();

                    if (floatingOpen && floatingPinned && floatingRootKey === m.key) {
                      closeFloating();
                      return;
                    }

                    setFloatingRootKey(m.key);
                    setFloatingPinned(true);
                    setFloatingOpen(true);

                    // 1뎁스가 leaf면 바로 탭 오픈
                    if (m.isLeaf) {
                      openTab({ key: m.key, title: m.label });
                    }
                  }}
                  style={{ width: '100%' }}
                />
              );
            })}
          </div>
        </Sider>

        {/* 2) 플로팅 메뉴 */}
        {floatingOpen && floatingItems.length > 0 && (
          <>
            <div
              onMouseEnter={() => {
                if (floatingPinned) return;
                openFloating();
              }}
              onMouseLeave={() => {
                if (floatingPinned) return;
                scheduleCloseFloating();
              }}
              style={{
                position: 'fixed',
                top: HEADER_HEIGHT,
                left: SIDEBAR_COLLAPSED_WIDTH,
                height: `calc(100vh - ${HEADER_HEIGHT}px)`,
                width: SIDEBAR_WIDTH,
                background: '#fff',
                borderRight: floatingPinned ? '1px solid rgba(22,119,255,0.35)' : '1px solid rgba(0,0,0,0.10)',
                boxShadow: floatingPinned
                  ? '0 6px 20px rgba(0,0,0,0.12), 0 0 0 2px rgba(22,119,255,0.18)'
                  : '0 6px 20px rgba(0,0,0,0.12)',
                zIndex: 2000,
                overflow: 'auto',
              }}
            >
              <Menu
                mode="inline"
                items={floatingItems}
                onClick={onClick}
                openKeys={openKeys}
                onOpenChange={(keys) => setOpenKeys(keys as string[])}
                style={{ height: '100%' }}
              />
            </div>

            {/* 3) 플로팅 오른쪽 경계에 붙는 닫기 패널(플로팅 오픈시에만 노출) */}
            <Button
              size="small"
              type="primary"
              icon={<MenuFoldOutlined />}
              onClick={() => closeFloating()}
              style={{
                position: 'fixed',
                top: HEADER_HEIGHT + 12,
                left: SIDEBAR_COLLAPSED_WIDTH + SIDEBAR_WIDTH - 12,
                zIndex: 2100,
                borderRadius: '0 8px 8px 0',
                paddingInline: 6,
              }}
            />
          </>
        )}

        <Layout style={{ marginLeft: floatingOpen ? SIDEBAR_WIDTH : 0, transition: 'margin-left 0.2s ease' }}>
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
