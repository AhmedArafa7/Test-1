import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BookingListItem, BookingDetail, CreateBookingRequest, CreateBookingResponse, UpdateBookingStatusRequest } from '../../../core/models';
import { PaginatedList } from '../../../core/models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private url = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  // Backend returns PaginatedList<BookingListItemDto>
  async getMyBookings(page = 1, size = 20): Promise<PaginatedList<BookingListItem>> {
    return firstValueFrom(this.http.get<PaginatedList<BookingListItem>>(this.url, { params: { pageNumber: page, pageSize: size } }));
  }

  async getById(id: string): Promise<BookingDetail> {
    return firstValueFrom(this.http.get<BookingDetail>(`${this.url}/${id}`));
  }

  async create(request: CreateBookingRequest): Promise<CreateBookingResponse> {
    return firstValueFrom(this.http.post<CreateBookingResponse>(this.url, request));
  }

  // Backend: PATCH {bookingId}/status
  async updateStatus(id: string, request: UpdateBookingStatusRequest): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`${this.url}/${id}/status`, request));
  }
}
