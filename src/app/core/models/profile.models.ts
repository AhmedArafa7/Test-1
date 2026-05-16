import { ContactMethod } from './enums';

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  preferredContactMethod: string;
  createdOnUtc: string;
}

export interface CreateUserProfileRequest {
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  preferredContactMethod: ContactMethod;
}

export interface UpdateUserProfileRequest {
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  phoneNumber?: string;
  preferredContactMethod: ContactMethod;
}

export interface AgentDetail {
  id: string;
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  agencyName?: string;
  agencyAddress?: string;
  licenseNumber?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  commissionRate: number;
  createdOnUtc: string;
  updatedOnUtc: string;
}

export interface UpdateAgentDetailRequest {
  agencyName?: string;
  agencyAddress?: string;
  licenseNumber?: string;
  bio?: string;
  website?: string;
  commissionRate: number;
}

export interface RequestRefundRequest {
  paymentId: string;
  reason: string;
  amount: number;
}
