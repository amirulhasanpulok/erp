export type JwtAuthPayload = {
  sub: string;
  userId: string;
  outletId: string;
  role: string;
  email: string;
  tokenType: 'access' | 'refresh';
};

