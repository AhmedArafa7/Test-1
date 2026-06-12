import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AgentDetail, PropertyListItem, PaginatedList } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = `${environment.apiUrl}/agents`;

  constructor(private http: HttpClient) {}

  async getById(userId: string): Promise<AgentDetail> {
    return lastValueFrom(this.http.get<AgentDetail>(`${this.apiUrl}/${userId}`));
  }

  async getTopAgents(limit: number = 5): Promise<AgentDetail[]> {
    return lastValueFrom(this.http.get<AgentDetail[]>(`${this.apiUrl}/top`, {
      params: { limit: limit.toString() }
    }));
  }

  async search(searchTerm: string, limit: number = 10): Promise<AgentDetail[]> {
    return lastValueFrom(this.http.get<AgentDetail[]>(`${this.apiUrl}/search`, {
      params: { searchTerm, limit: limit.toString() }
    }));
  }

  async getAgentProperties(agentUserId: string): Promise<PaginatedList<PropertyListItem>> {
    return lastValueFrom(this.http.get<PaginatedList<PropertyListItem>>(`${this.apiUrl}/${agentUserId}/properties`));
  }
}
