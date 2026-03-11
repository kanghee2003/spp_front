import { ComponentType } from 'react';

export type ApprovalContentMode = 'view' | 'edit';

export type ApprovalContentProps = {
  formId: string;
  docNo?: string;
  mode?: ApprovalContentMode;
  onSubmitCallback?: (submit: (() => Promise<boolean>) | null) => void;
  onEditableChange?: (editable: boolean) => void;
};

export type ApprovalContentComponent = ComponentType<ApprovalContentProps>;
