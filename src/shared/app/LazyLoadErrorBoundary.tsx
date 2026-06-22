import { Component, type ErrorInfo, type ReactNode } from 'react';

type LazyLoadErrorBoundaryProps = {
  children: ReactNode;
  resetKey?: string;
};

type LazyLoadErrorBoundaryState = {
  hasError: boolean;
};

export default class LazyLoadErrorBoundary extends Component<LazyLoadErrorBoundaryProps, LazyLoadErrorBoundaryState> {
  state: LazyLoadErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): LazyLoadErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Lazy component load failed.', error, errorInfo);
  }

  componentDidUpdate(prevProps: LazyLoadErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16 }}>
          화면을 불러오지 못했습니다. 새 버전 배포로 인해 일부 화면 파일을 찾을 수 없을 수 있습니다. 입력 중인 내용이 있다면 저장 후 새로고침해 주세요.
        </div>
      );
    }

    return this.props.children;
  }
}
