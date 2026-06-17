import { TranslateService } from '@ngx-translate/core';

const VALID_KEY = /^[A-Za-z0-9_.]+$/;

export function extractApiError(error: any, translate: TranslateService): string | null {
  if (!error) return null;

  const httpError = error.error || error;
  const candidates: string[] = [];

  if (httpError.code) candidates.push(httpError.code);
  if (httpError.detail) candidates.push(httpError.detail);
  if (httpError.title) candidates.push(httpError.title);
  if (httpError.message) candidates.push(httpError.message);
  if (httpError.type) candidates.push(httpError.type);
  if (typeof httpError === 'string') candidates.push(httpError);

  // Flatten validation errors object
  if (httpError.errors && typeof httpError.errors === 'object') {
    const keys = Object.keys(httpError.errors);
    if (keys.length > 0) {
      const firstVal = httpError.errors[keys[0]];
      const msg = Array.isArray(firstVal) ? firstVal[0] : (typeof firstVal === 'string' ? firstVal : null);
      if (msg) candidates.push(msg);
    }
  }

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'string') continue;
    const trimmed = candidate.trim();
    if (!trimmed) continue;

    if (VALID_KEY.test(trimmed)) {
      const translated = translate.instant('VALIDATION.' + trimmed);
      if (translated !== 'VALIDATION.' + trimmed) {
        return translated;
      }
      // Key is valid but not translated — keep as fallback
    } else if (trimmed.includes(' ')) {
      return trimmed;
    }
  }

  return null;
}