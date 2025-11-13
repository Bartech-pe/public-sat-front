import { createEntityStore } from './generic/createEntityStore';
import { EmailTemplate } from '@models/email-template.model';
import { EmailTemplateService } from '@services/email-template.service';

export const EmailTemplateStore = createEntityStore<EmailTemplate>({
  serviceToken: EmailTemplateService,
  entityName: 'EmailTemplate',
});
