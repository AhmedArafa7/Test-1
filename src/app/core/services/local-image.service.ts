import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalImageService {
  private dbName = 'BaytologyLocalDB';
  private storeName = 'propertyImages';
  private thumbPrefix = 'bayt_thumb_';

  constructor() {
    this.initDB();
  }

  private initDB() {
    const request = indexedDB.open(this.dbName, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        db.createObjectStore(this.storeName);
      }
    };
  }

  async saveImages(propertyId: string, images: string[]): Promise<void> {
    // Also cache the first image as thumbnail for quick access
    if (images.length > 0) {
      this.saveThumbnail(propertyId, images[0]);
    }
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.put(images, propertyId);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }

  async getImages(propertyId: string): Promise<string[] | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const getRequest = store.get(propertyId);
        getRequest.onsuccess = () => resolve(getRequest.result || null);
        getRequest.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    });
  }

  /** Save a single thumbnail URL for fast cross-page access */
  saveThumbnail(propertyId: string, url: string): void {
    try {
      localStorage.setItem(this.thumbPrefix + propertyId, url);
    } catch {}
  }

  /** Get cached thumbnail URL */
  getThumbnail(propertyId: string): string | null {
    try {
      return localStorage.getItem(this.thumbPrefix + propertyId);
    } catch {
      return null;
    }
  }
}

