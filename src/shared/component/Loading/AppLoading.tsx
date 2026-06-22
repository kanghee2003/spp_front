import { Loading3QuartersOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

import { useLoadingStore } from '@/store/loading.store';

const AppLoading = () => {
  const isLoading = useLoadingStore((s) => s.loadings);
  const antIcon = <Loading3QuartersOutlined style={{ fontSize: 24, color: '#fff' }} spin />;

  return (
    <div
      className="loading_wrap"
      style={{
        display: isLoading.length > 0 ? '' : 'none',
        top: 0,
        left: 0,
      }}
    >
      <div className="loading_dim" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin indicator={antIcon} delay={1.5} />
      </div>
    </div>
  );
};

export default AppLoading;
