import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalImageService {
  private dbName = 'BaytologyLocalDB';
  private storeName = 'propertyImages';
  private queueStore = 'uploadQueue';
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
      if (!db.objectStoreNames.contains(this.queueStore)) {
        db.createObjectStore(this.queueStore, { autoIncrement: true });
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
  /** Add to background upload queue */
  async addToUploadQueue(propertyId: string, data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(this.queueStore, 'readwrite');
        const store = transaction.objectStore(this.queueStore);
        store.add({ propertyId, data, status: 'pending', timestamp: Date.now() });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }

  /** Get all pending uploads with their IDs */
  async getPendingUploads(): Promise<any[]> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.queueStore)) { resolve([]); return; }
        const transaction = db.transaction(this.queueStore, 'readonly');
        const store = transaction.objectStore(this.queueStore);
        
        const results: any[] = [];
        const cursorRequest = store.openCursor();
        
        cursorRequest.onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor) {
            results.push({ id: cursor.key, ...cursor.value });
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        cursorRequest.onerror = () => resolve([]);
      };
      request.onerror = () => resolve([]);
    });
  }

  /** Remove from queue after success */
  async removeFromQueue(id: number): Promise<void> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(this.queueStore, 'readwrite');
        const store = transaction.objectStore(this.queueStore);
        store.delete(id);
        transaction.oncomplete = () => resolve();
      };
    });
  }
}

