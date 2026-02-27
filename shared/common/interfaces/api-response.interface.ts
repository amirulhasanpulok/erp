export interface ApiResponse<T = unknown> {
  success: boolean;
  timestamp: string;
  path: string;
  requestId?: string | null;
  data: T;
}
