export enum UserRole {
  SELLER = 'seller',
  PAYER = 'payer',
  INVESTOR = 'investor',
  ARBITRATOR = 'arbitrator',
}

export interface UserProfile {
  id: number;
  walletAddress: string;
  displayName: string | null;
  role: UserRole;
  avatarUrl: string | null;
  email: string | null;
  desciOptIn: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}
