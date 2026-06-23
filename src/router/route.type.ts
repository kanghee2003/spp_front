import { ReactNode } from 'react';

export type AppRoute = {
  /** 탭/메뉴에서 사용하는 화면 고유 key (백엔드가 내려준다고 가정) */
  key: string;
  /** 실제 렌더링 Element */
  element: ReactNode;
};
