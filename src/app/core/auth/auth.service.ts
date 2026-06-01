import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TokenResponse, CurrentUser, LoginRequest, RegisterRequest, ExternalLoginRequest, ExternalLoginResponse, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest, ConfirmEmailRequest, ResendConfirmationRequest, RegisterResponse } from '../models';
import { firstValueFrom } from 'rxjs';

const TOKEN_KEY = 'baytology_token';
const REFRESH_KEY = 'baytology_refresh';
const EXPIRES_KEY = 'baytology_expires';
const USER_KEY = 'baytology_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;

  private loadToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }

  // ─── Signals ───
  private _currentUser = signal<CurrentUser | null>(this.loadUser());
  private _token = signal<string | null>(this.loadToken());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(() => this._currentUser()?.roles?.includes('Admin') ?? false);
  readonly isAgent = computed(() => this._currentUser()?.roles?.includes('Agent') ?? false);
  readonly isBuyer = computed(() => this._currentUser()?.roles?.includes('Buyer') ?? false);
  readonly userId = computed(() => this._currentUser()?.userId ?? null);
  readonly userRoles = computed(() => this._currentUser()?.roles ?? []);
  readonly userAvatar = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    // Initial sync from profile if exists
    this.syncAvatarFromProfile();
  }

  syncAvatarFromProfile() {
    const userId = this.userId();
    if (userId) {
      const localAvatar = localStorage.getItem(`avatar_${userId}`);
      if (localAvatar && localAvatar.length > 10 && localAvatar !== 'null' && localAvatar !== 'undefined') {
        this.userAvatar.set(localAvatar);
      } else {
        this.userAvatar.set(null);
      }
    }
  }

  updateAvatar(url: string | null) {
    const userId = this.userId();
    if (!userId) return;
    
    if (url && url.length > 10) {
      this.userAvatar.set(url);
      localStorage.setItem(`avatar_${userId}`, url);
    } else {
      this.userAvatar.set(null);
      localStorage.removeItem(`avatar_${userId}`);
    }
  }

  get token(): string | null { return this._token(); }
  get refreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY) || sessionStorage.getItem(REFRESH_KEY);
  }

  isTokenExpired(): boolean {
    const expires = localStorage.getItem(EXPIRES_KEY) || sessionStorage.getItem(EXPIRES_KEY);
    if (!expires) return true;
    const expiresDate = new Date(expires);
    return expiresDate.getTime() - Date.now() < 30000;
  }

  // ─── Login ───
  async login(request: LoginRequest, rememberMe = true): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.apiUrl}/identity/token/generate`, request)
    );
    this.storeTokens(response, rememberMe);
    await this.loadCurrentUser();
  }

  // ─── Register ───
  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return firstValueFrom(
      this.http.post<RegisterResponse>(`${this.apiUrl}/identity/register`, request)
    );
  }

  // ─── External Login ───
  async externalLogin(request: ExternalLoginRequest, rememberMe = true): Promise<ExternalLoginResponse> {
    const response = await firstValueFrom(
      this.http.post<ExternalLoginResponse>(`${this.apiUrl}/identity/external-login`, request)
    );
    this.storeTokens(response.tokens, rememberMe);
    await this.loadCurrentUser();
    return response;
  }

  // ─── Refresh Token ───
  async refreshTokens(): Promise<TokenResponse> {
    const response = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.apiUrl}/identity/token/refresh`, {
        refreshToken: this.refreshToken,
        expiredAccessToken: this._token(),
      })
    );
    const rememberMe = localStorage.getItem('baytology_remember_me') === 'true';
    this.storeTokens(response, rememberMe);
    return response;
  }

  // ─── Load User Info ───
  async loadCurrentUser(): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.get<CurrentUser>(`${this.apiUrl}/identity/me`)
      );
      this._currentUser.set(user);
      const rememberMe = localStorage.getItem('baytology_remember_me') === 'true';
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      this.clearAuth();
    }
  }

  // ─── Password Management ───
  changePassword(request: ChangePasswordRequest) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/identity/change-password`, request));
  }
  forgotPassword(request: ForgotPasswordRequest) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/identity/forgot-password`, request));
  }
  resetPassword(request: ResetPasswordRequest) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/identity/reset-password`, request));
  }
  confirmEmail(request: ConfirmEmailRequest) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/identity/confirm-email`, request));
  }
  resendConfirmation(request: ResendConfirmationRequest) {
    return firstValueFrom(this.http.post(`${this.apiUrl}/identity/resend-confirmation`, request));
  }

  // ─── Logout ───
  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/identity/logout`, {}));
    } catch { /* ignore */ }
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  // ─── Delete Account ───
  async deleteAccount(): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/identity/account`));
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  // ─── Helpers ───
  private storeTokens(tokens: TokenResponse, rememberMe = true): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Set rememberMe flag
    localStorage.setItem('baytology_remember_me', rememberMe ? 'true' : 'false');
    
    // Remove from opposite storage to avoid mixed states
    const opposite = rememberMe ? sessionStorage : localStorage;
    opposite.removeItem(TOKEN_KEY);
    opposite.removeItem(REFRESH_KEY);
    opposite.removeItem(EXPIRES_KEY);
    opposite.removeItem(USER_KEY);

    storage.setItem(TOKEN_KEY, tokens.accessToken!);
    storage.setItem(REFRESH_KEY, tokens.refreshToken!);
    if (tokens.expiresOnUtc) {
      storage.setItem(EXPIRES_KEY, tokens.expiresOnUtc);
    }
    this._token.set(tokens.accessToken!);
  }

  private clearAuth(): void {
    const userId = this._currentUser()?.userId;
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('baytology_remember_me');

    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
    sessionStorage.removeItem(USER_KEY);

    localStorage.removeItem('baytology_chat_history');
    localStorage.removeItem('baytology_mock_notifications'); // legacy shared key
    localStorage.removeItem('baytology_unread_counts');
    localStorage.removeItem('baytology_last_viewed');
    localStorage.removeItem('baytology_muted_conversations');
    if (userId) {
      localStorage.removeItem(`baytology_mock_notifications_${userId}`);
    }
    sessionStorage.removeItem('baytology_ai_session_id');
    this._token.set(null);
    this._currentUser.set(null);
  }

  private loadUser(): CurrentUser | null {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
