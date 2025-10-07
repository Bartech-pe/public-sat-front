export function convertToPeruTime(utcDate: Date): Date {
  return new Date(utcDate.getTime() + 5 * 60 * 60 * 1000);
}
