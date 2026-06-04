import { Injectable } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NavigationHistoryService {
  private history: string[] = [];

  constructor(private router: Router) {}

  public init(): void {
    this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Only track different URLs to avoid duplicate entries from anchor hashes/fragment updates
        const url = event.urlAfterRedirects;
        if (this.history.length === 0 || this.history[this.history.length - 1] !== url) {
          this.history.push(url);
        }
      });
  }

  public getPreviousUrl(): string | null {
    if (this.history.length > 1) {
      return this.history[this.history.length - 2];
    }
    return null;
  }
}
