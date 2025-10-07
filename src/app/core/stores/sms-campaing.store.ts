import { SmsCampaingService } from "@services/sms-campania.service";

import { SmsCampaing } from "@models/sms-campaing";
import { createEntityStore } from "./createEntityStore";

export const SmsCampaningStore = createEntityStore<SmsCampaing>({
    serviceToken: SmsCampaingService,
    entityName: 'SMSCAMPAING',
});
