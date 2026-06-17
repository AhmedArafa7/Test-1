import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PropertyPreferenceDto, SetPropertyPreferenceRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class PropertyPreferenceService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/PropertyPreferences`;

  getPreferences() {
    return this.http.get<PropertyPreferenceDto>(this.url);
  }

  setPreferences(request: SetPropertyPreferenceRequest) {
    return this.http.post<{ preferenceId: string }>(this.url, request);
  }
}
