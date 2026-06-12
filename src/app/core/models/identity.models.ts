// ─── Token Response ───
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresOnUtc: string;
}

// ─── Register ───
export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  role: string;
  phoneNumber?: string;
}
export interface RegisterResponse { userId: string; }

// ─── Login ───
export interface LoginRequest { email: string; password: string; }

// ─── Refresh ───
export interface RefreshTokenRequest { refreshToken: string; expiredAccessToken: string; }

// ─── External Login ───
export interface ExternalLoginRequest { provider: string; idToken: string; }
export interface ExternalLoginResponse { tokens: TokenResponse; isNewUser: boolean; userId: string; }

// ─── Current User ───
export interface CurrentUser {
  userId: string;
  email: string;
  roles: string[];
  displayName?: string;
  claims?: Array<{
    type: string;
    value: string;
    issuer?: string;
  }>;
}

// ─── Password ───
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; }
export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest { email: string; token: string; newPassword: string; }
export interface ConfirmEmailRequest { userId: string; token: string; }
export interface ResendConfirmationRequest { email: string; }
