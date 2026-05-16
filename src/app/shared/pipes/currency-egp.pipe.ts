import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyEgp', standalone: true })
export class CurrencyEgpPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
}
