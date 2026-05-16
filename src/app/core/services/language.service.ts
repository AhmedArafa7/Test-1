import { Injectable, signal, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type Language = 'ar' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly LANG_KEY = 'baytology_lang';
  
  currentLang = signal<Language>('ar');
  isRtl = signal<boolean>(true);

  constructor(
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  init() {
    const savedLang = localStorage.getItem(this.LANG_KEY) as Language;
    const defaultLang: Language = savedLang || 'ar';
    this.setLanguage(defaultLang);
  }

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
    this.isRtl.set(lang === 'ar');

    // Update ngx-translate
    this.translate.use(lang);
    this.translate.setDefaultLang(lang);

    // Update DOM attributes for RTL/LTR support
    const html = this.document.documentElement;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    html.lang = lang;

    // Update body class for font-switching (as suggested by user)
    const body = this.document.body;
    body.classList.remove('lang-ar', 'lang-en');
    body.classList.add(`lang-${lang}`);

    // Persist choice
    localStorage.setItem(this.LANG_KEY, lang);
  }

  toggleLanguage() {
    const nextLang: Language = this.currentLang() === 'ar' ? 'en' : 'ar';
    this.setLanguage(nextLang);
  }
}
