// src/pages/spp/view/MenuManagement.tsx
import type React from 'react';
import { useMemo, useState } from 'react';
import { Button, Card, Checkbox, Col, Drawer, Row, Space, Statistic, Tag, Typography } from 'antd';
import ResizeObserver from 'rc-resize-observer';
import { Responsive as ResponsiveRgl } from 'react-grid-layout';
import { Area, Column } from '@ant-design/plots';

const { Text } = Typography;

type WidgetId = 'kpi' | 'salesTrend' | 'deptTop' | 'alerts' | 'tasks' | 'health';

type WidgetDef = {
  id: WidgetId;
  title: string;
  content: React.ReactNode;
};

type RglItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
};

type RglLayout = RglItem[];
type RglLayouts = Partial<Record<string, RglLayout>>;

const STORAGE_LAYOUTS_KEY = 'spp.dashboard.layouts.v7';
const STORAGE_VISIBLE_KEY = 'spp.dashboard.visibleWidgets.v7';

function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function saveJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function makeDefaultVisible(): WidgetId[] {
  return ['kpi', 'health', 'salesTrend', 'deptTop', 'alerts', 'tasks'];
}

function makeDefaultLayouts(): RglLayouts {
  const lg: RglLayout = [
    { i: 'kpi', x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3 },
    { i: 'health', x: 6, y: 0, w: 6, h: 4, minW: 4, minH: 3 },

    { i: 'salesTrend', x: 0, y: 4, w: 8, h: 6, minW: 5, minH: 4 },
    { i: 'deptTop', x: 8, y: 4, w: 4, h: 6, minW: 3, minH: 4 },

    { i: 'alerts', x: 0, y: 10, w: 6, h: 5, minW: 4, minH: 3 },
    { i: 'tasks', x: 6, y: 10, w: 6, h: 5, minW: 4, minH: 3 },
  ];

  const md: RglLayout = [
    { i: 'kpi', x: 0, y: 0, w: 10, h: 4 },
    { i: 'health', x: 0, y: 4, w: 10, h: 4 },
    { i: 'salesTrend', x: 0, y: 8, w: 10, h: 6 },
    { i: 'deptTop', x: 0, y: 14, w: 10, h: 6 },
    { i: 'alerts', x: 0, y: 20, w: 10, h: 5 },
    { i: 'tasks', x: 0, y: 25, w: 10, h: 5 },
  ];

  const sm: RglLayout = md.map((it) => ({ ...it, w: 6, x: 0 }));
  const xs: RglLayout = md.map((it) => ({ ...it, w: 4, x: 0 }));

  return { lg, md, sm, xs };
}

function clampLayoutsToVisible(all: RglLayouts, visible: Set<string>): RglLayouts {
  const next: RglLayouts = {};
  for (const bp of Object.keys(all)) {
    const arr = all[bp];
    if (!arr) continue;
    next[bp] = arr.filter((it) => visible.has(it.i));
  }
  return next;
}

function ensureLayoutsContainVisible(all: RglLayouts, visible: WidgetId[]): RglLayouts {
  const base = makeDefaultLayouts();
  const visibleSet = new Set<string>(visible);

  const pick = (bp: string): RglLayout => {
    const cur = all[bp] ?? [];
    const curIds = new Set(cur.map((it) => it.i));

    const merged: RglLayout = [...cur];
    for (const id of visible) {
      if (curIds.has(id)) continue;
      const fallback = (base[bp] ?? []).find((it) => it.i === id);
      if (fallback) merged.push({ ...fallback });
    }

    return merged.filter((it) => visibleSet.has(it.i));
  };

  return { lg: pick('lg'), md: pick('md'), sm: pick('sm'), xs: pick('xs') };
}

function WidgetCard(props: { title: string; onClose?: () => void; children: React.ReactNode }) {
  return (
    <Card
      size="small"
      styles={{ body: { padding: 12, height: '100%' } }}
      title={
        <div className="widget-drag-handle" style={{ cursor: 'move', userSelect: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700 }}>{props.title}</span>
          <Text type="secondary" style={{ fontSize: 12 }}>
            drag
          </Text>
        </div>
      }
      extra={
        props.onClose ? (
          <Button
            size="small"
            type="text"
            onClick={(e) => {
              e.stopPropagation();
              props.onClose?.();
            }}
          >
            ✕
          </Button>
        ) : null
      }
      style={{ height: '100%', borderRadius: 12 }}
    >
      {props.children}
    </Card>
  );
}

const Responsive = ResponsiveRgl as unknown as React.ComponentType<any>;

export default function MenuManagement() {
  const [gridWidth, setGridWidth] = useState(1200);

  const [visibleIds, setVisibleIds] = useState<WidgetId[]>(() => {
    return loadJson<WidgetId[]>(STORAGE_VISIBLE_KEY) ?? makeDefaultVisible();
  });

  const [layouts, setLayouts] = useState<RglLayouts>(() => {
    const savedLayouts = loadJson<RglLayouts>(STORAGE_LAYOUTS_KEY);
    const savedVisible = loadJson<WidgetId[]>(STORAGE_VISIBLE_KEY) ?? makeDefaultVisible();
    const initial = savedLayouts ?? makeDefaultLayouts();
    return ensureLayoutsContainVisible(initial, savedVisible);
  });

  const visibleSet = useMemo(() => new Set<string>(visibleIds), [visibleIds]);

  const [addOpen, setAddOpen] = useState(false);
  const [addChecked, setAddChecked] = useState<WidgetId[]>([]);

  const salesTrendData = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        month: `${i + 1}월`,
        value: 80 + ((i * 17) % 90),
      })),
    [],
  );

  const deptTopData = useMemo(
    () => [
      { dept: '보안', value: 42 },
      { dept: '인사', value: 28 },
      { dept: '영업', value: 63 },
      { dept: '개발', value: 77 },
      { dept: '운영', value: 51 },
    ],
    [],
  );

  const areaConfig = useMemo(
    () => ({
      data: salesTrendData,
      xField: 'month',
      yField: 'value',
      smooth: true,
      height: 240,
      autoFit: true,
      xAxis: { tickCount: 6 },
      tooltip: { showMarkers: true },
    }),
    [salesTrendData],
  );

  const columnConfig = useMemo(
    () => ({
      data: deptTopData,
      xField: 'dept',
      yField: 'value',
      height: 240,
      autoFit: true,
      xAxis: { label: { autoHide: true } },
      tooltip: {},
    }),
    [deptTopData],
  );

  const widgetsAll: WidgetDef[] = useMemo(
    () => [
      {
        id: 'kpi',
        title: 'KPI',
        content: (
          <Row gutter={[12, 12]}>
            <Col span={12}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="오늘 접속" value={1287} />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="승인 대기" value={42} />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="경고" value={7} />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="정상율" value={99.2} suffix="%" precision={1} />
              </Card>
            </Col>
          </Row>
        ),
      },
      {
        id: 'health',
        title: '시스템 상태',
        content: (
          <Row gutter={[12, 12]}>
            <Col span={8}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="CPU" value={23} suffix="%" />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="MEM" value={61} suffix="%" />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="LATENCY" value={183} suffix="ms" />
              </Card>
            </Col>

            <Col span={24}>
              <div
                style={{
                  height: 72,
                  borderRadius: 12,
                  border: '1px dashed rgba(0,0,0,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 12px',
                }}
              >
                <Text>최근 점검: 2026-02-10 09:30</Text>
                <Space size={6}>
                  <Tag>WAS#1</Tag>
                  <Tag>WAS#2</Tag>
                  <Tag>GW</Tag>
                </Space>
              </div>
            </Col>
          </Row>
        ),
      },
      { id: 'salesTrend', title: '트래픽 추이', content: <Area {...areaConfig} /> },
      { id: 'deptTop', title: '부서별 Top', content: <Column {...columnConfig} /> },
      {
        id: 'alerts',
        title: '알림',
        content: (
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              { t: '권한 변경 요청', s: '대기', tag: 'orange' as const },
              { t: '정책 업데이트', s: '완료', tag: 'green' as const },
              { t: '로그인 실패 증가', s: '주의', tag: 'red' as const },
              { t: '메뉴 동기화', s: '진행', tag: 'blue' as const },
            ].map((it, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: 12,
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text>{it.t}</Text>
                <Tag color={it.tag}>{it.s}</Tag>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: 'tasks',
        title: '할 일',
        content: (
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              { t: '사용자 동기화 배치 확인', due: '오늘' },
              { t: '권한 매핑 검증', due: '내일' },
              { t: '메뉴 변경 diff 저장 점검', due: '이번주' },
              { t: '감사 로그 필터 추가', due: '이번주' },
            ].map((it, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 12,
                  padding: '10px 12px',
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Text>{it.t}</Text>
                <Text type="secondary">{it.due}</Text>
              </div>
            ))}
          </div>
        ),
      },
    ],
    [areaConfig, columnConfig],
  );

  const allIds = useMemo(() => widgetsAll.map((w) => w.id), [widgetsAll]);
  const hiddenIds = useMemo(() => allIds.filter((id) => !visibleSet.has(id)), [allIds, visibleSet]);
  const widgetsVisible = useMemo(() => widgetsAll.filter((w) => visibleSet.has(w.id)), [widgetsAll, visibleSet]);

  const persist = (nextVisible: WidgetId[], nextLayouts: RglLayouts) => {
    saveJson(STORAGE_VISIBLE_KEY, nextVisible);
    saveJson(STORAGE_LAYOUTS_KEY, nextLayouts);
  };

  const onLayoutChange = (_layout: any, all: any) => {
    const nextAll = clampLayoutsToVisible(all as RglLayouts, visibleSet);
    setLayouts(nextAll);
    saveJson(STORAGE_LAYOUTS_KEY, nextAll);
  };

  const removeWidget = (id: WidgetId) => {
    const nextVisible = visibleIds.filter((v) => v !== id);
    const nextLayouts = clampLayoutsToVisible(layouts, new Set<string>(nextVisible));
    setVisibleIds(nextVisible);
    setLayouts(nextLayouts);
    persist(nextVisible, nextLayouts);
  };

  const openAdd = () => {
    setAddChecked(hiddenIds);
    setAddOpen(true);
  };

  const applyAdd = () => {
    const toAdd = addChecked;
    const nextVisible = Array.from(new Set<WidgetId>([...visibleIds, ...toAdd]));
    const nextLayouts = ensureLayoutsContainVisible(layouts, nextVisible);
    setVisibleIds(nextVisible);
    setLayouts(nextLayouts);
    persist(nextVisible, nextLayouts);
    setAddOpen(false);
  };

  const reset = () => {
    const nextVisible = makeDefaultVisible();
    const nextLayouts = makeDefaultLayouts();
    setVisibleIds(nextVisible);
    setLayouts(nextLayouts);
    persist(nextVisible, nextLayouts);
  };

  return (
    <div style={{ padding: 12 }}>
      <Space style={{ marginBottom: 12 }}>
        <Button onClick={reset}>초기화</Button>
        <Button onClick={openAdd} disabled={hiddenIds.length === 0}>
          위젯 추가
        </Button>
        <Text type="secondary">X로 삭제 / “위젯 추가”로 복구 / 드래그 재배치 / 리사이즈</Text>
      </Space>

      <ResizeObserver onResize={({ width }) => width && setGridWidth(Math.floor(width))}>
        <div>
          <Responsive
            width={gridWidth}
            layouts={layouts}
            onLayoutChange={onLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
            rowHeight={32}
            margin={[12, 12]}
            containerPadding={[0, 0]}
            compactType="vertical"
            preventCollision={false}
            isBounded={true}
            draggableHandle=".widget-drag-handle"
            resizeHandles={['se']}
            useCSSTransforms={true}
          >
            {widgetsVisible.map((w) => (
              <div key={w.id} style={{ overflow: 'hidden' }}>
                <WidgetCard title={w.title} onClose={() => removeWidget(w.id)}>
                  {w.content}
                </WidgetCard>
              </div>
            ))}
          </Responsive>
        </div>
      </ResizeObserver>

      <Drawer
        title="위젯 추가"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        width={360}
        destroyOnClose
        footer={
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setAddOpen(false)}>닫기</Button>
            <Button type="primary" onClick={applyAdd} disabled={addChecked.length === 0}>
              추가
            </Button>
          </Space>
        }
      >
        {hiddenIds.length === 0 ? (
          <Text type="secondary">추가할 위젯이 없습니다.</Text>
        ) : (
          <Checkbox.Group
            style={{ width: '100%', display: 'grid', gap: 8 }}
            value={addChecked}
            onChange={(v) => setAddChecked(v as WidgetId[])}
            options={hiddenIds.map((id) => {
              const w = widgetsAll.find((x) => x.id === id);
              return { label: w?.title ?? id, value: id };
            })}
          />
        )}
      </Drawer>
    </div>
  );
}
