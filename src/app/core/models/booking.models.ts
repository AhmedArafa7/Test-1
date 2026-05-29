import { BookingStatus } from './enums';

export interface BookingListItem {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyPrimaryImageUrl?: string;
  startDate: string;
  endDate: string;
  status: string;
  createdOnUtc: string;
  notes?: string;
  buyerName?: string;
}

export interface BookingDetail {
  id: string;
  propertyId: string;
  propertyTitle: string;
  userId: string;
  agentUserId: string;
  startDate: string;
  endDate: string;
  status: string;
  amount: number;
  currency: string;
  commissionRate: number;
  paymentId?: string;
  createdOnUtc: string;
  notes?: string;
  buyerName?: string;
}

export interface CreateBookingRequest {
  propertyId: string;
  startDate: string;
  endDate: string;
  amount: number;
  commissionRate: number;
  currency: string;
  notes?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
}

export interface CreateBookingResponse {
  bookingId: string;
  paymentId: string;
  redirectUrl?: string;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
}
