import { Component, effect, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container';
import { AuthService } from './core/auth/auth.service';
import { NotificationSignalRService } from './core/services/notification-signalr.service';
import { ProfileService } from './features/profile/services/profile.service';

import { LanguageService } from './core/services/language.service';
import { PageTitleService } from './core/services/page-title.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  template: `<router-outlet /><app-toast-container />`,
})
export class App {
  private activeToken: string | null = null;

  constructor(
    private languageService: LanguageService,
    private auth: AuthService,
    private profileService: ProfileService,
    private notificationService: NotificationSignalRService,
    private pageTitleService: PageTitleService,
  ) {
    // Centralized SEO & Title setup
    this.pageTitleService.init();
    // Centralized language & RTL setup
    this.languageService.init();

    effect(() => {
      const token = this.auth.token;

      if (!token) {
        this.activeToken = null;
        this.notificationService.setNotifications([]);
        void this.notificationService.disconnect();
        return;
      }

      if (this.activeToken === token) {
        return;
      }

      this.activeToken = token;
      void this.bootstrapAuthenticatedSession();
    });
  }

  private async bootstrapAuthenticatedSession() {
    await this.auth.loadCurrentUser();

    if (!this.auth.token) {
      return;
    }

    try {
      const res = await this.profileService.getNotifications(1, 10);
      this.notificationService.setNotifications(res.items);
    } catch {
      this.notificationService.setNotifications([]);
    }

    await this.notificationService.connect();
  }
}


