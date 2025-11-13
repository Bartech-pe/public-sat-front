import { createEntityStore } from './createEntityStore';
import { Team } from '@models/team.model';
import { TeamService } from '@services/team.service';

export const TeamStore = createEntityStore<Team>({
  serviceToken: TeamService,
  entityName: 'Team',
});
