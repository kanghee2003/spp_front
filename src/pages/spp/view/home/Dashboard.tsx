import { Col, Row, Space, Typography } from 'antd';
import DashboardCalendarSection from './DashboardCalendarSection';
import DashboardDeptSecuritySection from './DashboardDeptSecuritySection';
import DashboardFaqSection from './DashboardFaqSection';
import DashboardInspectionSection from './DashboardInspectionSection';
import DashboardNoticeSection from './DashboardNoticeSection';
import DashboardReasonChartSection from './DashboardReasonChartSection';
import DashboardTopSummarySection from './DashboardTopSummarySection';

const { Title } = Typography;

const Dashboard = () => {
  return (
    <div style={{ padding: 12, background: '#f5f7fa' }}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Row gutter={[12, 12]} align="top">
          <Col xs={24} xl={18}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Title level={5} style={{ margin: '0 0 8px 0' }}>일일확인업무</Title>
                <DashboardTopSummarySection />
              </div>

              <div>
                <Title level={5} style={{ margin: '0 0 8px 0' }}>부서 정보보호 현황</Title>
                <DashboardDeptSecuritySection />
              </div>

              <DashboardInspectionSection />

              <Row gutter={[12, 12]} align="stretch">
                <Col xs={24} xl={12}>
                  <DashboardNoticeSection />
                </Col>
                <Col xs={24} xl={12}>
                  <DashboardFaqSection />
                </Col>
              </Row>
            </Space>
          </Col>

          <Col xs={24} xl={6}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <DashboardReasonChartSection />
              <DashboardCalendarSection />
            </Space>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default Dashboard;
