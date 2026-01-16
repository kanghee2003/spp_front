import { CloseOutlined } from '@ant-design/icons';
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

  return (
    <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
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

      {tabs.length === 0 && <div style={{ opacity: 0.65, fontSize: 12, padding: '4px 0' }}>메뉴를 클릭하면 탭이 열립니다.</div>}
    </div>
  );
};

export default MDITabs;
