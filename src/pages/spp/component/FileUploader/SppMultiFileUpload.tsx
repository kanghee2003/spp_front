import { InboxOutlined } from '@ant-design/icons';
import { Button, Upload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import { useMemo } from 'react';

const { Dragger } = Upload;

export type ServerFile = {
  fileId: string;
  fileNm: string;
  fileSize?: number;
};

export interface SppMultiFileUploadProps extends Omit<UploadProps, 'beforeUpload' | 'customRequest' | 'action' | 'fileList' | 'onChange' | 'showUploadList'> {
  serverFiles: ServerFile[];

  value: UploadFile[];
  onValueChange: (next: UploadFile[]) => void;

  deleteFileIds: string[];
  onToggleDelete: (fileId: string) => void;

  onServerDownload: (fileId: string) => void;

  maxSizeMB?: number;
  maxCount?: number;
  hideDeletedServerFile?: boolean;
}

const formatSize = (size?: number) => {
  if (!size) return '';
  const kb = size / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
};

const SppMultiFileUpload = (props: SppMultiFileUploadProps) => {
  const {
    serverFiles,
    value,
    onValueChange,
    deleteFileIds,
    onToggleDelete,
    onServerDownload,
    maxSizeMB,
    maxCount,
    hideDeletedServerFile = false,
    disabled,
    ...rest
  } = props;

  const deletedSet = useMemo(() => new Set(deleteFileIds), [deleteFileIds]);

  const serverItems = useMemo(() => {
    return serverFiles
      .filter((f) => (hideDeletedServerFile ? !deletedSet.has(f.fileId) : true))
      .map((f) => ({
        kind: 'SERVER' as const,
        key: f.fileId,
        fileId: f.fileId,
        name: f.fileNm,
        size: f.fileSize,
        deleted: deletedSet.has(f.fileId),
      }));
  }, [serverFiles, hideDeletedServerFile, deletedSet]);

  const newItems = useMemo(() => {
    return value.map((f) => ({
      kind: 'NEW' as const,
      key: String(f.uid),
      uid: String(f.uid),
      name: f.name,
      size: f.size,
    }));
  }, [value]);

  const displayItems = useMemo(() => [...serverItems, ...newItems], [serverItems, newItems]);

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (maxCount !== undefined) {
      const remainServerCount = serverFiles.filter((sf) => !deletedSet.has(sf.fileId)).length;
      const total = remainServerCount + value.length + 1;
      if (total > maxCount) return Upload.LIST_IGNORE;
    }

    if (maxSizeMB !== undefined) {
      const sizeMB = file.size / 1024 / 1024;
      if (sizeMB > maxSizeMB) return Upload.LIST_IGNORE;
    }

    return false;
  };

  const onChange: UploadProps['onChange'] = (info) => {
    const next = info.fileList.map((f) => {
      const uid = f.uid && String(f.uid).length > 0 ? String(f.uid) : crypto.randomUUID();
      return { ...f, uid };
    });

    // antd 내부에서 uid가 비어있거나 중복나는 케이스 방지
    const uniq = new Map<string, UploadFile>();
    next.forEach((f) => uniq.set(String(f.uid), f));

    onValueChange(Array.from(uniq.values()));
  };

  const removeNew = (uid: string) => {
    onValueChange(value.filter((f) => String(f.uid) !== uid));
  };

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <Dragger
        {...rest}
        disabled={disabled}
        beforeUpload={beforeUpload}
        onChange={onChange}
        fileList={value} // 신규만 Upload가 관리
        showUploadList={false} // 겹침 방지
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">파일을 드래그해서 놓거나 클릭해서 선택하세요</p>
        <p className="ant-upload-hint">저장된 파일: 다운로드/삭제예약, 신규 파일: 저장 시 업로드</p>
      </Dragger>

      <div>
        {displayItems.length === 0 ? (
          <div style={{ opacity: 0.7 }}>첨부파일 없음</div>
        ) : (
          displayItems.map((it) => {
            if (it.kind === 'SERVER') {
              return (
                <div
                  key={it.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    opacity: it.deleted ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button type="link" style={{ padding: 0 }} disabled={it.deleted} onClick={() => onServerDownload(it.fileId)}>
                      {it.name}
                    </Button>
                    {it.size ? <span style={{ opacity: 0.7 }}>{formatSize(it.size)}</span> : null}
                    {it.deleted ? <span>(삭제 예정)</span> : null}
                  </div>

                  <Button size="small" onClick={() => onToggleDelete(it.fileId)}>
                    {it.deleted ? '삭제취소' : '삭제'}
                  </Button>
                </div>
              );
            }

            return (
              <div
                key={it.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                }}
              >
                <div style={{ display: 'flex', gap: 8 }}>
                  <span>{it.name}</span>
                  {it.size ? <span style={{ opacity: 0.7 }}>{formatSize(it.size)}</span> : null}
                  <span style={{ opacity: 0.7 }}>(신규)</span>
                </div>

                <Button size="small" onClick={() => removeNew(it.uid)}>
                  제거
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SppMultiFileUpload;
