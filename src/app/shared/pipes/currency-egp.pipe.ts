import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyEgp', standalone: true })
export class CurrencyEgpPipe implements PipeTransform {
  transform(value: any, maxDigits: number = 0): string {
    if (value == null || value === '' || value === 'NaN') return '—';
    
    // Parse numeric characters from string if necessary
    const cleaned = value.toString().replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    
    if (isNaN(num)) {
      // Return original value or Call for price fallback
      return value.toString().trim() || '—';
    }
    
    return new Intl.NumberFormat('en-EG', { 
      style: 'currency', 
      currency: 'EGP', 
      minimumFractionDigits: maxDigits, 
      maximumFractionDigits: maxDigits 
    }).format(num);
  }
}
