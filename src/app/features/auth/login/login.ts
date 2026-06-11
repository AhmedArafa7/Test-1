import { Component, OnInit, signal, computed } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule],
  template: `
    <div class="min-h-screen relative flex items-center justify-center overflow-hidden font-sans selection:bg-[#0c7379]/20 bg-slate-900">
      
      <!-- Tiny Blurred Low-Res Background Placeholder -->
      <div [class]="bgLoaded() ? 'opacity-0' : 'opacity-100'"
           class="absolute inset-0 transition-opacity duration-1000 bg-cover bg-center filter blur-xl scale-110"
           style="background-image: url('/WhatsApp Image 2026-05-30 at 12.10.21 AM.jpeg?w=20&q=10');"></div>
      
      <!-- Full-Res Actual Background Image -->
      <img src="/WhatsApp Image 2026-05-30 at 12.10.21 AM.jpeg" 
           (load)="bgLoaded.set(true)"
           class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
           [class]="bgLoaded() ? 'opacity-100' : 'opacity-0'">
      <div class="absolute inset-0 bg-slate-950/35 backdrop-blur-[1px]"></div>

      <main  class="relative z-10 w-full px-4 animate-scale-in" style="max-width: 440px;">
        <div class="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_25px_60px_rgba(0,0,0,0.12)] rounded-4xl px-8 my-3 sm:px-5 sm:py-8 relative overflow-hidden transition-all duration-300">
          
          <!-- Card Header Logo & Title -->
          <div class="flex flex-col items-center select-none h-60 overflow-hidden">
            <img src="/Baytology_image.png" alt="Baytology" class="h-80 w-100 object-contain overflow-hidden transition-transform duration-500 hover:scale-105">
            <div class="text-center">
              <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ 'AUTH.LOGIN.TITLE' | translate }}</h1>
            </div>
          </div>

          <form (ngSubmit)="login()" class="space-y-5" autocomplete="on">
             <div class="space-y-2 ">
              <label class="block text-[11px] font-black text-slate-400 uppercase tracking-wider">{{ 'AUTH.LOGIN.EMAIL_LABEL' | translate }}</label>
              <input type="email"
                     [ngModel]="email()" (ngModelChange)="email.set($event); emailTouched.set(true)"
                     (blur)="emailTouched.set(true)"
                     (focus)="onFieldFocus($event)"
                     [readonly]="fieldsLocked()"
                     autocomplete="email"
                     name="email"
                     placeholder="admin@baytology.local"
                     [class]="emailFieldClass()" />
              <div [class]="emailHintClass()">
                @if (emailTouched() && emailError()) {
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  <span>{{ 'AUTH.LOGIN.EMAIL_INVALID' | translate }}</span>
                } @else if (emailTouched() && !emailError() && email()) {
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                  <span>{{ 'AUTH.LOGIN.EMAIL_HINT' | translate }}</span>
                } @else {
                  <span>{{ 'AUTH.LOGIN.EMAIL_HINT' | translate }}</span>
                }
              </div>
             </div>

             <div class="space-y-2 ">
               <div class="flex items-center justify-between">
                 <label class="text-[11px] font-black text-slate-400 uppercase tracking-wider">{{ 'AUTH.LOGIN.PASSWORD_LABEL' | translate }}</label>
                 <a routerLink="/auth/forgot-password" class="text-xs font-bold text-[#0c7379] hover:text-[#0b656b] transition-colors">{{ 'AUTH.LOGIN.FORGOT_PASSWORD' | translate }}</a>
               </div>
               <div class="relative">
                  <input [type]="showPassword() ? 'text' : 'password'"
                         [ngModel]="password()" (ngModelChange)="password.set($event); passwordTouched.set(true)"
                         (blur)="passwordTouched.set(true)"
                         (focus)="onFieldFocus($event)"
                         [readonly]="fieldsLocked()"
                         (paste)="$event.preventDefault()" (copy)="$event.preventDefault()" (cut)="$event.preventDefault()"
                         autocomplete="current-password"
                         name="password"
                         placeholder="••••••••••"
                         [class]="passwordFieldClass() + ' rtl:pl-12 ltr:pr-12 '" />
                 <button type="button" (click)="showPassword.set(!showPassword())" class="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                   @if (showPassword()) {
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                     </svg>
                   } @else {
                     <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                       <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                     </svg>
                   }
                 </button>
               </div>
               <div [class]="passwordHintClass()">
                 @if (passwordTouched() && passwordError()) {
                   <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                   <span>{{ 'AUTH.LOGIN.PASSWORD_MIN' | translate }}</span>
                 } @else {
                   <span>{{ 'AUTH.LOGIN.PASSWORD_HINT' | translate }}</span>
                 }
               </div>
             </div>

             <!-- Remember Me Checkbox -->
             <div class="flex items-center justify-start gap-2.5 py-1 select-none ">
               <input type="checkbox"
                      id="rememberMe"
                      [ngModel]="rememberMe()" (ngModelChange)="rememberMe.set($event)"
                      name="rememberMe"
                      class="w-4 h-4 rounded border-slate-300 text-[#0c7379] focus:ring-2 focus:ring-[#0c7379]/20 transition-all cursor-pointer accent-[#0c7379]" />
                <label for="rememberMe" class="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">{{ 'AUTH.LOGIN.REMEMBER_ME' | translate }}</label>
             </div>

            <div class="space-y-2">
              <button type="submit"
                      [disabled]="loading() || !isFormValid()"
                      (click)="markAllTouched()"
                      [title]="!isFormValid() ? ('AUTH.LOGIN.SAVE_DISABLED_HINT' | translate) : ''"
                      [class]="(loading() || !isFormValid()) ? 'btn-luxury w-full py-4 mt-2 cursor-not-allowed text-sm font-black tracking-wide opacity-60' : 'btn-luxury w-full py-4 mt-2 cursor-pointer text-sm font-black tracking-wide'">
                @if (loading()) {
                  <div class="w-5.5 h-5.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                } @else {
                  <span>{{ 'AUTH.LOGIN.LOGIN_BTN' | translate }}</span>
                  <svg class="w-5 h-5 transition-transform ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ltr:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
                }
              </button>
              @if (!isFormValid() && (emailTouched() || passwordTouched())) {
                <p class="field-hint is-error justify-center">
                  <svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                  <span>{{ 'AUTH.LOGIN.SAVE_DISABLED_HINT' | translate }}</span>
                </p>
              }
            </div>
          </form>

          <div class="flex items-center gap-3 py-4 select-none">
            <div class="flex-1 h-px bg-slate-100"></div>
            <div class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">{{ 'AUTH.LOGIN.OR_CONTINUE' | translate }}</div>
            <div class="flex-1 h-px bg-slate-100"></div>
          </div>

          <button type="button"
                  (click)="loginWithGoogle()"
                  class="w-full h-12.5 rounded-2xl border border-slate-200 bg-white text-slate-600 font-bold text-xs hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-sm cursor-pointer">
            <svg class="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{{ 'AUTH.LOGIN.GOOGLE' | translate }}</span>
          </button>

          <p class="text-center text-xs font-bold text-slate-400 mt-6 select-none">
            {{ 'AUTH.LOGIN.NO_ACCOUNT' | translate }}
            <a routerLink="/auth/register" class="text-[#0c7379] hover:text-[#0b656b] hover:underline transition-colors font-bold">{{ 'AUTH.LOGIN.JOIN_NOW' | translate }}</a>
          </p>
        </div> 
      </main>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  rememberMe = signal(true);
  bgLoaded = signal(false);
  loading = signal(false);
  fieldsLocked = signal(true);

  // Validation: touched state
  emailTouched = signal(false);
  passwordTouched = signal(false);

  // Validation: error code per field
  readonly emailError = computed<string | null>(() => {
    const v = this.email().trim();
    if (!v) return 'required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'invalid';
    return null;
  });
  readonly passwordError = computed<string | null>(() => {
    const v = this.password();
    if (!v) return 'required';
    if (v.length < 6) return 'minLength';
    return null;
  });

  readonly isFormValid = computed<boolean>(() => {
    if (this.emailError() !== null) return false;
    if (this.passwordError() !== null) return false;
    return true;
  });

  readonly emailFieldClass = computed<string>(() => {
    const base = 'input-field ';
    if (this.emailTouched() && this.emailError()) return `${base} is-invalid`;
    if (this.emailTouched() && !this.emailError() && this.email()) return `${base} is-valid`;
    return base;
  });
  readonly emailHintClass = computed<string>(() => {
    if (this.emailTouched() && this.emailError()) return 'field-hint is-error';
    if (this.emailTouched() && !this.emailError() && this.email()) return 'field-hint is-success';
    return 'field-hint is-neutral';
  });
  readonly passwordFieldClass = computed<string>(() => {
    const base = 'input-field';
    if (this.passwordTouched() && this.passwordError()) return `${base} is-invalid`;
    if (this.passwordTouched() && !this.passwordError() && this.password()) return `${base} is-valid`;
    return base;
  });
  readonly passwordHintClass = computed<string>(() => {
    if (this.passwordTouched() && this.passwordError()) return 'field-hint is-error';
    if (this.passwordTouched() && !this.passwordError() && this.password()) return 'field-hint is-success';
    return 'field-hint is-neutral';
  });

  markAllTouched() {
    this.emailTouched.set(true);
    this.passwordTouched.set(true);
  }

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initializeGoogleSdk();

    // Unlock fields after a short delay to ensure browser autofill is blocked
    setTimeout(() => this.fieldsLocked.set(false), 50);

    // Pre-fill email if passed from register page
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    if (emailParam) {
      this.email.set(emailParam);
    }
  }

  /** Remove readonly on focus so user can type immediately */
  onFieldFocus(event: FocusEvent) {
    this.fieldsLocked.set(false);
    (event.target as HTMLInputElement).removeAttribute('readonly');
  }

  async login() {
    this.markAllTouched();
    if (!this.isFormValid()) return;
    this.loading.set(true);
    try {
      await this.auth.login({ email: this.email(), password: this.password() }, this.rememberMe());
      const user = this.auth.currentUser();
      const name = user?.displayName?.trim() || user?.email || '';
      const msg = this.translate.instant('AUTH.LOGIN.WELCOME_BACK', { name });
      this.toast.success(msg);
      if (this.auth.isAdmin()) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    } catch (e: any) {
      let errorMessage = this.translate.instant('AUTH.LOGIN.ERROR');

      if (e?.error?.detail) {
        const detail = e.error.detail.toLowerCase();
        if (detail.includes('email') && detail.includes('password')) {
          errorMessage = this.translate.instant('AUTH.LOGIN.INVALID_CREDENTIALS');
        } else if (detail.includes('email')) {
          errorMessage = this.translate.instant('AUTH.LOGIN.EMAIL_NOT_FOUND');
        } else if (detail.includes('locked')) {
          errorMessage = this.translate.instant('AUTH.LOGIN.ACCOUNT_LOCKED');
        } else {
          errorMessage = this.translate.instant('AUTH.LOGIN.ERROR');
        }
      } else if (e?.error?.errors) {
        const firstErrorKey = Object.keys(e.error.errors)[0];
        const firstErrorMessages = e.error.errors[firstErrorKey];
        errorMessage = Array.isArray(firstErrorMessages) ? firstErrorMessages[0] : firstErrorMessages;
      } else if (e?.error?.title) {
        errorMessage = this.translate.instant('AUTH.LOGIN.ERROR');
      }

      this.toast.error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }

  loginWithGoogle() {
    if (!environment.googleClientId) {
      this.toast.error('AUTH.LOGIN.GOOGLE_UNAVAILABLE');
      return;
    }
    if (!window.google?.accounts?.id) {
      this.toast.error('AUTH.LOGIN.GOOGLE_LOADING');
      return;
    }
    window.google.accounts.id.prompt();
  }

  private initializeGoogleSdk() {
    if (!environment.googleClientId) return;
    this.loadScript('https://accounts.google.com/gsi/client')
      .then(() => {
        window.google?.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: async ({ credential }) => {
            if (!credential) return;
            await this.finishExternalLogin('Google', credential);
          },
        });
      })
      .catch(() => {});
  }

  private async finishExternalLogin(provider: 'Google', idToken: string) {
    this.loading.set(true);
    try {
      const response = await this.auth.externalLogin({ provider, idToken });
      const user = this.auth.currentUser();
      const name = user?.displayName?.trim() || user?.email || '';
      const msg = this.translate.instant('AUTH.LOGIN.WELCOME_BACK', { name });
      this.toast.success(msg);
      if (this.auth.isAdmin()) {
        await this.router.navigate(['/admin']);
      } else {
        await this.router.navigate(['/']);
      }
    } catch (error: any) {
      this.toast.error('AUTH.LOGIN.EXTERNAL_FAIL');
    } finally {
      this.loading.set(false);
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
      if (existingScript) { resolve(); return; }
      const script = document.createElement('script');
      script.src = src; script.async = true; script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Script load failed: ${src}`));
      document.head.appendChild(script);
    });
  }
}
