import { Component, OnInit, signal, computed } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';
import { extractApiError } from '../../../core/utils/api-error';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement | null, options: any) => void;
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

          <!-- Google Official Button Container -->
          <div id="google-btn-container" class="w-full flex justify-center mt-2 h-10 rounded-2xl"></div>

          <p class="text-center text-xs font-bold text-slate-400 mt-6 select-none relative z-20">
            {{ 'AUTH.LOGIN.NO_ACCOUNT' | translate }}
            <a routerLink="/auth/register" class="text-[#0c7379] hover:text-[#0b656b] hover:underline transition-colors font-bold cursor-pointer inline-block">{{ 'AUTH.LOGIN.JOIN_NOW' | translate }}</a>
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
    if (v.length < 8) return 'minLength';
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
      const userId = this.auth.userId();
      const name = user?.displayName?.trim() || user?.email || '';
      
      const newUserKey = `baytology_welcome_new_${userId}`;
      const isNewUser = localStorage.getItem(newUserKey);

      if (!isNewUser) {
        const msg = this.translate.instant('AUTH.LOGIN.WELCOME_BACK', { name });
        this.toast.success(msg);
      }

      if (this.auth.isAdmin()) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/']);
      }
    } catch (e: any) {
      let errorMessage = '';

      // Try backend error code translation first
      const extracted = extractApiError(e, this.translate);
      if (extracted) {
        errorMessage = extracted;
      } else if (e?.status === 0) {
        errorMessage = this.translate.instant('AUTH.LOGIN.SERVER_OFFLINE');
      } else if (e?.error?.detail) {
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

      if (!errorMessage) {
        errorMessage = this.translate.instant('AUTH.LOGIN.ERROR');
      }

      this.toast.error(errorMessage);
    } finally {
      this.loading.set(false);
    }
  }

  loginWithGoogle() {
    // Left empty or can be removed, as the official button handles clicks automatically.
    this.toast.info('AUTH.LOGIN.GOOGLE_LOADING');
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
        }); // <--- RESTORED THIS LINE
        // Render the official Google button
        const btnContainer = document.getElementById('google-btn-container');
        if (btnContainer) {
          window.google?.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: 'signin_with',
            logo_alignment: 'left',
            width: '380'
          });
        }
      })
      .catch(() => {});
  }

  private async finishExternalLogin(provider: 'Google', idToken: string) {
    this.loading.set(true);
    try {
      const response = await this.auth.externalLogin({ provider, idToken });
      const user = this.auth.currentUser();
      const name = user?.displayName?.trim() || user?.email || '';
      
      if (response.isNewUser) {
        localStorage.setItem(`baytology_welcome_new_${response.userId}`, name);
      } else {
        const msg = this.translate.instant('AUTH.LOGIN.WELCOME_BACK', { name });
        this.toast.success(msg);
      }

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
