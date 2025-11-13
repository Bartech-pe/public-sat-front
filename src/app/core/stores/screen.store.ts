import { createEntityStore } from './createEntityStore';
import { Screen } from '@models/screen.model';
import { ScreenService } from '@services/screen.service';

export const ScreenStore = createEntityStore<Screen>({
  serviceToken: ScreenService,
  entityName: 'Screen',
});
