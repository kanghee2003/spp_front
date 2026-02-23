import { useMdiContext } from '@/hook/useMdiContext';
import { Card } from 'antd';

const TabControlTab2 = () => {
  const mdi = useMdiContext();

  return (
    <Card size="small" title="TabControlTab2" style={{ margin: 16 }}>
      <Card size="small" title="Params" styles={{ body: { padding: 12 } }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify({ viewKey: mdi.viewKey, tabKey: mdi.tabKey, params: mdi.params }, null, 2)}</pre>
      </Card>
    </Card>
  );
};

export default TabControlTab2;
