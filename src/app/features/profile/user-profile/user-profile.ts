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
    <div class="min-h-screen bg-gradient-to-b from-[#f0f4f5] to-[#f8f9fa] font-sans py-20 px-6">
      @if (loading()) { 
        <div class="flex justify-center py-32"><app-loading-spinner [message]="'PROFILE.LOADING' | translate" /></div>
      } @else {
        <div class="max-w-4xl mx-auto animate-fade-in">
          
          <!-- Header Area -->
          <div class="ltr:text-left rtl:text-right mb-12">
            <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-2">{{ 'PROFILE.TITLE' | translate }}</h1>
            <p class="text-gray-500 font-bold text-sm">{{ 'PROFILE.SUBTITLE' | translate }}</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <!-- Left Sidebar (Profile Summary) -->
            <div class="lg:col-span-4 space-y-6">
              <div class="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div class="h-28 bg-gradient-to-r from-[#0a8f96] via-[#0a8f96]/80 to-[#12b5bd] relative">
                  <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 20px 20px;"></div>
                </div>
                <div class="px-10 pb-10 -mt-14 text-center">
                <div class="relative inline-block mb-6 group cursor-pointer" (click)="showFullImage.set(true)">
                  <div class="w-32 h-32 rounded-full bg-white flex items-center justify-center border border-white ring-4 ring-gray-50 shadow-xl overflow-hidden transition-transform group-hover:scale-105">
                    @if (profile()?.avatarUrl && profile()!.avatarUrl!.length > 20 && !imageError()) {
                      <img [src]="profile()?.avatarUrl" (error)="imageError.set(true)" class="w-full h-full object-contain img-circle b-tr b-2x">
                    } @else {
                      <svg class="w-16 h-16 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                    }
                  </div>
                  <div class="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                    <svg class="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/></svg>
                  </div>
                </div>
                
                <h2 class="text-2xl font-black text-gray-900 mb-1">{{ profile()?.displayName || ('PROFILE.WELCOME' | translate) }}</h2>
                <p class="text-sm text-gray-400 font-bold mb-6 tracking-wide">{{ auth.currentUser()?.email }}</p>
                
                <div class="flex flex-wrap justify-center gap-2 mb-8">
                  @for (role of auth.userRoles(); track role) { 
                    <span class="bg-gradient-to-r from-gray-900 to-gray-700 text-white text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-[0.2em]">{{ 'NAV.ROLES.' + role.toUpperCase() | translate }}</span> 
                  }
                </div>

                <div class="pt-8 border-t border-gray-50 flex justify-center gap-10">
                  <a routerLink="/saved" class="text-center group cursor-pointer">
                    <p class="text-xl font-black text-gray-900 group-hover:text-[#0a8f96] transition-colors">{{ savedCount() }}</p>
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ 'PROFILE.SAVED' | translate }}</p>
                  </a>
                  <a routerLink="/bookings" class="text-center group cursor-pointer">
                    <p class="text-xl font-black text-gray-900 group-hover:text-[#0a8f96] transition-colors">{{ bookingCount() }}</p>
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ 'PROFILE.BOOKINGS' | translate }}</p>
                  </a>
                </div>
              </div>
            </div>

              <button (click)="auth.logout()" class="w-full bg-white hover:bg-red-50 border-2 border-red-50 text-red-500 font-black py-4.5 rounded-[22px] transition-all flex items-center justify-center gap-3 active:scale-95">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                {{ 'PROFILE.LOGOUT' | translate }}
              </button>
            </div>

            <!-- Main Info Area -->
            <div class="lg:col-span-8 space-y-8">
              <div class="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-10 border-b border-gray-50 pb-6">
                  <h3 class="text-xl font-black text-gray-900">{{ 'PROFILE.PERSONAL_INFO' | translate }}</h3>
                  <a routerLink="/profile/edit" class="text-xs font-black text-[#0a8f96] hover:underline uppercase tracking-widest">{{ 'PROFILE.EDIT_BTN' | translate }}</a>
                </div>

                @if (profile(); as p) {
                  <div class="space-y-10">
                    <div>
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{{ 'PROFILE.BIO' | translate }}</label>
                      <p class="text-gray-700 text-base leading-loose font-medium bg-gray-50 p-6 rounded-[28px] border border-gray-100 italic">
                        {{ p.bio || ('PROFILE.NO_BIO' | translate) }}
                      </p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div class="bg-gray-50 p-6 rounded-[28px] border border-gray-50">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{{ 'PROFILE.PHONE' | translate }}</label>
                        <p class="text-gray-900 font-black text-lg">{{ p.phoneNumber || ('PROFILE.NOT_REGISTERED' | translate) }}</p>
                      </div>
                      <div class="bg-gray-50 p-6 rounded-[28px] border border-gray-50">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{{ 'PROFILE.CONTACT' | translate }}</label>
                        <p class="text-gray-900 font-black text-lg">{{ p.preferredContactMethod || ('PROFILE.EDIT.ROLES.EMAIL' | translate) }}</p>
                      </div>
                    </div>

                    <div class="bg-gray-50 p-6 rounded-[28px] border border-gray-50">
                      <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{{ 'PROFILE.MEMBER_SINCE' | translate }}</label>
                      <p class="text-gray-900 font-black text-lg">{{ p.createdOnUtc | localizedDate:'longDate' }}</p>
                    </div>
                  </div>
                } @else {
                  <div class="text-center py-20 bg-gray-50 rounded-[32px] border border-gray-100 border-dashed">
                    <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-6 shadow-sm">
                      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                    <p class="text-gray-500 font-bold text-lg mb-6">{{ 'PROFILE.COMPLETE_PROMPT' | translate }}</p>
                    <a routerLink="/profile/edit" class="bg-[#0a8f96] text-white font-black px-8 py-3.5 rounded-2xl shadow-xl shadow-[#0a8f96]/20 hover:scale-105 transition-transform inline-block">{{ 'PROFILE.COMPLETE_BTN' | translate }}</a>
                  </div>
                }
              </div>
              
              <!-- Account Security Card -->
              <div class="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-xl font-black text-gray-900">{{ 'PROFILE.SECURITY' | translate }}</h3>
                  <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 text-blue-500 rounded-xl flex items-center justify-center shadow-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                </div>
                <p class="text-sm text-gray-400 font-bold mb-8">{{ 'PROFILE.SECURITY_DESC' | translate }}</p>
                <div class="flex flex-col sm:flex-row gap-4">
                  <button (click)="showChangePassword.set(true)" class="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 font-black py-4 px-6 rounded-2xl text-xs transition-all text-center active:scale-95">{{ 'PROFILE.CHANGE_PW' | translate }}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Change Password Modal -->
      @if (showChangePassword()) {
        <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6 animate-fade-in">
          <div class="bg-white rounded-[32px] w-full max-w-md p-10 shadow-2xl animate-slide-up relative">
            <button (click)="showChangePassword.set(false)" class="absolute top-8 left-8 text-gray-400 hover:text-gray-900 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            
            <h3 class="text-2xl font-black text-gray-900 mb-2">{{ 'PROFILE.CHANGE_PW' | translate }}</h3>
            <p class="text-gray-400 font-bold text-xs mb-8 tracking-wide">{{ 'PROFILE.CHANGE_PW_SUB' | translate }}</p>
            
            <form (submit)="submitChangePassword($event)" class="space-y-6">
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pr-2">{{ 'PROFILE.CURRENT_PW' | translate }}</label>
                <input type="password" name="current" [(ngModel)]="pwForm.currentPassword" required
                       class="input-field">
              </div>
              
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pr-2">{{ 'PROFILE.NEW_PW' | translate }}</label>
                <input type="password" name="new" [(ngModel)]="pwForm.newPassword" required
                       class="input-field">
              </div>
              
              <div>
                <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 pr-2">{{ 'PROFILE.CONFIRM_PW' | translate }}</label>
                <input type="password" name="confirm" [(ngModel)]="pwForm.confirmPassword" required
                       class="input-field">
              </div>
              
              <button type="submit" [disabled]="changingPassword()"
                      class="btn-luxury w-full py-4.5 disabled:opacity-50">
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
            <button (click)="showFullImage.set(false)" class="absolute -top-16 right-0 text-white/70 hover:text-white transition-colors flex items-center gap-2 font-bold uppercase tracking-widest text-xs">
              <span>{{ 'PROFILE.CLOSE' | translate }}</span>
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <div class="bg-white p-2 rounded-[32px] shadow-2xl overflow-hidden ring-1 ring-white/20 flex items-center justify-center min-w-[200px] min-h-[200px]">
              @if (!imageError()) {
                <img [src]="profile()?.avatarUrl" (error)="imageError.set(true)" class="max-h-[70vh] w-auto rounded-[32px] object-contain shadow-inner bg-white">
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
