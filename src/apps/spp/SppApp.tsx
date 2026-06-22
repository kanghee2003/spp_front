import ModuleApp from '@/shared/app/ModuleApp';
import { loadSppRoutes } from '@/pages/spp/routes';

export default function SppApp() {
  return <ModuleApp moduleKey="spp" loadRoutes={loadSppRoutes} />;
}
