import '@angular/compiler';
import { describe, expect, it } from 'vitest';

import { routes } from './app.routes';

describe('app routes', () => {
  it('keeps the home page public instead of capturing it with an agent-only wrapper', () => {
    const publicRoute = routes.find(route => route.path === '' && !route.canActivate);
    expect(publicRoute).toBeDefined();

    const homeRoute = publicRoute?.children?.find(route => route.path === '');
    expect(homeRoute?.canActivate).toBeUndefined();
  });

  it('protects explicit agent property routes without shadowing the public property detail route', () => {
    const publicRoute = routes.find(route => route.path === '' && !route.canActivate);
    const children = publicRoute?.children ?? [];

    const newPropertyRoute = children.find(route => route.path === 'properties/new');
    const editPropertyRoute = children.find(route => route.path === 'properties/:id/edit');
    const detailRouteIndex = children.findIndex(route => route.path === 'properties/:id');
    const newRouteIndex = children.findIndex(route => route.path === 'properties/new');
    const editRouteIndex = children.findIndex(route => route.path === 'properties/:id/edit');

    expect(newPropertyRoute?.canActivate?.length).toBeGreaterThan(0);
    expect(editPropertyRoute?.canActivate?.length).toBeGreaterThan(0);
    expect(newRouteIndex).toBeGreaterThanOrEqual(0);
    expect(editRouteIndex).toBeGreaterThanOrEqual(0);
    expect(detailRouteIndex).toBeGreaterThan(editRouteIndex);
  });
});
