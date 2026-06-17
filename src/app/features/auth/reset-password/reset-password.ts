import { Component, signal, OnInit, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { extractApiError } from '../../../core/utils/api-error';

@Component({ selector: 'app-reset-password', standalone: true, imports: [FormsModule, RouterLink, TranslateModule], template: `
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f0f4f5] to-[#f8f9fa] px-4 font-sans">
    <div class="bg-white p-10 w-full max-w-md rounded-[32px] border border-gray-100 shadow-sm animate-fade-in">
      <h1 class="text-3xl font-black text-gray-900 text-center mb-8 ltr:text-left rtl:text-right">{{ 'AUTH.RESET_PASSWORD.TITLE' | translate }}</h1>
      <form (ngSubmit)="submit()" class="space-y-6 ltr:text-left rtl:text-right">
        <div class="space-y-2">
          <label class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{{ 'AUTH.RESET_PASSWORD.LABEL' | translate }}</label>
          <div class="relative">
            <input [type]="showPassword() ? 'text' : 'password'" [(ngModel)]="newPassword" name="newPassword" 
                   (paste)="$event.preventDefault()" (copy)="$event.preventDefault()" (cut)="$event.preventDefault()"
                   class="input-field w-full pr-12" 
                   required>
            <button type="button" (click)="showPassword.set(!showPassword())" class="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              @if (showPassword()) {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              }
            </button>
          </div>
        </div>
        <button type="submit" [disabled]="loading()" 
                class="btn-luxury w-full py-4.5 disabled:opacity-50">
          @if (loading()) { <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> }
          {{ 'AUTH.RESET_PASSWORD.SUBMIT_BTN' | translate }}
        </button>
      </form>
      <p class="text-center text-sm font-bold text-gray-500 mt-10">
        <a routerLink="/auth/login" class="text-[#0a8f96] hover:underline flex items-center justify-center gap-2 ltr:flex-row rtl:flex-row-reverse">
          <svg class="w-4 h-4 ltr:rotate-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          {{ 'AUTH.FORGOT_PASSWORD.RETURN_LOGIN' | translate }}
        </a>
      </p>
    </div>
  </div>` })
export class ResetPasswordComponent implements OnInit {
  newPassword = ''; email = ''; token = ''; loading = signal(false); showPassword = signal(false);
  private translate = inject(TranslateService);
  constructor(private auth: AuthService, private route: ActivatedRoute, private router: Router, private toast: ToastService) {}
  ngOnInit() { this.email = this.route.snapshot.queryParams['email'] || ''; this.token = this.route.snapshot.queryParams['token'] || ''; }
  async submit() { 
    this.loading.set(true); 
    try { 
      await this.auth.resetPassword({ email: this.email, token: this.token, newPassword: this.newPassword }); 
      this.toast.success(this.translate.instant('AUTH.RESET_PASSWORD.SUCCESS')); 
      this.router.navigate(['/auth/login']); 
    } catch (e: any) { 
      const extracted = extractApiError(e, this.translate);
      if (extracted) {
        this.toast.error(extracted);
      } else {
        this.toast.error(this.translate.instant('AUTH.RESET_PASSWORD.ERROR'));
      }
    } finally { 
      this.loading.set(false); 
    } 
  }
}
