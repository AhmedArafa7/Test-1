import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UserSummary, AdminAgent, AuditLog, DomainEventLog, PaymentAdmin, RefundRequestAdmin, SearchRequestAdmin, RecommendationRequestAdmin, ToggleUserStatusRequest, AssignRoleRequest, ReviewRefundRequest } from '../../../core/models';
import { PaginatedList } from '../../../core/models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
  public globalSearchTerm = signal<string>('');
  private url = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // ─── Users ─── (Backend returns List, not PaginatedList)
  async getUsers(): Promise<UserSummary[]> {
    return firstValueFrom(this.http.get<UserSummary[]>(`${this.url}/users`));
  }
  // Backend: PATCH users/{userId}/status
  async toggleUserStatus(userId: string, request: ToggleUserStatusRequest): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`${this.url}/users/${userId}/status`, request));
  }
  // Backend: PATCH users/{userId}/role (not POST)
  async assignRole(userId: string, request: AssignRoleRequest): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`${this.url}/users/${userId}/role`, request));
  }

  // ─── Agents ─── (Backend returns List, not PaginatedList)
  async getAgents(): Promise<AdminAgent[]> {
    return firstValueFrom(this.http.get<AdminAgent[]>(`${this.url}/agents`));
  }
  // Backend: PATCH agents/{agentUserId}/verification (not /verify)
  async verifyAgent(userId: string): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`${this.url}/agents/${userId}/verification`, {}));
  }

  // ─── Payments ─── (Backend returns PaginatedList)
  async getPayments(page = 1, size = 20): Promise<PaginatedList<PaymentAdmin>> {
    return firstValueFrom(this.http.get<PaginatedList<PaymentAdmin>>(`${this.url}/payments`, { params: { pageNumber: page, pageSize: size } }));
  }

  // ─── Refunds ─── (Backend returns PaginatedList)
  async getRefunds(page = 1, size = 20): Promise<PaginatedList<RefundRequestAdmin>> {
    return firstValueFrom(this.http.get<PaginatedList<RefundRequestAdmin>>(`${this.url}/refunds`, { params: { pageNumber: page, pageSize: size } }));
  }
  // Backend: PATCH refunds/{refundId}/status (not /review)
  async reviewRefund(refundId: string, request: ReviewRefundRequest): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`${this.url}/refunds/${refundId}/status`, request));
  }

  // ─── AI ─── (Backend: admin/search-requests, admin/recommendation-requests)
  async getSearchRequests(page = 1, size = 20): Promise<PaginatedList<SearchRequestAdmin>> {
    return firstValueFrom(this.http.get<PaginatedList<SearchRequestAdmin>>(`${this.url}/search-requests`, { params: { pageNumber: page, pageSize: size } }));
  }
  async getRecommendationRequests(page = 1, size = 20): Promise<PaginatedList<RecommendationRequestAdmin>> {
    return firstValueFrom(this.http.get<PaginatedList<RecommendationRequestAdmin>>(`${this.url}/recommendation-requests`, { params: { pageNumber: page, pageSize: size } }));
  }

  // ─── Audit Logs ───
  async getAuditLogs(page = 1, size = 50): Promise<PaginatedList<AuditLog>> {
    return firstValueFrom(this.http.get<PaginatedList<AuditLog>>(`${this.url}/audit-logs`, { params: { pageNumber: page, pageSize: size } }));
  }
  async getDomainEventLogs(page = 1, size = 50): Promise<PaginatedList<DomainEventLog>> {
    return firstValueFrom(this.http.get<PaginatedList<DomainEventLog>>(`${this.url}/domain-events`, { params: { pageNumber: page, pageSize: size } }));
  }
}
