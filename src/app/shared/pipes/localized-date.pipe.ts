import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';

@Pipe({
  name: 'localizedDate',
  standalone: true,
  pure: false
})
export class LocalizedDatePipe implements PipeTransform {
  private languageService = inject(LanguageService);
  private datePipe = new DatePipe('en-US');

  transform(value: any, format: string = 'mediumDate'): any {
    if (!value) return null;
    
    // Use the current language from LanguageService as the locale
    const currentLang = this.languageService.currentLang();
    
    return this.datePipe.transform(value, format, '', currentLang);
  }
}
