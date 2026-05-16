import { Component, OnInit, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

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
        <div class="ltr:text-left rtl:text-right mb-12">
          <h1 class="text-4xl font-black text-gray-900 tracking-tight mb-4">
            {{ 'SETTINGS.TITLE' | translate }}
          </h1>
          <p class="text-gray-500 text-sm font-medium">
            {{ 'SETTINGS.SUBTITLE' | translate }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-8">
          
          <!-- Language Selection -->
          <div class="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-10 border-b border-gray-50 pb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-[#0a8f96]/10 text-[#0a8f96] rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
                </div>
                <h3 class="text-xl font-black text-gray-900">
                  {{ 'SETTINGS.LANG_REGION' | translate }}
                </h3>
              </div>
            </div>

            <div class="space-y-6">
              <p class="text-sm text-gray-500 font-bold mb-4">
                {{ 'SETTINGS.CHOOSE_LANG' | translate }}
              </p>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button (click)="changeLang('ar')" 
                        [class.border-[#0a8f96]]="lang() === 'ar'" [class.bg-[#0a8f96]/5]="lang() === 'ar'"
                        class="flex items-center justify-between p-6 border-2 border-gray-50 rounded-3xl transition-all hover:border-[#0a8f96]/30 group">
                  <div class="flex items-center gap-4">
                    <span class="text-2xl">🇪🇬</span>
                    <div class="ltr:text-left rtl:text-right">
                      <p class="font-black text-gray-900">{{ 'SETTINGS.ARABIC' | translate }}</p>
                      <p class="text-xs text-gray-400 font-bold">{{ 'SETTINGS.ARABIC_DESC' | translate }}</p>
                    </div>
                  </div>
                  @if (lang() === 'ar') {
                    <div class="w-6 h-6 bg-[#0a8f96] text-white rounded-full flex items-center justify-center">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  }
                </button>

                <button (click)="changeLang('en')" 
                        [class.border-[#0a8f96]]="lang() === 'en'" [class.bg-[#0a8f96]/5]="lang() === 'en'"
                        class="flex items-center justify-between p-6 border-2 border-gray-50 rounded-3xl transition-all hover:border-[#0a8f96]/30 group">
                  <div class="flex items-center gap-4">
                    <span class="text-2xl">🇺🇸</span>
                    <div class="ltr:text-left rtl:text-right">
                      <p class="font-black text-gray-900">{{ 'SETTINGS.ENGLISH' | translate }}</p>
                      <p class="text-xs text-gray-400 font-bold">{{ 'SETTINGS.ENGLISH_DESC' | translate }}</p>
                    </div>
                  </div>
                  @if (lang() === 'en') {
                    <div class="w-6 h-6 bg-[#0a8f96] text-white rounded-full flex items-center justify-center">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                  }
                </button>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div class="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-10 border-b border-gray-50 pb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                </div>
                <h3 class="text-xl font-black text-gray-900">
                  {{ 'SETTINGS.NOTIFICATIONS' | translate }}
                </h3>
              </div>
              <a routerLink="/notifications" class="text-xs font-black text-[#0a8f96] hover:underline uppercase tracking-widest">
                {{ 'SETTINGS.VIEW_ALL' | translate }} →
              </a>
            </div>

            <div class="space-y-8">

              <!-- Master Toggle -->
              <div class="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                <div>
                  <p class="font-black text-gray-900 text-sm">{{ 'SETTINGS.ENABLE_NOTIFS' | translate }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ 'SETTINGS.ENABLE_NOTIFS_DESC' | translate }}</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" [(ngModel)]="prefs.enabled" (ngModelChange)="savePrefs()" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                </label>
              </div>

              @if (prefs.enabled) {
                <!-- Notification Types -->
                <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">{{ 'SETTINGS.TYPES' | translate }}</p>
                  <div class="space-y-4">
                    
                    <!-- New Message -->
                    <div class="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                      <div class="flex items-center gap-4">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 text-blue-500 flex items-center justify-center">
                          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                        </div>
                        <div>
                          <p class="font-bold text-gray-900 text-sm">{{ 'SETTINGS.NEW_MESSAGES' | translate }}</p>
                          <p class="text-xs text-gray-400">{{ 'SETTINGS.NEW_MESSAGES_DESC' | translate }}</p>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="prefs.newMessage" (ngModelChange)="savePrefs()" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                      </label>
                    </div>

                    <!-- Payment Update -->
                    <div class="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                      <div class="flex items-center gap-4">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-green-50 text-green-500 flex items-center justify-center">
                          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <div>
                          <p class="font-bold text-gray-900 text-sm">{{ 'SETTINGS.PAYMENT_UPDATES' | translate }}</p>
                          <p class="text-xs text-gray-400">{{ 'SETTINGS.PAYMENT_UPDATES_DESC' | translate }}</p>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="prefs.paymentUpdate" (ngModelChange)="savePrefs()" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                      </label>
                    </div>

                    <!-- Property Match -->
                    <div class="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                      <div class="flex items-center gap-4">
                        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 text-purple-500 flex items-center justify-center">
                          <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                        </div>
                        <div>
                          <p class="font-bold text-gray-900 text-sm">{{ 'SETTINGS.PROPERTY_MATCHES' | translate }}</p>
                          <p class="text-xs text-gray-400">{{ 'SETTINGS.PROPERTY_MATCHES_DESC' | translate }}</p>
                        </div>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="prefs.propertyMatch" (ngModelChange)="savePrefs()" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Display Options -->
                <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">{{ 'SETTINGS.DISPLAY_OPTIONS' | translate }}</p>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                      <div>
                        <p class="font-bold text-gray-900 text-sm">{{ 'SETTINGS.SOUND' | translate }}</p>
                        <p class="text-xs text-gray-400">{{ 'SETTINGS.SOUND_DESC' | translate }}</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="prefs.sound" (ngModelChange)="savePrefs()" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                      </label>
                    </div>
                    <div class="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                      <div>
                        <p class="font-bold text-gray-900 text-sm">{{ 'SETTINGS.SHOW_PREVIEW' | translate }}</p>
                        <p class="text-xs text-gray-400">{{ 'SETTINGS.SHOW_PREVIEW_DESC' | translate }}</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="prefs.showPreview" (ngModelChange)="savePrefs()" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- Quiet Hours -->
                <div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">{{ 'SETTINGS.QUIET_HOURS' | translate }}</p>
                  <div class="p-5 border border-gray-100 rounded-2xl space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <p class="font-bold text-gray-900 text-sm">{{ 'SETTINGS.ENABLE_QUIET' | translate }}</p>
                        <p class="text-xs text-gray-400">{{ 'SETTINGS.ENABLE_QUIET_DESC' | translate }}</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" [(ngModel)]="prefs.quietHoursEnabled" (ngModelChange)="savePrefs()" class="sr-only peer">
                        <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#0a8f96] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full"></div>
                      </label>
                    </div>
                    @if (prefs.quietHoursEnabled) {
                      <div class="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{{ 'SETTINGS.FROM' | translate }}</label>
                          <input type="time" [(ngModel)]="prefs.quietStart" (ngModelChange)="savePrefs()" 
                                 class="w-full p-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:border-[#0a8f96] focus:ring-1 focus:ring-[#0a8f96] outline-none transition-all">
                        </div>
                        <div>
                          <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{{ 'SETTINGS.TO' | translate }}</label>
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
  lang = signal('ar');
  saved = signal(false);
  prefs: NotificationPreferences = { ...DEFAULT_PREFS };

  private translate = inject(TranslateService);

  ngOnInit() {
    const savedLang = localStorage.getItem('app_lang');
    if (savedLang) {
      this.lang.set(savedLang);
      this.applyLang(savedLang);
    }
    this.loadPrefs();
  }

  changeLang(newLang: string) {
    this.lang.set(newLang);
    localStorage.setItem('app_lang', newLang);
    this.applyLang(newLang);
    window.location.reload();
  }

  private applyLang(lang: string) {
    // Note: Direction is now handled globally by LanguageService/AppComponent based on html lang attribute
    // But we still set it here just in case or for immediate feedback if reload is delayed
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
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
  }

  savePrefs() {
    localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }

  /** Static helper to read prefs anywhere without instantiating the component */
  static getPrefs(): NotificationPreferences {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
    } catch {
      return { ...DEFAULT_PREFS };
    }
  }
}
