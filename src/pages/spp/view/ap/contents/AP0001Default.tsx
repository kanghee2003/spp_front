import { Alert } from 'antd';
import { ApprovalContentProps } from '../../../type/ap/Approval.type';

const AP0001Default = ({ formId: formCode }: ApprovalContentProps) => {
  return (
    <Alert type="warning" message="결재 본문 화면이 없습니다." description={`formCode=${formCode} 에 해당하는 결재 화면이 등록되지 않았습니다.`} showIcon />
  );
};

export default AP0001Default;
