import EtcApp from '@/apps/etc/EtcApp';
import { bootstrapApp } from '@/shared/app/AppBootstrap';

bootstrapApp({ app: <EtcApp />, apiSystemKey: 'etc' });
