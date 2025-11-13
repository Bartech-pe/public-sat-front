import { createEntityStore } from './createEntityStore';
import { Skill } from '@models/skill.model';
import { SkillService } from '@services/skill.service';

export const SkillStore = createEntityStore<Skill>({
  serviceToken: SkillService,
  entityName: 'Skill',
});
