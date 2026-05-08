// components/notice/SystemNoticePopup.tsx
import { cookieUtil } from '@/utils/cookie.util';
import { Button, Checkbox, Modal } from 'antd';
import { useEffect, useState } from 'react';

const NOTICE_COOKIE_PREFIX = 'hide_notice_';

const isNoticeHiddenToday = (noticeId: string | number) => {
  return cookieUtil.get(`${NOTICE_COOKIE_PREFIX}${noticeId}`) === 'Y';
};

const hideNoticeToday = (noticeId: string | number) => {
  cookieUtil.set(`${NOTICE_COOKIE_PREFIX}${noticeId}`, 'Y', {
    expires: 1,
    path: '/',
  });
};

type Notice = {
  noticeId: number;
  title: string;
  content: string;
};

const SystemNoticePopup = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const loadNotices = async () => {
      // TODO: 실제 API로 교체
      const result: Notice[] = [
        {
          noticeId: 1,
          title: '시스템 점검 안내',
          content: `
            <p>오늘 18시에 시스템 점검이 있습니다.</p>
            <img src="/sample/notice.png" alt="공지 이미지" />
          `,
        },
        {
          noticeId: 2,
          title: '공지사항 안내',
          content: `
            <p>신규 기능이 배포되었습니다.</p>
          `,
        },
      ];

      const visibleNotices = result.filter((notice) => !isNoticeHiddenToday(notice.noticeId));

      setNotices(visibleNotices);
    };

    loadNotices();
  }, []);

  const handleClose = (noticeId: number) => {
    if (checkedMap[noticeId]) {
      hideNoticeToday(noticeId);
    }

    setNotices((prev) => prev.filter((notice) => notice.noticeId !== noticeId));

    setCheckedMap((prev) => {
      const next = { ...prev };
      delete next[noticeId];
      return next;
    });
  };

  return (
    <>
      {notices.map((notice, index) => (
        <Modal
          key={notice.noticeId}
          open
          title={notice.title}
          onCancel={() => handleClose(notice.noticeId)}
          footer={null}
          width={720}
          style={{ top: 80 + index * 30 }}
          zIndex={1000 + index}
        >
          <div
            style={{
              marginBottom: 16,
              minHeight: 360,
              maxHeight: 600,
              overflowY: 'auto',
            }}
          >
            <div className="notice-popup-content" dangerouslySetInnerHTML={{ __html: notice.content }} />
          </div>

          <Checkbox
            checked={checkedMap[notice.noticeId] ?? false}
            onChange={(e) =>
              setCheckedMap((prev) => ({
                ...prev,
                [notice.noticeId]: e.target.checked,
              }))
            }
          >
            오늘 하루 보지 않기
          </Checkbox>

          <div style={{ textAlign: 'right', marginTop: 16 }}>
            <Button type="primary" onClick={() => handleClose(notice.noticeId)}>
              확인
            </Button>
          </div>
        </Modal>
      ))}
    </>
  );
};

export default SystemNoticePopup;
