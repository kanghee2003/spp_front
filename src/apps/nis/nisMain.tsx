import NisApp from '@/apps/nis/NisApp';
import { bootstrapApp } from '@/shared/app/AppBootstrap';

bootstrapApp({ app: <NisApp />, apiSystemKey: 'nis' });
