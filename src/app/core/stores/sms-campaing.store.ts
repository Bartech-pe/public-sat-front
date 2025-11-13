import { SmsCampaingService } from "@services/sms-campaing.service";
import { createEntityStore } from "./createEntityStore";
import { SmsCampaing } from "@models/sms-campaing";

export const SmsCampaningStore = createEntityStore<SmsCampaing>({
    serviceToken: SmsCampaingService,
    entityName: 'SMSCAMPAING',
});