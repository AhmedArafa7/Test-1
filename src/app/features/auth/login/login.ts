import { Component, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
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
    <div class="min-h-screen flex bg-white font-sans selection:bg-[#0a8f96]/20">
      <!-- Left Side: Visual Panel -->
      <div class="hidden lg:flex w-[45%] relative overflow-hidden flex-col justify-end p-16">
        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
             class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-[#0c1222]/90 via-[#0c1222]/40 to-[#0a8f96]/20"></div>
        <div class="absolute top-20 right-20 w-32 h-32 border border-white/10 rounded-3xl rotate-12 animate-float"></div>
        <div class="absolute top-40 right-40 w-20 h-20 border border-[#0a8f96]/20 rounded-2xl -rotate-6 animate-float" style="animation-delay: 1s;"></div>
        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 mb-8">
            <svg class="w-4 h-4 text-[#12b5bd]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">{{ 'AUTH.LOGIN.SUBTITLE' | translate }}</span>
          </div>
          <h2 class="text-4xl font-bold text-white mb-4 leading-tight">{{ 'AUTH.LOGIN.TITLE' | translate }}</h2>
          <p class="text-white/50 text-base max-w-md leading-relaxed">{{ 'AUTH.LOGIN.SUBTITLE' | translate }}</p>
        </div>
      </div>

      <!-- Right Side: Login Form -->
      <div class="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-20">
        <div class="w-full max-w-[440px]">
          <div class="mb-12">
            <div class="inline-flex items-center gap-3 mb-10 group cursor-pointer" routerLink="/">
              <div class="w-11 h-11 bg-gradient-to-br from-[#0a8f96] to-[#076b70] rounded-xl flex items-center justify-center shadow-lg shadow-[#0a8f96]/20 transition-transform group-hover:rotate-6">
                <span class="text-white text-xl font-black italic">B</span>
              </div>
              <span class="text-2xl font-black tracking-tighter text-gray-900">Baytology</span>
            </div>
            <h2 class="text-2xl font-black text-gray-900 mb-2 lg:hidden">{{ 'AUTH.LOGIN.TITLE' | translate }}</h2>
            <p class="text-gray-400 font-bold text-sm lg:hidden">{{ 'AUTH.LOGIN.SUBTITLE' | translate }}</p>
          </div>

          <form (ngSubmit)="login()" class="space-y-6">
            <div class="space-y-2">
              <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-widest ltr:ml-1 rtl:mr-1">{{ 'AUTH.LOGIN.EMAIL_LABEL' | translate }}</label>
              <input type="email" [(ngModel)]="email" name="email" 
                     class="input-field" 
                     [placeholder]="'AUTH.LOGIN.EMAIL_PLACEHOLDER' | translate" required>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between items-center px-1">
                <label class="block text-[11px] font-bold text-gray-500 uppercase tracking-widest">{{ 'AUTH.LOGIN.PASSWORD_LABEL' | translate }}</label>
                <a routerLink="/auth/forgot-password" class="text-[11px] font-bold text-[#0a8f96] hover:underline">{{ 'AUTH.LOGIN.FORGOT_PASSWORD' | translate }}</a>
              </div>
              <input type="password" [(ngModel)]="password" name="password" 
                     class="input-field" 
                     [placeholder]="'AUTH.LOGIN.PASSWORD_PLACEHOLDER' | translate" required>
            </div>

            <button type="submit" [disabled]="loading()" 
                    class="btn-luxury w-full py-4">
              @if (loading()) {
                <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              }
              {{ 'AUTH.LOGIN.LOGIN_BTN' | translate }}
              <svg class="w-4 h-4 transition-transform ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ltr:rotate-180 rtl:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
          </form>

          <div class="relative my-10">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-100"></div></div>
            <div class="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em]"><span class="bg-white px-6 text-gray-300">{{ 'AUTH.LOGIN.OR_CONTINUE' | translate }}</span></div>
          </div>

          <div>
            <button (click)="loginWithGoogle()" class="flex items-center justify-center gap-3 px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-all font-bold text-[12px] text-gray-700 active:scale-95 w-full">
              <img src="https://www.google.com/favicon.ico" class="w-4 h-4">
              {{ 'AUTH.LOGIN.GOOGLE' | translate }}
            </button>
          </div>

          <p class="text-center text-sm font-bold text-gray-400 mt-12">
            {{ 'AUTH.LOGIN.NO_ACCOUNT' | translate }} 
            <a routerLink="/auth/register" class="text-[#0a8f96] font-bold hover:underline">{{ 'AUTH.LOGIN.JOIN_NOW' | translate }}</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.initializeGoogleSdk();

    // Pre-fill email if passed from register page
    const emailParam = this.route.snapshot.queryParamMap.get('email');
    if (emailParam) {
      this.email = emailParam;
    }
  }

  async login() {
    this.loading.set(true);
    try {
      await this.auth.login({ email: this.email, password: this.password });
      this.toast.success('AUTH.LOGIN.SUCCESS');
      this.router.navigate(['/']);
    } catch (e: any) {
      let errorMessage = 'AUTH.LOGIN.ERROR';
      
      if (e?.error?.detail) {
        errorMessage = e.error.detail;
      } else if (e?.error?.errors) {
        const firstErrorKey = Object.keys(e.error.errors)[0];
        const firstErrorMessages = e.error.errors[firstErrorKey];
        errorMessage = Array.isArray(firstErrorMessages) ? firstErrorMessages[0] : firstErrorMessages;
      } else if (e?.error?.title) {
        errorMessage = e.error.title;
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
      if (response.isNewUser) {
        this.toast.success('AUTH.LOGIN.EXTERNAL_SUCCESS_NEW');
      } else {
        this.toast.success('AUTH.LOGIN.EXTERNAL_SUCCESS_OLD');
      }
      await this.router.navigate(['/']);
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
