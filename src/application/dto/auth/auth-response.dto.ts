export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponseDto {
  user: UserProfileResponse;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number; // 15 mins (in seconds)
  refreshExpiresIn: number; // 7 days (in seconds: 604800)
}
