import { Button } from 'antd';
import type { UploadFile } from 'antd';
import React, { useState } from 'react';
import SppMultiFileUpload, { ServerFile } from '../../component/FileUploader/SppMultiFileUpload';

const toFiles = (list: UploadFile[]) => list.map((f) => f.originFileObj).filter(Boolean) as File[];

const MultiFileUploadSample = () => {
  // Mock: 저장된 파일(재조회 결과)
  const [serverFiles, setServerFiles] = useState<ServerFile[]>([
    { fileId: 'F001', fileNm: '사업계획서.pdf', fileSize: 1250000 },
    { fileId: 'F002', fileNm: '샘플이미지.png', fileSize: 550000 },
    { fileId: 'F003', fileNm: '테스트문서.docx', fileSize: 320000 },
  ]);

  // 신규 파일(저장 전)
  const [newFileList, setNewFileList] = useState<UploadFile[]>([]);

  // 삭제 예약(fileId)
  const [deleteFileIds, setDeleteFileIds] = useState<string[]>([]);

  const onToggleDelete = (fileId: string) => {
    setDeleteFileIds((prev) => (prev.includes(fileId) ? prev.filter((x) => x !== fileId) : [...prev, fileId]));
  };

  const onDownload = (fileId: string) => {
    // fileId 기반 개별 구현 (여기선 mock)
    console.log('download:', fileId);
    window.open(`/api/files/download?fileId=${encodeURIComponent(fileId)}`, '_blank', 'noopener,noreferrer');
  };

  const onSaveMock = async () => {
    const files = toFiles(newFileList);

    console.log('SAVE payload');
    console.log('  deleteFileIds:', deleteFileIds);
    console.log(
      '  newFiles:',
      files.map((f) => ({ name: f.name, size: f.size })),
    );

    // --- 저장 성공 가정 ---
    const savedNew = newFileList; // 저장 직전 신규 목록 백업
    const deletedSet = new Set(deleteFileIds);

    // 1) 신규/삭제예약 리셋
    setNewFileList([]);
    setDeleteFileIds([]);

    // 2) 재조회 Mock: (삭제 반영 + 신규가 서버파일로 편입)
    setServerFiles((prev) => {
      const remained = prev.filter((f) => !deletedSet.has(f.fileId));
      const appended = savedNew.map((f, idx) => ({
        fileId: `N${Date.now()}_${idx}`,
        fileNm: f.name,
        fileSize: f.size,
      }));
      return [...remained, ...appended];
    });
  };

  const onReloadMock = async () => {
    // 실제로는 재조회 API 호출
    console.log('RELOAD (mock)');
    setServerFiles((prev) => [...prev]);
  };

  return (
    <div style={{ width: 720, margin: '40px auto', display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>첨부파일</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={onReloadMock}>재조회(Mock)</Button>
          <Button type="primary" onClick={onSaveMock}>
            저장(Mock)
          </Button>
        </div>
      </div>

      <SppMultiFileUpload
        multiple
        serverFiles={serverFiles}
        value={newFileList}
        onValueChange={setNewFileList}
        deleteFileIds={deleteFileIds}
        onToggleDelete={onToggleDelete}
        onServerDownload={onDownload}
        maxCount={5}
        maxSizeMB={10}
        hideDeletedServerFile={false}
      />

      <div style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.6 }}>
        <div>- 저장된 파일: 파일명 클릭 → 다운로드(fileId), X → 삭제예약 토글</div>
        <div>- 신규 파일: X → 제거, 저장(Mock) 누르면 서버 목록으로 편입(재조회 Mock)</div>
      </div>
    </div>
  );
};

export default MultiFileUploadSample;
