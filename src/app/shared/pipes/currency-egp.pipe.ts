import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({ 
  name: 'currencyEgp', 
  standalone: true,
  pure: false 
})
export class CurrencyEgpPipe implements PipeTransform {
  private languageService = inject(LanguageService);

  transform(value: any, maxDigits: number = 0): string {
    if (value == null || value === '' || value === 'NaN') return '—';
    
    // Parse numeric characters from string if necessary
    const cleaned = value.toString().replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    
    if (isNaN(num)) {
      // Return original value or Call for price fallback
      return value.toString().trim() || '—';
    }
    
    const locale = this.languageService.currentLang() === 'ar' ? 'ar-EG' : 'en-EG';
    
    return new Intl.NumberFormat(locale, { 
      style: 'currency', 
      currency: 'EGP', 
      minimumFractionDigits: maxDigits, 
      maximumFractionDigits: maxDigits 
    }).format(num);
  }
}
