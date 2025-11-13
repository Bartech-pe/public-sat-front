export interface ChatAdvisor {
  userId: number;
  name: string;
  channelStateId: number;
  email: string;
  updatedAt: string;
  attentionCount: number;
  avgDurationMinutes: number;
  minutesSinceUpdate: number;
  percentage: number;
}
