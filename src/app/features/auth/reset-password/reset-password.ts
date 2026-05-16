import { Component, signal, OnInit, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({ selector: 'app-reset-password', standalone: true, imports: [FormsModule, RouterLink, TranslateModule], template: `
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f0f4f5] to-[#f8f9fa] px-4 font-sans">
    <div class="bg-white p-10 w-full max-w-md rounded-[32px] border border-gray-100 shadow-sm animate-fade-in">
      <h1 class="text-3xl font-black text-gray-900 text-center mb-8 ltr:text-left rtl:text-right">{{ 'AUTH.RESET_PASSWORD.TITLE' | translate }}</h1>
      <form (ngSubmit)="submit()" class="space-y-6 ltr:text-left rtl:text-right">
        <div class="space-y-2">
          <label class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{{ 'AUTH.RESET_PASSWORD.LABEL' | translate }}</label>
          <input type="password" [(ngModel)]="newPassword" name="newPassword" 
                 class="input-field" 
                 required>
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
  newPassword = ''; email = ''; token = ''; loading = signal(false);
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
      this.toast.error(this.translate.instant('AUTH.RESET_PASSWORD.ERROR')); 
    } finally { 
      this.loading.set(false); 
    } 
  }
}
