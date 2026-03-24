import { Card, Col, Row, Typography } from 'antd';

const { Title, Text } = Typography;

const item = [
  {
    key: '1',
    title: '고객정보조회사유',
    count: '3건',
    accent: '#3f51b5',
    details: [
      { label: '전일자 조회사유', count: '0' },
      { label: '조회사유 중점 점검대상', count: '2' },
      { label: '인사이동 전일자 조회사유', count: '1' },
    ],
  },
  {
    key: '2',
    title: '개인정보관리시스템\n(PMIS)신규탐지 만기도래',
    count: '3건',
    accent: '#5167d8',
    details: [
      { label: '신규탐지', count: '0' },
      { label: '만기도래', count: '2' },
      { label: '만기경과', count: '1' },
      { label: '출력물 승인중 관리자알림', count: '0' },
    ],
  },
  {
    key: '3',
    title: '미결재 업무목록',
    count: '2건',
    accent: '#5b64c6',
    details: [
      { label: '조회사유 결재', count: '0' },
      { label: '신청/등록 내용 결재', count: '2' },
      { label: '분기점검 내용 결재', count: '0' },
      { label: '개인정보 출력물결재', count: '9034' },
      { label: '개인정보 점검결과', count: '2' },
      { label: '영업점 고객정보보호 점검결과', count: '0' },
    ],
  },
];

const DashboardTopSummarySection = () => {
  return (
    <Row gutter={[12, 12]}>
      {item.map((summaryItem) => (
        <Col key={summaryItem.key} xs={24} md={8}>
          <Card size="small" style={{ height: '100%', borderRadius: 10, overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
            <div
              style={{
                background: summaryItem.accent,
                color: '#fff',
                textAlign: 'center',
                padding: '9px 10px',
                fontWeight: 700,
                fontSize: 13,
                whiteSpace: 'pre-line',
                lineHeight: 1.25,
                minHeight: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {summaryItem.title}
            </div>

            <div style={{ padding: 16, minHeight: 180 }}>
              <Title level={2} style={{ margin: '0 0 10px 0', color: '#3b2f6b' }}>
                {summaryItem.count}
              </Title>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {summaryItem.details.map((detailItem, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <Text style={{ fontSize: 12, color: '#333' }}>{detailItem.label}</Text>
                    <Text style={{ fontSize: 12, color: '#333' }}>{detailItem.count}</Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardTopSummarySection;
