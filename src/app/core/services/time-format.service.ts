import { inject, Injectable, signal } from '@angular/core';

const TIME_FORMAT_KEY = 'baytology_time_format';

export type TimeFormat = '12h' | '24h';

@Injectable({ providedIn: 'root' })
export class TimeFormatService {
  private timeFormat = signal<TimeFormat>(this.loadFormat());

  get format(): TimeFormat {
    return this.timeFormat();
  }

  is24Hour(): boolean {
    return this.timeFormat() === '24h';
  }

  toggleFormat(): void {
    const newFormat = this.timeFormat() === '12h' ? '24h' : '12h';
    this.timeFormat.set(newFormat);
    localStorage.setItem(TIME_FORMAT_KEY, newFormat);
  }

  private loadFormat(): TimeFormat {
    try {
      const saved = localStorage.getItem(TIME_FORMAT_KEY);
      if (saved === '12h' || saved === '24h') {
        return saved;
      }
    } catch {}
    return '24h';
  }
}

export function getTimeFormat(): TimeFormat {
  try {
    const saved = localStorage.getItem(TIME_FORMAT_KEY);
    if (saved === '12h' || saved === '24h') {
      return saved;
    }
  } catch {}
  return '24h';
}