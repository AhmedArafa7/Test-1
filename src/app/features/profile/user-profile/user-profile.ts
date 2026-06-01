import { Component, signal, OnInit, computed, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CommonModule } from '@angular/common';
import { ProfileService } from '../services/profile.service';
import { UserProfile } from '../../../core/models';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner';
import { ToastService } from '../../../core/services/toast.service';
import { FormsModule } from '@angular/forms';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date.pipe';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [RouterLink, LoadingSpinnerComponent, LocalizedDatePipe, FormsModule, TranslateModule, CommonModule],
  template: `
    <div class="min-h-screen bg-[#f8fafc] font-sans pt-24 md:pt-28 pb-16 px-4 md:px-8">
      @if (loading()) { 
        <div class="flex justify-center py-32"><app-loading-spinner [message]="'PROFILE.LOADING' | translate" /></div>
      } @else {
        <div class="max-w-[1400px] mx-auto animate-fade-in">
          
          <!-- Header Area -->
          <div class="ltr:text-left rtl:text-right mb-10 w-full">
            <h1 class="text-3xl md:text-[40px] font-black text-gray-900 tracking-tight mb-2">
              {{ 'PROFILE.TITLE' | translate }}
            </h1>
            <p class="text-slate-500 font-bold text-sm md:text-base">
              {{ 'PROFILE.SUBTITLE' | translate }}
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Left Sidebar (Profile Summary) -->
            <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] overflow-hidden">
                <div class="h-28 bg-gradient-to-r from-[#0a8f96] via-[#0a8f96]/80 to-[#12b5bd] relative">
                  <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 20px 20px;"></div>
                </div>
                <div class="px-8 pb-8 -mt-14 text-center">
                  <div class="relative inline-block mb-6 group cursor-pointer" (click)="showFullImage.set(true)">
                    <div class="w-32 h-32 rounded-full bg-white flex items-center justify-center border border-white ring-4 ring-slate-50 shadow-xl overflow-hidden">
                      @if (profile()?.avatarUrl && profile()!.avatarUrl!.length > 20 && !imageError()) {
                        <img [src]="profile()?.avatarUrl" (error)="imageError.set(true)" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105">
                      } @else {
                        <svg class="w-16 h-16 text-slate-200" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      }
                    </div>
                    <div class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                      <svg class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                    </div>
                  </div>
                  
                  <h2 class="text-2xl font-black text-slate-900 mb-1 leading-tight">{{ profile()?.displayName || ('PROFILE.WELCOME' | translate) }}</h2>
                  <p class="text-sm text-slate-400 font-bold mb-6 tracking-wide">{{ auth.currentUser()?.email }}</p>
                  
                  <div class="flex flex-wrap justify-center gap-2 mb-8">
                    @for (role of auth.userRoles(); track role) { 
                      <span class="bg-slate-900 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                        {{ 'NAV.ROLES.' + role.toUpperCase() | translate }}
                      </span> 
                    }
                  </div>

                  <div class="pt-8 border-t border-slate-100 flex justify-center gap-12">
                    <a routerLink="/saved" class="text-center group cursor-pointer">
                      <p class="text-2xl font-black text-slate-900 group-hover:text-[#0a8f96] transition-colors tabular-nums">{{ savedCount() }}</p>
                      <p class="text-[10px] font-bold text-slate-400 mt-1">{{ 'PROFILE.SAVED' | translate }}</p>
                    </a>
                    <a routerLink="/bookings" class="text-center group cursor-pointer">
                      <p class="text-2xl font-black text-slate-900 group-hover:text-[#0a8f96] transition-colors tabular-nums">{{ bookingCount() }}</p>
                      <p class="text-[10px] font-bold text-slate-400 mt-1">{{ 'PROFILE.BOOKINGS' | translate }}</p>
                    </a>
                  </div>
                </div>
              </div>

              <button (click)="auth.logout()" 
                      class="w-full bg-white hover:bg-rose-50 border border-slate-100 text-rose-600 font-black py-4.5 rounded-[24px] shadow-sm hover:shadow hover:border-rose-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                <span>{{ 'PROFILE.LOGOUT' | translate }}</span>
              </button>
            </div>

            <!-- Main Info Area -->
            <div class="col-span-12 lg:col-span-8 space-y-8">
              
              <!-- Personal Info Card -->
              <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] p-6 md:p-8">
                <div class="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
                  <h3 class="text-xl font-black text-slate-900">{{ 'PROFILE.PERSONAL_INFO' | translate }}</h3>
                  <a routerLink="/profile/edit" class="text-xs font-black text-[#0a8f96] hover:text-[#086b70] transition-colors flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    <span>{{ 'PROFILE.EDIT_BTN' | translate }}</span>
                  </a>
                </div>

                @if (profile(); as p) {
                  <div class="space-y-8">
                    <!-- Bio -->
                    <div>
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2">{{ 'PROFILE.BIO' | translate }}</label>
                      <p class="text-slate-500 text-sm leading-relaxed font-bold bg-slate-50/50 p-6 rounded-2xl border border-slate-100 text-center">
                        {{ p.bio || ('PROFILE.NO_BIO' | translate) }}
                      </p>
                    </div>

                    <!-- Phone and Preferred Contact -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <!-- Phone -->
                      <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2">{{ 'PROFILE.PHONE' | translate }}</label>
                        <div class="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                          <span class="text-sm font-bold text-slate-800">{{ p.phoneNumber || ('PROFILE.NOT_REGISTERED' | translate) }}</span>
                        </div>
                      </div>

                      <!-- Contact Method -->
                      <div>
                        <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2">{{ 'PROFILE.CONTACT' | translate }}</label>
                        <div class="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                          <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          <span class="text-sm font-bold text-slate-800">{{ p.preferredContactMethod || 'EMAIL' }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Member Since -->
                    <div>
                      <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pr-2">{{ 'PROFILE.MEMBER_SINCE' | translate }}</label>
                      <div class="w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        <span class="text-sm font-bold text-slate-800">{{ p.createdOnUtc | localizedDate:'longDate' }}</span>
                      </div>
                    </div>
                  </div>
                } @else {
                  <div class="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                    <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-6 shadow-sm">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                    <p class="text-slate-500 font-bold text-lg mb-6">{{ 'PROFILE.COMPLETE_PROMPT' | translate }}</p>
                    <a routerLink="/profile/edit" class="bg-[#0a8f96] text-white font-black px-8 py-3.5 rounded-2xl shadow-xl shadow-[#0a8f96]/20 hover:scale-105 transition-all inline-block">{{ 'PROFILE.COMPLETE_BTN' | translate }}</a>
                  </div>
                }
              </div>
              
              <!-- Account Security Card -->
              <div class="bg-white rounded-[24px] border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.015)] p-6 md:p-8">
                <div class="flex items-start justify-between mb-8">
                  <div class="ltr:text-left rtl:text-right">
                    <h3 class="text-xl font-black text-slate-900 mb-2">{{ 'PROFILE.SECURITY' | translate }}</h3>
                    <p class="text-slate-500 font-bold text-xs md:text-sm leading-relaxed max-w-md">{{ 'PROFILE.SECURITY_DESC' | translate }}</p>
                  </div>
                  <div class="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center shadow-sm shrink-0">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                </div>
                
                <button (click)="showChangePassword.set(true)" 
                        class="w-full py-4.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 font-black rounded-2xl text-xs transition-all duration-200 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-3">
                  <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                  <span>{{ 'PROFILE.CHANGE_PW' | translate }}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- Change Password Modal -->
      @if (showChangePassword()) {
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6 animate-fade-in">
          <div class="bg-white rounded-[24px] w-full max-w-md p-8 md:p-10 shadow-2xl animate-slide-up relative">
            <button (click)="showChangePassword.set(false)" class="absolute top-8 left-8 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            
            <h3 class="text-2xl font-black text-gray-900 mb-2">{{ 'PROFILE.CHANGE_PW' | translate }}</h3>
            <p class="text-gray-400 font-bold text-xs mb-8 tracking-wide">{{ 'PROFILE.CHANGE_PW_SUB' | translate }}</p>
            
            <form (submit)="submitChangePassword($event)" class="space-y-6">
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pr-2">{{ 'PROFILE.CURRENT_PW' | translate }}</label>
                <input type="password" name="current" [(ngModel)]="pwForm.currentPassword" required
                       class="w-full bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold p-4 focus:bg-white focus:ring-2 focus:ring-[#0a8f96]/20 transition-all outline-none">
              </div>
              
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pr-2">{{ 'PROFILE.NEW_PW' | translate }}</label>
                <input type="password" name="new" [(ngModel)]="pwForm.newPassword" required
                       class="w-full bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold p-4 focus:bg-white focus:ring-2 focus:ring-[#0a8f96]/20 transition-all outline-none">
              </div>
              
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pr-2">{{ 'PROFILE.CONFIRM_PW' | translate }}</label>
                <input type="password" name="confirm" [(ngModel)]="pwForm.confirmPassword" required
                       class="w-full bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold p-4 focus:bg-white focus:ring-2 focus:ring-[#0a8f96]/20 transition-all outline-none">
              </div>
              
              <button type="submit" [disabled]="changingPassword()"
                      class="w-full bg-[#0a8f96] hover:bg-[#086b70] text-white py-4 rounded-xl font-black shadow-lg shadow-[#0a8f96]/10 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                @if (changingPassword()) { <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> }
                <span>{{ 'PROFILE.UPDATE_PW' | translate }}</span>
              </button>
            </form>
          </div>
        </div>
      }

      <!-- Full Image Preview Modal (Lightbox) -->
      @if (showFullImage() && profile()?.avatarUrl) {
        <div class="fixed inset-0 bg-gray-900/95 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-fade-in" (click)="showFullImage.set(false)">
          <div class="relative max-w-4xl w-full flex flex-col items-center animate-slide-up" (click)="$event.stopPropagation()">
            <button (click)="showFullImage.set(false)" class="absolute -top-16 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs cursor-pointer">
              <span>{{ 'PROFILE.CLOSE' | translate }}</span>
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div class="bg-white p-2 rounded-[24px] shadow-2xl overflow-hidden ring-1 ring-white/20 flex items-center justify-center min-w-[200px] min-h-[200px]">
              @if (!imageError()) {
                <img [src]="profile()?.avatarUrl" (error)="imageError.set(true)" class="max-h-[70vh] w-auto rounded-[20px] object-contain shadow-inner bg-white">
              } @else {
                <svg class="w-32 h-32 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              }
            </div>
            <div class="mt-8 text-center">
              <h3 class="text-xl font-black text-white mb-1">{{ profile()?.displayName }}</h3>
              <p class="text-white/50 text-xs font-bold uppercase tracking-[0.2em]">{{ 'PROFILE.FULL_IMAGE' | translate }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class UserProfileComponent implements OnInit {
  profile = signal<UserProfile | null>(null); 
  loading = signal(true);
  imageError = signal(false);
  
  // Password Change State
  showChangePassword = signal(false);
  showFullImage = signal(false);
  changingPassword = signal(false);
  pwForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  
  private profileService = inject(ProfileService);
  public auth = inject(AuthService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  initials = computed(() => {
    const user = this.auth.currentUser();
    const name = this.profile()?.displayName || user?.displayName || user?.email || '?';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  });

  savedCount = signal(0);
  bookingCount = signal(0);

  async ngOnInit() { 
    try { 
      const [p, stats] = await Promise.all([
        this.profileService.getMyProfile(),
        this.profileService.getProfileStats()
      ]);
      this.profile.set(p);
      if (p.avatarUrl) {
        this.auth.updateAvatar(p.avatarUrl);
      }
      this.savedCount.set(stats.savedPropertiesCount);
      this.bookingCount.set(stats.bookingsCount);
    } catch {} finally { 
      this.loading.set(false); 
    } 
  }

  async submitChangePassword(event: Event) {
    event.preventDefault();
    if (this.pwForm.newPassword !== this.pwForm.confirmPassword) {
      this.toast.error(this.translate.instant('PROFILE.PW_MISMATCH'));
      return;
    }

    this.changingPassword.set(true);
    try {
      await this.auth.changePassword({
        currentPassword: this.pwForm.currentPassword,
        newPassword: this.pwForm.newPassword
      });
      this.toast.success(this.translate.instant('PROFILE.PW_SUCCESS'));
      this.showChangePassword.set(false);
      this.pwForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    } catch (error: any) {
      this.toast.error(error?.error?.detail || this.translate.instant('PROFILE.PW_ERROR'));
    } finally {
      this.changingPassword.set(false);
    }
  }
}
