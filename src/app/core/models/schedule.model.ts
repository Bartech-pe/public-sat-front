export interface Schedule {
  id?: number;
  startTime: Date;
  endTime: Date;
  isHoliday: boolean;
  campaignId: number;
}

export interface IDayWeek {
  number: number;
  day: string;
}
