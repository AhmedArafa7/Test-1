import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateAvailabilityRuleRequest, AvailabilityRuleDto } from '../../core/models';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/Availability`;

  getRules() {
    return this.http.get<AvailabilityRuleDto[]>(`${this.url}/rules`);
  }

  createRule(rule: CreateAvailabilityRuleRequest) {
    return this.http.post<AvailabilityRuleDto>(`${this.url}/rules`, rule);
  }

  deleteRule(id: string) {
    return this.http.delete(`${this.url}/rules/${id}`);
  }

  getPropertyAvailability(propertyId: string) {
    return this.http.get<AvailabilityRuleDto[]>(`${this.url}/Properties/${propertyId}/availability`);
  }
}
