import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';
import { ToastService } from '../../core/services/toast.service';

export interface NotificationPreferences {
  enabled: boolean;
  newMessage: boolean;
  paymentUpdate: boolean;
  propertyMatch: boolean;
  sound: boolean;
  showPreview: boolean;
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
}

const DEFAULT_PREFS: NotificationPreferences = {
  enabled: true,
  newMessage: true,
  paymentUpdate: true,
  propertyMatch: true,
  sound: true,
  showPreview: true,
  quietHoursEnabled: false,
  quietStart: '23:00',
  quietEnd: '07:00',
};

const PREFS_KEY = 'baytology_notification_prefs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslateModule, CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#f0f4f5] to-[#f8f9fa] font-sans py-16 px-6">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {{ 'SETTINGS.TITLE' | translate }}
          </h1>
          <p class="text-slate-400 text-sm font-bold">
            {{ 'SETTINGS.SUBTITLE' | translate }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8">
          
          <!-- Language Selection -->
          <div class="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)]">
            <div class="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
              <div class="flex items-center gap-3 text-[#0a8f96]">
                <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
                <h3 class="text-lg font-black text-slate-900">
                  {{ 'SETTINGS.LANG_REGION' | translate }}
                </h3>
              </div>
            </div>

            <div class="space-y-5">
              <p class="text-xs text-slate-400 font-bold mb-3">
                {{ 'SETTINGS.CHOOSE_LANG' | translate }}
              </p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button (click)="changeLang('ar')" 
                        [class.border-[#0a8f96]]="lang() === 'ar'" 
                        [class.bg-[#0a8f96]/5]="lang() === 'ar'"
                        [class.border-slate-100]="lang() !== 'ar'"
                        class="flex items-center justify-between p-5 border-2 rounded-3xl transition-all hover:border-[#0a8f96]/30 group cursor-pointer">
                  <div class="flex items-center gap-4">
                    <span class="text-2xl">🇪🇬</span>
                    <div class="ltr:text-left rtl:text-right">
                      <p class="font-black text-slate-900">{{ 'SETTINGS.ARABIC' | translate }}</p>
                      <p class="text-xs text-slate-400 font-bold">{{ 'SETTINGS.ARABIC_DESC' | translate }}</p>
                    </div>
                  </div>
                  @if (lang() === 'ar') {
                    <div class="w-6 h-6 bg-[#0a8f96] text-white rounded-full flex items-center justify-center shadow-sm shadow-[#0a8f96]/20">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  }
                </button>

                <button (click)="changeLang('en')" 
                        [class.border-[#0a8f96]]="lang() === 'en'" 
                        [class.bg-[#0a8f96]/5]="lang() === 'en'"
                        [class.border-slate-100]="lang() !== 'en'"
                        class="flex items-center justify-between p-5 border-2 rounded-3xl transition-all hover:border-[#0a8f96]/30 group cursor-pointer">
                  <div class="flex items-center gap-4">
                    <span class="text-2xl">🇺🇸</span>
                    <div class="ltr:text-left rtl:text-right">
                      <p class="font-black text-slate-900">{{ 'SETTINGS.ENGLISH' | translate }}</p>
                      <p class="text-xs text-slate-400 font-bold">{{ 'SETTINGS.ENGLISH_DESC' | translate }}</p>
                    </div>
                  </div>
                  @if (lang() === 'en') {
                    <div class="w-6 h-6 bg-[#0a8f96] text-white rounded-full flex items-center justify-center shadow-sm shadow-[#0a8f96]/20">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  }
                </button>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div class="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)]">
            <div class="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
              <div class="flex items-center gap-3 text-amber-500">
                <svg class="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                <h3 class="text-lg font-black text-slate-900">
                  {{ 'SETTINGS.NOTIFICATIONS' | translate }}
                </h3>
              </div>
              <a routerLink="/notifications" class="text-xs font-black text-[#0a8f96] hover:underline uppercase tracking-widest flex items-center gap-1">
                {{ 'SETTINGS.VIEW_ALL' | translate }} {{ lang() === 'ar' ? '←' : '→' }}
              </a>
            </div>

            <div class="space-y-8">

              <!-- Master Toggle -->
              <div class="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.005)]">
                <div>
                  <p class="font-black text-slate-900 text-sm">{{ 'SETTINGS.ENABLE_NOTIFS' | translate }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ 'SETTINGS.ENABLE_NOTIFS_DESC' | translate }}</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [(ngModel)]="prefs.enabled" (ngModelChange)="savePrefs()" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                </label>
              </div>

              @if (prefs.enabled) {
                <!-- Notification Types -->
                <div class="space-y-4">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'SETTINGS.TYPES' | translate }}</p>
                  
                  <div class="divide-y divide-slate-100/80 border-b border-slate-100/80 pb-2">
                    <!-- New Message -->
                    <div class="flex items-center justify-between py-4">
                      <div class="flex items-center gap-4">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-500 flex items-center justify-center">
                          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                        </div>
                        <div>
                          <p class="font-bold text-slate-900 text-sm">{{ 'SETTINGS.NEW_MESSAGES' | translate }}</p>
                          <p class="text-xs text-slate-400 mt-0.5">{{ 'SETTINGS.NEW_MESSAGES_DESC' | translate }}</p>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="prefs.newMessage" (ngModelChange)="savePrefs()" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                      </label>
                    </div>

                    <!-- Payment Update -->
                    <div class="flex items-center justify-between py-4">
                      <div class="flex items-center gap-4">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-green-50 text-green-500 flex items-center justify-center">
                          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <div>
                          <p class="font-bold text-slate-900 text-sm">{{ 'SETTINGS.PAYMENT_UPDATES' | translate }}</p>
                          <p class="text-xs text-slate-400 mt-0.5">{{ 'SETTINGS.PAYMENT_UPDATES_DESC' | translate }}</p>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="prefs.paymentUpdate" (ngModelChange)="savePrefs()" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                      </label>
                    </div>

                    <!-- Property Match -->
                    <div class="flex items-center justify-between py-4">
                      <div class="flex items-center gap-4">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 text-purple-500 flex items-center justify-center">
                          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        </div>
                        <div>
                          <p class="font-bold text-slate-900 text-sm">{{ 'SETTINGS.PROPERTY_MATCHES' | translate }}</p>
                          <p class="text-xs text-slate-400 mt-0.5">{{ 'SETTINGS.PROPERTY_MATCHES_DESC' | translate }}</p>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="prefs.propertyMatch" (ngModelChange)="savePrefs()" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Display Options -->
                <div class="space-y-4">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'SETTINGS.DISPLAY_OPTIONS' | translate }}</p>
                  
                  <div class="divide-y divide-slate-100/80 border-b border-slate-100/80 pb-2">
                    <div class="flex items-center justify-between py-4">
                      <div>
                        <p class="font-bold text-slate-900 text-sm">{{ 'SETTINGS.SOUND' | translate }}</p>
                        <p class="text-xs text-slate-400 mt-0.5">{{ 'SETTINGS.SOUND_DESC' | translate }}</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="prefs.sound" (ngModelChange)="saveSoundPreference($event)" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                      </label>
                    </div>

                    <!-- Sound Selection Subpanel -->
                    @if (prefs.sound) {
                      <div class="py-4 px-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 mb-4 ltr:text-left rtl:text-right">
                        <label class="block text-xs font-bold text-slate-700 mb-1">{{ 'SETTINGS.CHOOSE_SOUND_LABEL' | translate }}</label>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <button type="button"
                                  (click)="changeSoundType('premium')"
                                  [class.bg-[#0a8f96]]="soundType() === 'premium'"
                                  [class.text-white]="soundType() === 'premium'"
                                  [class.bg-white]="soundType() !== 'premium'"
                                  [class.text-gray-700]="soundType() !== 'premium'"
                                  [class.border-gray-200]="soundType() !== 'premium'"
                                  class="px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95">
                            <span>{{ 'SETTINGS.SOUND_PREMIUM_NAME' | translate }}</span>
                          </button>

                          <button type="button"
                                  (click)="changeSoundType('pop')"
                                  [class.bg-[#0a8f96]]="soundType() === 'pop'"
                                  [class.text-white]="soundType() === 'pop'"
                                  [class.bg-white]="soundType() !== 'pop'"
                                  [class.text-gray-700]="soundType() !== 'pop'"
                                  [class.border-gray-200]="soundType() !== 'pop'"
                                  class="px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95">
                            <span>{{ 'SETTINGS.SOUND_POP_NAME' | translate }}</span>
                          </button>

                          <button type="button"
                                  (click)="changeSoundType('classic')"
                                  [class.bg-[#0a8f96]]="soundType() === 'classic'"
                                  [class.text-white]="soundType() === 'classic'"
                                  [class.bg-white]="soundType() !== 'classic'"
                                  [class.text-gray-700]="soundType() !== 'classic'"
                                  [class.border-gray-200]="soundType() !== 'classic'"
                                  class="px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95">
                            <span>{{ 'SETTINGS.SOUND_CLASSIC_NAME' | translate }}</span>
                          </button>

                          <button type="button"
                                  (click)="changeSoundType('custom')"

                                  [class.bg-[#0a8f96]]="soundType() === 'custom'"
                                  [class.text-white]="soundType() === 'custom'"
                                  [class.bg-white]="soundType() !== 'custom'"
                                  [class.text-gray-700]="soundType() !== 'custom'"
                                  [class.border-gray-200]="soundType() !== 'custom'"

                                  class="px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between shadow-sm active:scale-95">
                            <span class="truncate">{{ 'SETTINGS.SOUND_CUSTOM_NAME' | translate }}</span>
                          </button>











                        </div>

                        <!-- Upload custom file input -->
                        <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
                          <input type="file" #soundUploadInput (change)="onCustomSoundUploaded($event)" class="hidden" accept="audio/*">
                          <button type="button" (click)="soundUploadInput.click()" 
                                  class="w-full sm:w-auto px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer">
                            {{ 'SETTINGS.UPLOAD_SOUND_BTN' | translate }}
                          </button>
                          @if (hasCustomSound()) {
                            <span class="text-[10px] text-slate-400 font-bold max-w-[200px] truncate">
                              {{ 'SETTINGS.CUSTOM_SOUND_NAME_LABEL' | translate }}{{ customSoundName() }}
                            </span>
                          }
                          <div class="flex-1"></div>
                          <button type="button" (click)="playNotificationSound()"
                                  class="w-full sm:w-auto px-4 py-2 bg-[#0a8f96]/10 hover:bg-[#0a8f96]/20 text-[#0a8f96] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer">
                            {{ 'SETTINGS.PLAY_SOUND_BTN' | translate }}
                          </button>
                        </div>
                      </div>
                    }
                    <div class="flex items-center justify-between py-4">
                      <div>
                        <p class="font-bold text-slate-900 text-sm">{{ 'SETTINGS.SHOW_PREVIEW' | translate }}</p>
                        <p class="text-xs text-slate-400 mt-0.5">{{ 'SETTINGS.SHOW_PREVIEW_DESC' | translate }}</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="prefs.showPreview" (ngModelChange)="savePrefs()" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Quiet Hours -->
                <div class="space-y-4">
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ 'SETTINGS.QUIET_HOURS' | translate }}</p>
                  <div class="p-5 bg-white border border-slate-100 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.005)] space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-bold text-slate-900 text-sm">{{ 'SETTINGS.ENABLE_QUIET' | translate }}</p>
                        <p class="text-xs text-slate-400 mt-1">{{ 'SETTINGS.ENABLE_QUIET_DESC' | translate }}</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="prefs.quietHoursEnabled" (ngModelChange)="savePrefs()" class="sr-only peer">
                        <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                      </label>
                    </div>
                    @if (prefs.quietHoursEnabled) {
                      <div class="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'SETTINGS.FROM' | translate }}</label>
                          <input type="time" [(ngModel)]="prefs.quietStart" (ngModelChange)="savePrefs()" 
                                 class="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:border-[#0a8f96] focus:ring-1 focus:ring-[#0a8f96] outline-none transition-all">
                        </div>
                        <div>
                          <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{{ 'SETTINGS.TO' | translate }}</label>
                          <input type="time" [(ngModel)]="prefs.quietEnd" (ngModelChange)="savePrefs()" 
                                 class="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:border-[#0a8f96] focus:ring-1 focus:ring-[#0a8f96] outline-none transition-all">
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              <!-- Save Confirmation -->
              @if (saved()) {
                <div class="flex items-center gap-2 text-[#0a8f96] text-xs font-black animate-[fadeInUp_0.3s_ease]">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  {{ 'SETTINGS.SAVED_AUTO' | translate }}
                </div>
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class SettingsComponent implements OnInit {
  private languageService = inject(LanguageService);
  private toast = inject(ToastService);
  private translate = inject(TranslateService);

  lang = this.languageService.currentLang;
  saved = signal(false);
  prefs: NotificationPreferences = { ...DEFAULT_PREFS };

  soundType = signal<'premium' | 'pop' | 'classic' | 'custom' | 'none'>('premium');
  customSoundName = signal<string>('');
  hasCustomSound = signal<boolean>(false);

  ngOnInit() {
    this.loadPrefs();

    const savedType = localStorage.getItem('baytology_sound_type') as any;
    if (savedType) {
      this.soundType.set(savedType);
    }
    const savedName = localStorage.getItem('baytology_custom_sound_name');
    if (savedName) {
      this.customSoundName.set(savedName);
    }
    this.hasCustomSound.set(!!localStorage.getItem('baytology_custom_sound_data'));
  }

  changeLang(newLang: string) {
    this.languageService.setLanguage(newLang as any);
  }

  loadPrefs() {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        this.prefs = { ...DEFAULT_PREFS, ...JSON.parse(raw) };
      }
    } catch {
      this.prefs = { ...DEFAULT_PREFS };
    }

    const soundEnabled = localStorage.getItem('baytology_sound_enabled');
    if (soundEnabled != null) {
      this.prefs.sound = soundEnabled === 'true';
    }
  }

  savePrefs() {
    localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }

  saveSoundPreference(enabled: boolean) {
    this.prefs.sound = enabled;
    localStorage.setItem('baytology_sound_enabled', enabled ? 'true' : 'false');
    this.savePrefs();
    if (enabled) {
      this.playNotificationSound();
    }
  }

  changeSoundType(type: 'premium' | 'pop' | 'classic' | 'custom' | 'none') {
    if (type === 'custom' && !this.hasCustomSound()) {
      this.toast.error(this.translate.instant('SETTINGS.NO_CUSTOM_TONE'));
      return;
    }
    this.soundType.set(type);
    localStorage.setItem('baytology_sound_type', type);
    if (type !== 'none') {
      this.playNotificationSound();
    }
  }

  onCustomSoundUploaded(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      this.toast.error(this.translate.instant('SETTINGS.INVALID_AUDIO_FILE'));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.toast.error(this.translate.instant('SETTINGS.FILE_TOO_LARGE'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64Data = e.target.result;
      try {
        localStorage.setItem('baytology_custom_sound_data', base64Data);
        localStorage.setItem('baytology_custom_sound_name', file.name);
        this.customSoundName.set(file.name);
        this.hasCustomSound.set(true);
        
        this.changeSoundType('custom');
        this.toast.success(this.translate.instant('SETTINGS.CUSTOM_TONE_UPLOAD_SUCCESS'));
      } catch (err) {
        this.toast.error(this.translate.instant('SETTINGS.CUSTOM_TONE_SAVE_ERROR'));
      }
    };
    reader.readAsDataURL(file);
  }

  playNotificationSound() {
    try {
      const soundType = this.soundType();

      if (soundType === 'none') {
        return;
      }

      if (soundType === 'custom') {
        const customData = localStorage.getItem('baytology_custom_sound_data');
        if (customData) {
          const audio = new Audio(customData);
          audio.volume = 0.5;
          audio.play().catch(e => console.warn('Custom audio playback failed:', e));
          return;
        } else {
          this.soundType.set('premium');
          this.hasCustomSound.set(false);
          this.customSoundName.set('');
          localStorage.removeItem('baytology_custom_sound_name');
          localStorage.setItem('baytology_sound_type', 'premium');
          
          this.toast.error(this.translate.instant('SETTINGS.CUSTOM_TONE_MISSING'));
          
          setTimeout(() => this.playNotificationSound(), 100);
          return;
        }
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      if (soundType === 'premium') {
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + duration);
        };
        playTone(880, ctx.currentTime, 0.4);
        playTone(1320, ctx.currentTime + 0.08, 0.5);
      } else if (soundType === 'pop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (soundType === 'classic') {
        const playBeep = (start: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(2000, start);
          gain.gain.setValueAtTime(0.04, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(start);
          osc.stop(start + 0.1);
        };
        playBeep(ctx.currentTime);
        playBeep(ctx.currentTime + 0.12);
      }
    } catch (err) {
      console.warn('Audio playback failed:', err);
    }
  }
  static getPrefs(): NotificationPreferences {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
    } catch {
      return { ...DEFAULT_PREFS };
    }
  }
}
