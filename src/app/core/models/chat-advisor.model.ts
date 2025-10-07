export interface ChatAdvisor {
  userId: number;
  name: string;
  email: string;
  updatedAt: string;
  attentionCount: number;
  avgDurationMinutes: number;
  minutesSinceUpdate: number;
  percentage: number;
}
