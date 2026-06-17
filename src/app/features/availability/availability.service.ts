import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateAvailabilityRuleRequest, AvailabilityRuleDto, TimeSlotDto } from '../../core/models';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/availability`;

  public hasNoRules = signal<boolean>(false);

  getRules() {
    return this.http.get<AvailabilityRuleDto[]>(`${this.url}/rules`).pipe(
      tap(rules => this.hasNoRules.set(rules.length === 0))
    );
  }

  createRule(rule: CreateAvailabilityRuleRequest) {
    return this.http.post<AvailabilityRuleDto>(`${this.url}/rules`, rule).pipe(
      tap(() => this.hasNoRules.set(false))
    );
  }

  deleteRule(id: string) {
    return this.http.delete(`${this.url}/rules/${id}`).pipe(
      tap(() => this.getRules().subscribe())
    );
  }

  getPropertyAvailability(propertyId: string, startDate: string, endDate: string) {
    return this.http.get<TimeSlotDto[]>(`${environment.apiUrl}/properties/${propertyId}/availability`, {
      params: { startDate, endDate }
    });
  }

  getAgentSlots(startDate: string, endDate: string) {
    return this.http.get<TimeSlotDto[]>(`${this.url}/slots`, {
      params: { startDate, endDate }
    });
  }
}
