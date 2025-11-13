import { EmailSignatureService } from '@services/email-signature.service';
import { createEntityStore } from './generic/createEntityStore';
import { EmailSignature } from '@models/email-signature.model';

export const EmailSignatureStore = createEntityStore<EmailSignature>({
  serviceToken: EmailSignatureService,
  entityName: 'EmailSignature',
});
