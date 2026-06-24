import ModuleApp from '@/shared/app/ModuleApp';
import { loadNisRoutes } from '@/pages/nis/routes';

export default function NisApp() {
  return <ModuleApp moduleKey="nis" loadRoutes={loadNisRoutes} />;
}
