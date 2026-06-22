import ModuleApp from '@/shared/app/ModuleApp';
import { loadSppRoutes } from '@/pages/spp/routes';
import QConsole from '@/pages/spp/uc/QConsole';

const sppExtraRoutes = [
  {
    path: '/uc/q-console',
    element: <QConsole />,
  },
];

export default function SppApp() {
  return <ModuleApp moduleKey="spp" loadRoutes={loadSppRoutes} extraRoutes={sppExtraRoutes} />;
}
