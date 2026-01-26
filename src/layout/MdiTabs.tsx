import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { useMemo } from 'react';
import { useMdiStore } from '@/store/mdi.store';
import { DEFAULT_SCREEN_KEY } from '@/config/mockMenuConfig';

const MDITabs = () => {
  const tabs = useMdiStore((s) => s.tabs);
  const activeKey = useMdiStore((s) => s.activeKey);
  const setActive = useMdiStore((s) => s.setActive);
  const closeTab = useMdiStore((s) => s.closeTab);
  const reorder = useMdiStore((s) => s.reorder);

  const droppableId = useMemo(() => 'mdi-tabs', []);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorder(result.source.index, result.destination.index);
  };

  const activeIndex = tabs.findIndex((t) => t.key === activeKey);
  const canGoLeft = activeIndex > 0;
  const canGoRight = activeIndex >= 0 && activeIndex < tabs.length - 1;

  const goLeft = () => {
    if (!canGoLeft) return;
    setActive(tabs[activeIndex - 1].key);
  };

  const goRight = () => {
    if (!canGoRight) return;
    setActive(tabs[activeIndex + 1].key);
  };

  return (
    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={droppableId} direction="horizontal">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {tabs.map((t, idx) => (
                    <Draggable key={t.key} draggableId={t.key} index={idx} isDragDisabled={t.key === DEFAULT_SCREEN_KEY}>
                      {(p, snap) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          {...p.dragHandleProps}
                          className={'mdi-tab' + (t.key === activeKey ? ' active' : '') + (snap.isDragging ? ' dragging' : '')}
                          onClick={() => setActive(t.key)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setActive(t.key);
                          }}
                        >
                          <span className="title">{t.title}</span>
                          {t.key !== DEFAULT_SCREEN_KEY && (
                            <span
                              className="close"
                              onClick={(e) => {
                                e.stopPropagation();
                                closeTab(t.key);
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.stopPropagation();
                                  closeTab(t.key);
                                }
                              }}
                              aria-label="close tab"
                            >
                              <CloseOutlined style={{ fontSize: 12 }} />
                            </span>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <span
            style={{
              width: 28,
              height: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              border: '1px solid rgba(0, 0, 0, 0.12)',
              background: 'white',
              cursor: canGoLeft ? 'pointer' : 'not-allowed',
              opacity: canGoLeft ? 1 : 0.45,
              userSelect: 'none',
            }}
            role="button"
            tabIndex={0}
            aria-disabled={!canGoLeft}
            aria-label="go left tab"
            onClick={() => goLeft()}
            onKeyDown={(e) => {
              if (!canGoLeft) return;
              if (e.key === 'Enter' || e.key === ' ') goLeft();
            }}
          >
            <LeftOutlined style={{ fontSize: 12 }} />
          </span>
          <span
            style={{
              width: 28,
              height: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              border: '1px solid rgba(0, 0, 0, 0.12)',
              background: 'white',
              cursor: canGoRight ? 'pointer' : 'not-allowed',
              opacity: canGoRight ? 1 : 0.45,
              userSelect: 'none',
            }}
            role="button"
            tabIndex={0}
            aria-disabled={!canGoRight}
            aria-label="go right tab"
            onClick={() => goRight()}
            onKeyDown={(e) => {
              if (!canGoRight) return;
              if (e.key === 'Enter' || e.key === ' ') goRight();
            }}
          >
            <RightOutlined style={{ fontSize: 12 }} />
          </span>
        </div>
      </div>

      {tabs.length === 0 && <div style={{ opacity: 0.65, fontSize: 12, padding: '4px 0' }}>메뉴를 클릭하면 탭이 열립니다.</div>}
    </div>
  );
};

export default MDITabs;
