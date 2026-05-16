import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col relative">
      <app-navbar class="fixed top-0 left-0 right-0 z-[100]" />
      <main class="flex-1 pt-[72px]">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
})
export class MainLayoutComponent {}
