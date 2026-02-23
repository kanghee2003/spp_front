import { Card } from 'antd';

import SppPageTabs from '@/pages/spp/component/Tab/SppPageTabs';
import { useMdiContext } from '@/hook/useMdiContext';

const TabControl = () => {
  return (
    <Card>
      <SppPageTabs />
    </Card>
  );
};

export default TabControl;
