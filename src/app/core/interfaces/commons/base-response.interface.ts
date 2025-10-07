export interface IBaseResponseDto<T = void> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
