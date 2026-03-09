import { Button, Space } from 'antd';

export type ServerFile = {
  fileId: string;
  fileNm: string;
  fileSize?: number;
};

export interface SppAttachmentListProps {
  items: ServerFile[];

  deleteFileIds: string[];
  onToggleDelete: (fileId: string) => void;

  onDownload: (file: ServerFile) => void;
}

const SppAttachmentList = (props: SppAttachmentListProps) => {
  const { items, deleteFileIds, onToggleDelete, onDownload } = props;

  if (items.length === 0) {
    return <div style={{ opacity: 0.7 }}>첨부파일 없음</div>;
  }

  return (
    <div>
      {items.map((f) => {
        const deleted = deleteFileIds.includes(f.fileId);

        return (
          <div
            key={f.fileId}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
              opacity: deleted ? 0.6 : 1,
            }}
          >
            <Space size={6}>
              <Button type="link" disabled={deleted} onClick={() => onDownload(f)} style={{ padding: 0 }}>
                {f.fileNm}
              </Button>
              {deleted && <span>(삭제 예정)</span>}
            </Space>

            <Button size="small" onClick={() => onToggleDelete(f.fileId)}>
              {deleted ? '삭제취소' : '삭제'}
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default SppAttachmentList;
