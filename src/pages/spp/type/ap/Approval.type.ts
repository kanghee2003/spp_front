import { ComponentType } from 'react';

export type ApprovalContentProps = {
  formId: string; // 예: F0001
  bizData?: Record<string, any>; // 업무 화면에서 넘겨주는 기본 파라미터
  onChangeDraft?: (data: Record<string, any>) => void; // 본문 화면이 부모 팝업에 데이터 전달
};

export type ApprovalContentComponent = ComponentType<ApprovalContentProps>;
