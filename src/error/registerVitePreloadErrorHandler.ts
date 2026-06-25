declare global {
  interface Window {
    __VITE_PRELOAD_ERROR_HANDLER_REGISTERED__?: boolean;
  }
}

export const registerVitePreloadErrorHandler = () => {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.__VITE_PRELOAD_ERROR_HANDLER_REGISTERED__) {
    return;
  }

  window.__VITE_PRELOAD_ERROR_HANDLER_REGISTERED__ = true;

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();

    const confirmed = window.confirm('새 버전이 배포되었습니다.\n 저장하지 않은 내용이 있다면 저장 후 새로고침해 주세요. \n\n' + '새로고침 하시겠습니까?');

    if (confirmed) {
      window.location.reload();
    }
  });
};
