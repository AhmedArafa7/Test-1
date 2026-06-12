import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';
import { getTimeFormat } from '../../core/services/time-format.service';

@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false
})
export class LocalizedDatePipe implements PipeTransform {
  private languageService = inject(LanguageService);

  transform(value: any, format: string = 'mediumDate'): any {
    if (!value) return null;
    
    const currentLang = this.languageService.currentLang();
    const is24Hour = getTimeFormat() === '24h';
    
    let effectiveFormat = format;
    
    if (format === 'shortTime' || format === 'mediumTime' || format === 'longTime') {
      effectiveFormat = is24Hour ? 'HH:mm' : 'h:mm a';
    } else if (format === 'short') {
      effectiveFormat = is24Hour ? 'yyyy/MM/dd, HH:mm' : 'yyyy/MM/dd, h:mm a';
    } else if (format === 'medium') {
      effectiveFormat = is24Hour ? 'yyyy/MM/dd, HH:mm:ss' : 'yyyy/MM/dd, h:mm:ss a';
    }
    
    return new DatePipe(currentLang).transform(value, effectiveFormat, '', currentLang);
  }
}
