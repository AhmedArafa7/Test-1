import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  CreateAgentReviewRequest,
  CreatePropertyRequest,
  GetPropertiesParams,
  PaginatedList,
  Property,
  PropertyListItem,
  UpdatePropertyRequest,
} from '../../../core/models';

import { signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private url = `${environment.apiUrl}/properties`;
  private readonly validPropertyTypes = new Set(['Apartment', 'Villa', 'Office', 'Land']);
  private readonly validListingTypes = new Set(['Sale', 'Rent']);
  
  
  // Cache for saved property IDs to avoid repeated full-sync calls
  private _savedIds = signal<Set<string>>(new Set());
  readonly savedIds = this._savedIds.asReadonly();

  constructor(private http: HttpClient) {}

  async getAll(params: GetPropertiesParams = {}): Promise<PaginatedList<PropertyListItem>> {
    let httpParams = new HttpParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== '') {
        if (key === 'propertyType' && !this.validPropertyTypes.has(value.toString())) return;
        if (key === 'listingType' && !this.validListingTypes.has(value.toString())) return;
        
        httpParams = httpParams.set(key, value.toString());
      }
    });

    return firstValueFrom(this.http.get<PaginatedList<PropertyListItem>>(this.url, { params: httpParams }));
  }

  async getById(id: string): Promise<Property> {
    return firstValueFrom(this.http.get<Property>(`${this.url}/${id}`));
  }

  async create(request: CreatePropertyRequest): Promise<{ id: string }> {
    return firstValueFrom(this.http.post<{ id: string }>(this.url, request));
  }

  async update(id: string, request: UpdatePropertyRequest): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.url}/${id}`, request));
  }

  async delete(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${id}`));
  }

  async addImages(id: string, imageUrls: string[]): Promise<void> {
    return firstValueFrom(this.http.post<void>(`${this.url}/${id}/images`, { imageUrls }));
  }

  async deleteImage(propertyId: string, imageId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.url}/${propertyId}/images/${imageId}`));
  }

  async setPrimaryImage(propertyId: string, imageId: string): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.url}/${propertyId}/images/${imageId}/set-primary`, {}));
  }

  async save(id: string): Promise<{ savedId: string }> {
    const res = await firstValueFrom(this.http.post<{ savedId: string }>(`${this.url}/${id}/save`, {}));
    this.updateSavedCache([id], 'add');
    return res;
  }

  async isSaved(id: string): Promise<boolean> {
    return firstValueFrom(this.http.get<boolean>(`${this.url}/${id}/save`));
  }

  async unsave(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.url}/${id}/save`));
    this.updateSavedCache([id], 'remove');
  }

  async getSaved(page = 1, size = 50): Promise<PaginatedList<PropertyListItem>> {
    const res = await firstValueFrom(
      this.http.get<PaginatedList<PropertyListItem>>(`${this.url}/saved`, {
        params: { pageNumber: page, pageSize: size },
      }),
    );
    // Sync cache with the first page of results at least
    if (page === 1) {
      this.updateSavedCache(res.items.map(i => i.id));
    }
    return res;
  }

  updateSavedCache(ids: string[], mode: 'add' | 'remove' | 'set' = 'add') {
    this._savedIds.update(current => {
      const next = new Set(current);
      if (mode === 'set') {
        return new Set(ids);
      }
      ids.forEach(id => {
        if (mode === 'add') next.add(id);
        else next.delete(id);
      });
      return next;
    });
  }

  async syncAllSavedIds() {
    // Only sync if cache is empty or we specifically want a fresh start
    const allIds = new Set<string>();
    let page = 1;
    let totalPages = 1;
    try {
      do {
        const res = await this.getSaved(page, 50);
        res.items.forEach(i => allIds.add(i.id));
        totalPages = res.totalPages;
        page++;
      } while (page <= totalPages);
      this._savedIds.set(allIds);
    } catch { /* ignore */ }
  }

  async recordView(id: string): Promise<{ viewId: string }> {
    return firstValueFrom(this.http.post<{ viewId: string }>(`${this.url}/${id}/view`, {}));
  }

  async createReview(request: CreateAgentReviewRequest): Promise<{ reviewId: string }> {
    return firstValueFrom(this.http.post<{ reviewId: string }>(`${this.url}/reviews`, request));
  }
}
