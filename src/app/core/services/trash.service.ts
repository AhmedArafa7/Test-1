import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TrashItem, TrashImageData, TrashPropertyData, CreatePropertyRequest } from '../models';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { firstValueFrom } from 'rxjs';

const STORAGE_KEY = 'baytology_trash';
const MAX_LOCAL_ITEMS = 50;
const TTL_DAYS = 30;

@Injectable({ providedIn: 'root' })
export class TrashService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/Trash`;

  private _items = signal<TrashItem[]>([]);
  readonly items = this._items.asReadonly();

  constructor() {
    // Automatically reload or clear trash items when the logged-in user changes
    effect(() => {
      const userId = this.auth.userId();
      if (userId) {
        this.loadFromLocal();
        this.fetchFromApi();
      } else {
        this._items.set([]);
      }
    });
  }

  private getStorageKey(): string {
    const userId = this.auth.userId();
    return userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
  }

  private loadFromLocal(): void {
    const userId = this.auth.userId();
    if (!userId) {
      this._items.set([]);
      return;
    }

    try {
      const userKey = this.getStorageKey();
      let raw = localStorage.getItem(userKey);

      // Migration: check if there are legacy items in the shared/global key
      const legacyRaw = localStorage.getItem(STORAGE_KEY);
      if (legacyRaw) {
        try {
          const legacyItems: TrashItem[] = JSON.parse(legacyRaw);
          if (legacyItems && legacyItems.length > 0) {
            const existingUserItems: TrashItem[] = raw ? JSON.parse(raw) : [];
            const merged = [...existingUserItems];
            for (const item of legacyItems) {
              if (!merged.find(m => m.id === item.id)) {
                merged.push(item);
              }
            }
            raw = JSON.stringify(merged);
            localStorage.setItem(userKey, raw);
          }
        } catch (e) {
          console.error('Migration of legacy trash items failed:', e);
        } finally {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      if (!raw) {
        this._items.set([]);
        return;
      }

      const all: TrashItem[] = JSON.parse(raw);
      const now = new Date().toISOString();
      const valid = all.filter(item => item.expiresAt > now);
      if (valid.length !== all.length) {
        localStorage.setItem(userKey, JSON.stringify(valid));
      }
      this._items.set(valid);
    } catch {
      localStorage.removeItem(this.getStorageKey());
      this._items.set([]);
    }
  }

  private saveToLocal(): void {
    const userId = this.auth.userId();
    if (!userId) return;

    try {
      const key = this.getStorageKey();
      localStorage.setItem(key, JSON.stringify(this._items()));
    } catch {
      // localStorage full — remove oldest items
      const sorted = [...this._items()].sort((a, b) => a.deletedAt.localeCompare(b.deletedAt));
      const trimmed = sorted.slice(0, MAX_LOCAL_ITEMS);
      this._items.set(trimmed);
      localStorage.setItem(this.getStorageKey(), JSON.stringify(trimmed));
    }
  }

  addImage(imageId: string, imageUrl: string, propertyId: string, propertyTitle: string): void {
    const userId = this.auth.userId();
    if (!userId) return;

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

  addProperty(propertyId: string, propertyTitle: string, propertyImageUrl: string | undefined, createRequest: CreatePropertyRequest): void {
    const userId = this.auth.userId();
    if (!userId) return;

    const now = new Date();
    const expires = new Date(now.getTime() + TTL_DAYS * 24 * 60 * 60 * 1000);
    const item: TrashItem<TrashPropertyData> = {
      id: crypto.randomUUID(),
      type: 'property',
      data: { propertyId, propertyTitle, propertyImageUrl, createRequest },
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
    const userId = this.auth.userId();
    if (!userId) return;

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
