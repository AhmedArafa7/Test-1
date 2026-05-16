import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { lastValueFrom, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AgentDetail, PaginatedList } from '../../../core/models';

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = `${environment.apiUrl}/agents`;

  constructor(private http: HttpClient) {}

  async getAll(params: { city?: string; district?: string; page?: number; size?: number } = {}): Promise<PaginatedList<AgentDetail>> {
    let httpParams = new HttpParams();
    if (params.city) httpParams = httpParams.set('city', params.city);
    if (params.district) httpParams = httpParams.set('district', params.district);
    if (params.page) httpParams = httpParams.set('pageNumber', params.page.toString());
    if (params.size) httpParams = httpParams.set('pageSize', params.size.toString());

    return firstValueFrom(this.http.get<PaginatedList<AgentDetail>>(this.apiUrl, { params: httpParams }));
  }

  async getById(userId: string): Promise<AgentDetail> {
    return lastValueFrom(this.http.get<AgentDetail>(`${this.apiUrl}/${userId}`));
  }
}
