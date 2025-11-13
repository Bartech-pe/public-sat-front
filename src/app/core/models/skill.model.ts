import { User } from './user.model';

export interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
  users: User[];
  status?: boolean;
  createdAt?: Date;
}

export interface SkillUser {
  name?: string;
  idSkill: number;
  idUser: number;
  score: number;
}
