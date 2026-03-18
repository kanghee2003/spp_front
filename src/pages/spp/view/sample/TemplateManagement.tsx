import { useEffect, useState } from 'react';
import { Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import SppTable from '../../component/Table/SppTable';
import SppInputText from '../../component/Input/SppInputText';
import SppButton from '../../component/Button/SppButton';

interface UploadTemplate {
  tmplId: string;
  fileId: number;
  fileName: string;
  rgtrId: string;
  regDt: string;
}

const TemplateUploadPage = () => {
  const [tmplId, setTmplId] = useState('');
  const [data, setData] = useState<UploadTemplate[]>([]);
  const [selected, setSelected] = useState<UploadTemplate | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const columns: ColumnsType<UploadTemplate> = [
    {
      title: '템플릿ID',
      dataIndex: 'tmplId',
      width: 180,
    },
    {
      title: '파일명',
      dataIndex: 'fileName',
    },
    {
      title: '등록자',
      dataIndex: 'rgtrId',
      width: 120,
    },
    {
      title: '등록일시',
      dataIndex: 'regDt',
      width: 180,
    },
    {
      title: '다운로드',
      width: 120,
      render: (_, record) => <SppButton size="small">다운로드</SppButton>,
    },
  ];

  /** 목록 조회 */
  const loadList = async () => {
    const mock: UploadTemplate[] = [
      {
        tmplId: 'USER_UPLOAD',
        fileId: 1,
        fileName: 'user_template.xlsx',
        rgtrId: 'admin',
        regDt: '2026-03-17 10:00',
      },
      {
        tmplId: 'ORG_UPLOAD',
        fileId: 2,
        fileName: 'org_template.xlsx',
        rgtrId: 'admin',
        regDt: '2026-03-17 11:00',
      },
    ];

    setData(mock);
  };

  useEffect(() => {
    loadList();
  }, []);

  /** 행 클릭 */
  const handleRowClick = (record: UploadTemplate) => {
    setSelected(record);

    setTmplId(record.tmplId);

    setFileList([
      {
        uid: String(record.fileId),
        name: record.fileName,
        status: 'done',
      },
    ]);
  };

  /** 저장 */
  const handleSave = async () => {
    console.log('save', tmplId, fileList);

    // TODO API
  };

  /** 삭제 */
  const handleDelete = async () => {
    if (!selected) return;

    console.log('delete', selected.tmplId);
  };

  /** 초기화 */
  const handleReset = () => {
    setSelected(null);
    setTmplId('');
    setFileList([]);
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 24,
        width: '100%',
      }}
    >
      {/* 좌측 : 목록 */}

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          템플릿 목록
        </div>

        <SppTable<UploadTemplate>
          rowKey="tmplId"
          columns={columns}
          dataSource={data}
          pagination={false}
          selectedRowIndex={data.findIndex((v) => v.tmplId === selected?.tmplId)}
          onRow={(record: any) => ({
            onClick: () => handleRowClick(record),
          })}
        />
      </div>

      {/* 우측 : 등록 */}

      <div
        style={{
          width: 360,
        }}
      >
        <div
          style={{
            fontWeight: 600,
            marginBottom: 16,
          }}
        >
          템플릿 등록
        </div>

        {/* 템플릿ID */}

        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 4 }}>템플릿ID</div>

          <SppInputText value={tmplId} onChange={(e) => setTmplId(e.target.value)} />
        </div>

        {/* 파일 업로드 */}

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 4 }}>파일</div>

          <Upload maxCount={1} beforeUpload={() => false} fileList={fileList} onChange={({ fileList }) => setFileList(fileList)}>
            <SppButton icon={<UploadOutlined />}>파일 선택</SppButton>
          </Upload>
        </div>

        {/* 버튼 */}

        <div
          style={{
            display: 'flex',
            gap: 8,
          }}
        >
          <SppButton type="primary" onClick={handleSave}>
            저장
          </SppButton>

          <SppButton danger onClick={handleDelete}>
            삭제
          </SppButton>

          <SppButton onClick={handleReset}>초기화</SppButton>
        </div>
      </div>
    </div>
  );
};

export default TemplateUploadPage;
