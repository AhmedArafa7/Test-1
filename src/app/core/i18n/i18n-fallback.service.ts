import { Injectable, Injector, inject } from '@angular/core';
import { TranslateService, TranslateStore } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class I18nFallbackService {
  private injector = inject(Injector);
  private missingKeys: Set<string> = new Set();

  private getTranslate(): TranslateService {
    return this.injector.get(TranslateService);
  }

  private getStore(): TranslateStore {
    return this.injector.get(TranslateStore);
  }

  getOtherLang(): 'ar' | 'en' {
    const current = this.getTranslate().currentLang;
    return current === 'ar' ? 'en' : 'ar';
  }

  getCurrentLang(): string {
    return this.getTranslate().currentLang || 'ar';
  }

  lookup(key: string, lang: 'ar' | 'en'): string | null {
    let dict: any;
    try {
      dict = this.getStore().getTranslations(lang) as any;
    } catch {
      return null;
    }
    if (!dict || typeof dict !== 'object' || Object.keys(dict).length === 0) {
      return null;
    }
    const parts = key.split('.');
    let cur: any = dict;
    for (const p of parts) {
      if (cur == null || typeof cur !== 'object') return null;
      cur = cur[p];
    }
    return typeof cur === 'string' ? cur : null;
  }

  getFallbackValue(key: string): string | null {
    const other = this.getOtherLang();
    return this.lookup(key, other);
  }

  recordMissingKey(key: string): void {
    this.missingKeys.add(key);
  }

  getMissingKeys(): string[] {
    return Array.from(this.missingKeys);
  }

  clearMissingKeys(): void {
    this.missingKeys.clear();
  }
}
