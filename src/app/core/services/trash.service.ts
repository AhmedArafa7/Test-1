import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TrashItem, TrashImageData, TrashPropertyData } from '../models';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

const STORAGE_KEY = 'baytology_trash';
const MAX_LOCAL_ITEMS = 50;
const TTL_DAYS = 30;

@Injectable({ providedIn: 'root' })
export class TrashService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Trash`;

  private _items = signal<TrashItem[]>([]);
  readonly items = this._items.asReadonly();

  constructor() {
    this.loadFromLocal();
  }

  private loadFromLocal(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const all: TrashItem[] = JSON.parse(raw);
      const now = new Date().toISOString();
      const valid = all.filter(item => item.expiresAt > now);
      if (valid.length !== all.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
      }
      this._items.set(valid);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private saveToLocal(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._items()));
    } catch {
      // localStorage full — remove oldest items
      const sorted = [...this._items()].sort((a, b) => a.deletedAt.localeCompare(b.deletedAt));
      const trimmed = sorted.slice(0, MAX_LOCAL_ITEMS);
      this._items.set(trimmed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    }
  }

  addImage(imageId: string, imageUrl: string, propertyId: string, propertyTitle: string): void {
    const now = new Date();
    const expires = new Date(now.getTime() + TTL_DAYS * 24 * 60 * 60 * 1000);
    const item: TrashItem<TrashImageData> = {
      id: crypto.randomUUID(),
      type: 'image',
      data: { imageId, imageUrl, propertyId, propertyTitle },
      deletedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      synced: false,
    };
    this._items.update(items => [item, ...items].slice(0, MAX_LOCAL_ITEMS));
    this.saveToLocal();
    this.syncToApi(item).then(() => {
      this._items.update(items => items.map(i => i.id === item.id ? { ...i, synced: true } : i));
      this.saveToLocal();
    }).catch(() => {});
  }

  addProperty(propertyId: string, propertyTitle: string, propertyImageUrl?: string): void {
    const now = new Date();
    const expires = new Date(now.getTime() + TTL_DAYS * 24 * 60 * 60 * 1000);
    const item: TrashItem<TrashPropertyData> = {
      id: crypto.randomUUID(),
      type: 'property',
      data: { propertyId, propertyTitle, propertyImageUrl },
      deletedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      synced: false,
    };
    this._items.update(items => [item, ...items].slice(0, MAX_LOCAL_ITEMS));
    this.saveToLocal();
    this.syncToApi(item).then(() => {
      this._items.update(items => items.map(i => i.id === item.id ? { ...i, synced: true } : i));
      this.saveToLocal();
    }).catch(() => {});
  }

  remove(id: string): void {
    this._items.update(items => items.filter(i => i.id !== id));
    this.saveToLocal();
    firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`)).catch(() => {});
  }

  restoreItem(item: TrashItem): void {
    this._items.update(items => items.filter(i => i.id !== item.id));
    this.saveToLocal();
  }

  clearExpired(): void {
    const now = new Date().toISOString();
    this._items.update(items => items.filter(i => i.expiresAt > now));
    this.saveToLocal();
  }

  private async syncToApi(item: TrashItem): Promise<void> {
    await firstValueFrom(this.http.post(this.apiUrl, item));
  }

  async fetchFromApi(): Promise<void> {
    try {
      const remote = await firstValueFrom(this.http.get<TrashItem[]>(this.apiUrl));
      if (!remote || remote.length === 0) return;
      const local = this._items();
      const merged = [...local];
      for (const r of remote) {
        if (!local.find(l => l.id === r.id)) {
          merged.push(r);
        }
      }
      const now = new Date().toISOString();
      this._items.set(merged.filter(i => i.expiresAt > now).slice(0, MAX_LOCAL_ITEMS));
      this.saveToLocal();
    } catch {
      // API not available — local only
    }
  }
}
