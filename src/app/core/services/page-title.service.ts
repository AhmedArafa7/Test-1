import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  private readonly siteName = 'baytology';
  private siteTagline = '';

  init() {
    // React to language changes
    this.translate.onLangChange.subscribe(() => {
      this.refreshCurrentTitle();
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      filter(route => route.outlet === 'primary'),
      mergeMap(route => route.data)
    ).subscribe(data => {
      const titleKey = data['title'];
      if (titleKey) {
        this.translate.get(titleKey).subscribe(translated => {
          this.updateTitle(translated);
        });
      } else {
        this.translate.get('COMMON.TAGLINE').subscribe(tagline => {
          this.siteTagline = tagline;
          this.titleService.setTitle(`${this.siteName} — ${tagline}`);
        });
      }
    });
  }

  private refreshCurrentTitle() {
    let route = this.activatedRoute.root;
    while (route.firstChild) route = route.firstChild;
    const titleKey = route.snapshot.data['title'];
    if (titleKey) {
      this.translate.get(titleKey).subscribe(translated => this.updateTitle(translated));
    } else {
      this.translate.get('COMMON.TAGLINE').subscribe(tagline => {
        this.titleService.setTitle(`${this.siteName} — ${tagline}`);
      });
    }
  }

  updateTitle(title: string, suffix = true) {
    const fullTitle = suffix ? `${title} | ${this.siteName}` : title;
    this.titleService.setTitle(fullTitle);
    this.updateMeta('og:title', fullTitle);
  }

  updateMeta(name: string, content: string) {
    if (name.startsWith('og:')) {
      this.metaService.updateTag({ property: name, content });
    } else {
      this.metaService.updateTag({ name, content });
    }
  }

  setFullSEO(title: string, description: string, image?: string) {
    this.updateTitle(title);
    this.updateMeta('description', description);
    this.updateMeta('og:description', description);
    if (image) {
      this.updateMeta('og:image', image);
    }
    this.updateMeta('og:type', 'website');
    this.updateMeta('og:url', window.location.href);
  }
}
