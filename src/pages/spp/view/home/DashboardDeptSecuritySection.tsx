import { Card, Col, Row, Typography } from 'antd';

const { Title, Text } = Typography;

const items = [
  {
    key: '1',
    title: '문서반출현황',
    count: '2건',
    pairs: [
      ['웹메일', '0'],
      ['웹팩스', '2'],
      ['출력물', '1'],
      ['USB', '0'],
    ],
  },
  {
    key: '2',
    title: '개인정보\n탐지현황',
    count: '2건',
    pairs: [
      ['개인정보 신규탐지 건수', '1'],
      ['개인정보 파일보관 건수', '2'],
      ['개인정보 보관(미신청)건수', '2'],
      ['개인정보 보관(장기보관)건수', '0'],
      ['영업점 개인정보 누적 조회량', '0'],
    ],
  },
  {
    key: '3',
    title: '보안점검 현황',
    count: '2건',
    pairs: [
      ['영업점 고객정보 보호점검', '1'],
      ['개인정보 사전점검', '0'],
    ],
  },
];

const cardBg = '#f3f6ff';
const strongBlue = '#4b50c7';
const bodyText = '#50566b';

const DashboardDeptSecuritySection = () => {
  return (
    <Row gutter={[10, 10]}>
      {items.map((item) => (
        <Col key={item.key} xs={24} md={8}>
          <Card size="small" style={{ height: '100%', background: cardBg, borderColor: '#e6ebfb' }} styles={{ body: { padding: '14px 16px' } }}>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', columnGap: 12, alignItems: 'start' }}>
              <div>
                <Text strong style={{ fontSize: 13, whiteSpace: 'pre-line', color: strongBlue, lineHeight: 1.35 }}>
                  {item.title}
                </Text>
                <Title level={2} style={{ margin: '18px 0 0 0', color: strongBlue, lineHeight: 1 }}>
                  {item.count}
                </Title>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 2 }}>
                {item.pairs.map(([label, value], index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <Text style={{ fontSize: 11, color: bodyText, lineHeight: 1.35 }}>{label}</Text>
                    <Text style={{ fontSize: 11, color: bodyText, lineHeight: 1.35 }}>{value}</Text>
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

export default DashboardDeptSecuritySection;
