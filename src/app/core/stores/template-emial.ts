import { createEntityStore } from './generic/createEntityStore';
import { TemplateEmail } from '@models/template-email.model';
import { TemplateEmailService } from '@services/template-email.service';

export const TemplateEmailStore = createEntityStore<TemplateEmail>({
  serviceToken: TemplateEmailService,
  entityName: 'TemplateEmail',
});
