import { Spin } from 'antd';

import { Loading3QuartersOutlined } from '@ant-design/icons';
import { useLoadingStore } from '@/store/loading.store';

const SppLoading = () => {
  const isLoading = useLoadingStore((s) => s.loadings);
  const antIcon = <Loading3QuartersOutlined style={{ fontSize: 24, color: '#fff' }} spin />;

  return (
    <>
      <div className={'loading_wrap'} style={{ display: isLoading.length > 0 ? '' : 'none' }}>
        <div className={'loading_dim'}>
          <Spin indicator={antIcon} delay={1.5} />
        </div>
      </div>
    </>
  );
};

export default SppLoading;
