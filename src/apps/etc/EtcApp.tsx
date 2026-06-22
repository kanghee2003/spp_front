import ModuleApp from '@/shared/app/ModuleApp';
import { loadEtcRoutes } from '@/pages/etc/routes';

export default function EtcApp() {
  return <ModuleApp moduleKey="etc" loadRoutes={loadEtcRoutes} />;
}
