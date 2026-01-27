import { AppstoreOutlined, FileTextOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Typography } from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { MenuNode } from '@/config/mockMenuConfig';
import { DEFAULT_SCREEN_KEY } from '@/config/mockMenuConfig';
import MDITabs from '@/layout/MdiTabs';
import PageHost from '@/layout/PageHost';
import SystemLinks from '@/layout/SystemLinks';
import { useMdiStore } from '@/store/mdi.store';
import { useMenuStore } from '@/store/menu.store';
import { Footer } from 'antd/es/layout/layout';

const { Header, Sider, Content } = Layout;

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 56;
const ICON_AREA_WIDTH = SIDEBAR_COLLAPSED_WIDTH;

// ===== 정렬용 상수 (여기만 미세조정하면 됨) =====
const SIDER_TOP_PADDING = 8; // 메뉴 시작 상단 여백
const MENU_ROW_HEIGHT = 40; // 1레벨 메뉴 버튼 높이
const FOLD_BTN_HEIGHT = 24; // small 버튼 체감 높이(대충 24)
const FOLD_BTN_RIGHT = 8;

// 첫 번째 메뉴 라인(세로 중앙)에 접기 버튼을 맞춤
const FOLD_BTN_TOP = SIDER_TOP_PADDING + (MENU_ROW_HEIGHT - FOLD_BTN_HEIGHT) / 2; // = 8 + 8 = 16
// =================================================

// ✅ 플로팅 패널 타이틀 영역 높이
const FLOATING_TITLE_HEIGHT = 44;

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

  // 좌측은 항상 아이콘 바(고정) + 플로팅 메뉴(click)
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [floatingRootKey, setFloatingRootKey] = useState<string | null>(null);

  // 좌측 1뎁스는 기본적으로 펼침(아이콘 + 메뉴명)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const closeFloating = () => setFloatingOpen(false);

  const siderRef = useRef<HTMLDivElement | null>(null);

  // 바깥 클릭 시 플로팅 닫기
  useEffect(() => {
    if (!floatingOpen) return;

    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (siderRef.current && siderRef.current.contains(target)) return;
      setFloatingOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [floatingOpen]);

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

  const floatingTitle = useMemo(() => {
    if (!floatingRootKey) return '';
    const root = topMenus.find((m) => m.key === floatingRootKey);
    return root?.label ?? '';
  }, [floatingRootKey, topMenus]);

  const onClick: MenuProps['onClick'] = (info) => {
    const key = String(info.key);
    const label = labelMap.get(key) || key;

    openTab({ key, title: label });

    closeFloating();
  };

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

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
          width={sidebarWidth}
          collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
          collapsed={sidebarCollapsed}
          trigger={null}
          style={{
            background: '#fff',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            ref={siderRef}
            style={{
              paddingTop: SIDER_TOP_PADDING,
              height: '100%',
              position: 'relative',
            }}
          >
            {/* ✅ 접기 버튼: 레이아웃에서 빼고(absolute), Samples 첫 줄과 거의 동일선상 */}
            {!sidebarCollapsed && !floatingOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: FOLD_BTN_TOP,
                  right: FOLD_BTN_RIGHT,
                  zIndex: 20,
                }}
              >
                <Button
                  size="small"
                  icon={<MenuFoldOutlined />}
                  onClick={() => {
                    setSidebarCollapsed(true);
                    closeFloating();
                  }}
                  style={{
                    height: FOLD_BTN_HEIGHT,
                    width: 32,
                    padding: 0,
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {topMenus.map((m) => {
                const iconNode = m.isLeaf ? <FileTextOutlined /> : <AppstoreOutlined />;
                return (
                  <Button
                    key={m.key}
                    className="sider-topmenu-btn"
                    type="text"
                    onClick={() => {
                      // 접힌 상태에서는 아이콘 클릭 시 펼쳐지도록
                      if (sidebarCollapsed) setSidebarCollapsed(false);

                      if (m.isLeaf) {
                        openTab({ key: m.key, title: m.label });
                        closeFloating();
                        return;
                      }

                      setFloatingRootKey(m.key);
                      setFloatingOpen((prev) => {
                        if (floatingRootKey === m.key) return !prev;
                        return true;
                      });
                    }}
                    style={{
                      width: '100%',
                      padding: 0,
                      height: MENU_ROW_HEIGHT,
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      paddingRight: 44, // ✅ 우측 접기 버튼 겹침 방지(라벨이 길 때)
                    }}
                  >
                    <span
                      style={{
                        width: ICON_AREA_WIDTH,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingLeft: 12,
                        flexShrink: 0,
                      }}
                    >
                      {iconNode}
                    </span>
                    {!sidebarCollapsed && (
                      <span
                        style={{
                          display: 'inline-block',
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {m.label}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* 플로팅 메뉴 (컨텐츠 영역을 밀지 않도록 Sider 내부에서만 표시) */}
            {floatingOpen && floatingItems.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: ICON_AREA_WIDTH,
                  right: 0,
                  bottom: 0,
                  background: '#fff',
                  borderLeft: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '6px 0 20px rgba(0,0,0,0.12)',
                  zIndex: 10,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    height: FLOATING_TITLE_HEIGHT,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 12px',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    background: '#fff',
                  }}
                >
                  <Typography.Text
                    style={{
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {floatingTitle}
                  </Typography.Text>
                </div>

                <div style={{ flex: 1, overflow: 'auto' }}>
                  <Menu
                    mode="inline"
                    items={floatingItems}
                    onClick={onClick}
                    openKeys={openKeys}
                    onOpenChange={(keys) => setOpenKeys(keys as string[])}
                    style={{ height: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>
        </Sider>

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
