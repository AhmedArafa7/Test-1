import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { I18nFallbackService } from './i18n-fallback.service';

export class FallbackMissingTranslationHandler implements MissingTranslationHandler {
  constructor(private fallback: I18nFallbackService) {}

  handle(params: MissingTranslationHandlerParams): any {
    if (!params || !params.key) return '';

    const currentLang = this.fallback.getCurrentLang();
    const value = this.fallback.getFallbackValue(params.key);

    if (value) {
      const isDev = typeof console !== 'undefined';
      if (isDev) {
        console.warn(
          `[i18n] Missing key "${params.key}" in "${currentLang}", ` +
          `using "${this.fallback.getOtherLang()}" fallback.`
        );
      }
      this.fallback.recordMissingKey(params.key);
      return value;
    }

    this.fallback.recordMissingKey(params.key);
    if (typeof console !== 'undefined') {
      console.error(
        `[i18n] Missing key "${params.key}" in BOTH "${currentLang}" and "${this.fallback.getOtherLang()}".`
      );
    }
    return params.key;
  }
}
