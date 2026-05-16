import { Component, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({ 
  selector: 'app-forgot-password', 
  standalone: true, 
  imports: [FormsModule, RouterLink, TranslateModule], 
  template: `
    <div class="min-h-screen flex bg-white font-sans selection:bg-[#0a8f96]/20">
      <!-- Left Side: Visual & Security Badge (Screenshot 3) -->
      <div class="hidden lg:flex w-[45%] relative overflow-hidden flex-col justify-end p-16">
        <img src="https://images.unsplash.com/photo-1577495508048-b635879837f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
             class="absolute inset-0 w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-[#0c1222]/90 via-[#0c1222]/40 to-[#0a8f96]/20"></div>
        <div class="absolute top-20 right-20 w-32 h-32 border border-white/10 rounded-3xl rotate-12 animate-float"></div>
        <div class="absolute top-48 right-36 w-20 h-20 border border-[#0a8f96]/20 rounded-2xl -rotate-6 animate-float" style="animation-delay: 1s;"></div>
        
        <div class="relative z-10">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <svg class="w-4 h-4 text-[#73d1d6]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C9.243 2 7 4.243 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.757-2.243-5-5-5zm3 8H9V7c0-1.654 1.346-3 3-3s3 1.346 3 3v3z"/></svg>
            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-white">{{ 'AUTH.FORGOT_PASSWORD.BADGE' | translate }}</span>
          </div>
          <h2 class="text-5xl font-bold text-white mb-6 leading-tight ltr:text-left rtl:text-right">{{ 'AUTH.FORGOT_PASSWORD.SIDE_TITLE' | translate }}</h2>
          <p class="text-white/70 text-lg max-w-md leading-relaxed ltr:text-left rtl:text-right">
            {{ 'AUTH.FORGOT_PASSWORD.SIDE_DESC' | translate }}
          </p>
        </div>
      </div>

      <!-- Right Side: Reset Form -->
      <div class="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-20 bg-white">
        <div class="w-full max-w-[440px]">
          <div class="mb-12">
            <a routerLink="/auth/login" class="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mb-12 text-sm font-medium ltr:flex-row rtl:flex-row-reverse">
              <svg class="w-4 h-4 ltr:rotate-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
              {{ 'AUTH.FORGOT_PASSWORD.RETURN_LOGIN' | translate }}
            </a>
            
            <div class="flex items-center gap-3 mb-8">
              <span class="text-2xl font-bold bg-gradient-to-r from-[#0a8f96] to-[#076b70] bg-clip-text text-transparent tracking-tight">Baytology</span>
            </div>

            <div class="w-12 h-12 bg-gradient-to-br from-[#0a8f96]/10 to-[#0a8f96]/5 rounded-xl flex items-center justify-center mb-8 border border-[#0a8f96]/10">
              <svg class="w-6 h-6 text-[#0a8f96]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
            </div>

            <h1 class="text-4xl font-bold text-gray-900 mb-4 ltr:text-left rtl:text-right">{{ 'AUTH.FORGOT_PASSWORD.TITLE' | translate }}</h1>
            <p class="text-gray-500 leading-relaxed ltr:text-left rtl:text-right">
              {{ 'AUTH.FORGOT_PASSWORD.DESC' | translate }}
            </p>
          </div>

          @if (!sent()) {
            <form (ngSubmit)="submit()" class="space-y-8 ltr:text-left rtl:text-right">
              <div class="space-y-2">
                <label class="text-[11px] font-bold text-gray-900 uppercase tracking-widest">{{ 'AUTH.FORGOT_PASSWORD.EMAIL_LABEL' | translate }}</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 ltr:start-0 rtl:end-0 ps-4 pe-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#0a8f96] transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <input type="email" [(ngModel)]="email" name="email" 
                         class="w-full bg-gray-50/50 border border-gray-200 rounded-xl ltr:ps-12 rtl:pe-12 ps-4 pe-4 py-4 text-sm focus:bg-white focus:border-[#0a8f96] focus:ring-4 focus:ring-[#0a8f96]/5 transition-all outline-none" 
                         placeholder="investor@example.com" required>
                </div>
              </div>

              <button type="submit" [disabled]="loading()" 
                      class="w-full bg-[#0a8f96] hover:bg-[#076b70] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#0a8f96]/20 transition-all flex items-center justify-center gap-2 group active:scale-95">
                @if (loading()) { <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> }
                {{ 'AUTH.FORGOT_PASSWORD.SUBMIT_BTN' | translate }}
                <svg class="w-4 h-4 transition-transform ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 ltr:rotate-0 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </form>
          } @else {
            <div class="p-6 bg-[#0a8f96]/5 rounded-2xl border border-[#0a8f96]/10 text-center animate-in zoom-in-95 duration-500">
              <div class="w-12 h-12 bg-[#0a8f96] rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              </div>
              <p class="text-[#0a8f96] font-bold">{{ 'AUTH.FORGOT_PASSWORD.SUCCESS_MSG' | translate }}</p>
              <p class="text-sm text-gray-500 mt-2">{{ 'AUTH.FORGOT_PASSWORD.SUCCESS_DESC' | translate }} <span class="text-gray-900 font-medium">{{ email }}</span></p>
            </div>
          }

          <div class="mt-16 pt-8 border-t border-gray-50 ltr:text-left rtl:text-right">
             <p class="text-xs text-gray-400">
               {{ 'AUTH.FORGOT_PASSWORD.ISSUE_HINT' | translate }} 
               <a href="#" class="text-[#0a8f96] font-bold hover:underline">{{ 'AUTH.FORGOT_PASSWORD.CONTACT_SUPPORT' | translate }}</a>
             </p>
          </div>
        </div>
      </div>
    </div>
  ` })
export class ForgotPasswordComponent {
  email = ''; loading = signal(false); sent = signal(false);
  constructor(private auth: AuthService, private toast: ToastService) {}
  async submit() { this.loading.set(true); try { await this.auth.forgotPassword({ email: this.email }); this.sent.set(true); } catch (e: any) { this.toast.error(e?.error?.detail || 'Failed'); } finally { this.loading.set(false); } }
}
