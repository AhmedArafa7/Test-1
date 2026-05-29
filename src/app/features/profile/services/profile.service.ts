import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UserProfile, CreateUserProfileRequest, UpdateUserProfileRequest, AgentDetail, UpdateAgentDetailRequest, AppNotification, RequestRefundRequest, PaginatedList } from '../../../core/models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private url = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ─── User Profile ─── (Backend: UserProfilesController → api/v1/userprofiles)
  async getProfile(userId: string): Promise<UserProfile> {
    return firstValueFrom(this.http.get<UserProfile>(`${this.url}/userprofiles/${userId}`));
  }
  async getMyProfile(): Promise<UserProfile> {
    return firstValueFrom(this.http.get<UserProfile>(`${this.url}/userprofiles/me`));
  }
  async createProfile(request: CreateUserProfileRequest): Promise<{ profileId: string }> {
    return firstValueFrom(this.http.post<{ profileId: string }>(`${this.url}/userprofiles`, request));
  }
  async updateProfile(request: UpdateUserProfileRequest): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.url}/userprofiles/me`, request));
  }

  // ─── Agent Detail ─── (Backend: AgentsController → api/v1/agents)
  async getAgentDetail(userId: string): Promise<AgentDetail> {
    return firstValueFrom(this.http.get<AgentDetail>(`${this.url}/agents/${userId}`));
  }
  async getMyAgentDetail(): Promise<AgentDetail> {
    return firstValueFrom(this.http.get<AgentDetail>(`${this.url}/agents/me`));
  }
  async updateAgentDetail(request: UpdateAgentDetailRequest): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.url}/agents/me`, request));
  }

  // ─── Notifications ─── (Backend: NotificationsController → api/v1/notifications → Paged)
  async getNotifications(page = 1, size = 20, unreadOnly = false): Promise<PaginatedList<AppNotification>> {
    return firstValueFrom(
      this.http.get<PaginatedList<AppNotification>>(`${this.url}/notifications`, { 
        params: { 
          pageNumber: page, 
          pageSize: size,
          unreadOnly: unreadOnly.toString() 
        } 
      })
    );
  }

  async markNotificationRead(id: string): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`${this.url}/notifications/${id}/read`, {}));
  }

  // ─── Stats ───
  async getProfileStats(): Promise<{ savedPropertiesCount: number; bookingsCount: number }> {
    const [saved, bookings] = await Promise.all([
      firstValueFrom(this.http.get<PaginatedList<any>>(`${this.url}/properties/saved`, { params: { pageSize: 1 } })),
      firstValueFrom(this.http.get<PaginatedList<any>>(`${this.url}/bookings`, { params: { pageSize: 1 } }))
    ]);

    return {
      savedPropertiesCount: saved.totalCount || 0,
      bookingsCount: bookings.totalCount || 0
    };
  }

  // ─── Refunds ─── (Backend: PaymentsController → POST api/v1/payments/refunds — plural)
  async requestRefund(request: RequestRefundRequest): Promise<{ refundId: string }> {
    return firstValueFrom(this.http.post<{ refundId: string }>(`${this.url}/payments/refunds`, request));
  }
}
