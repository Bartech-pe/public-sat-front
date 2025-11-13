export interface ChatWspAdvisor {
  userId: number;
  name: string;
  channelStateId: number;
  email: string;
  phoneNumber: string;
  updatedAt: string;
  attentionCount: number;
  avgDurationMinutes: number;
  totalDurationMinutes: number;
  minutesSinceUpdate: number;
  percentage: number;
}
