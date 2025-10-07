export interface ChatWspAdvisor {
  userId: number;
  name: string;
  email: string;
  phoneNumber: string;
  updatedAt: string;
  attentionCount: number;
  avgDurationMinutes: number;
  totalDurationMinutes: number;
  minutesSinceUpdate: number;
  percentage: number;
}
