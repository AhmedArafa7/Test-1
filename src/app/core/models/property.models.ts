import { FurnishingStatus, ListingType, PropertyType, ViewType } from './enums';

export interface PropertyListItem {
  id: string;
  agentUserId: string;
  title: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  city?: string;
  district?: string;
  propertyType: string;
  listingType: string;
  status: string;
  isFeatured: boolean;
  primaryImageUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PropertyAmenity {
  hasParking: boolean;
  hasPool: boolean;
  hasGym: boolean;
  hasElevator: boolean;
  hasSecurity: boolean;
  hasBalcony: boolean;
  hasGarden: boolean;
  hasCentralAC: boolean;
  furnishingStatus: string;
  viewType?: string;
}

export interface AgentSummary {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  agencyName?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}

export interface Property {
  id: string;
  agentUserId: string;
  title: string;
  description?: string;
  propertyType: string;
  listingType: string;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  totalFloors?: number;
  addressLine?: string;
  city?: string;
  district?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  isFeatured: boolean;
  createdOnUtc: string;
  images?: PropertyImage[];
  amenity?: PropertyAmenity;
  agent?: AgentSummary;
}

export interface CreatePropertyRequest {
  title: string;
  description?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  totalFloors?: number;
  addressLine?: string;
  city?: string;
  district?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  hasParking: boolean;
  hasPool: boolean;
  hasGym: boolean;
  hasElevator: boolean;
  hasSecurity: boolean;
  hasBalcony: boolean;
  hasGarden: boolean;
  hasCentralAC: boolean;
  furnishingStatus: FurnishingStatus;
  viewType?: ViewType;
  imageUrls?: string[];
}

export interface UpdatePropertyRequest extends Omit<CreatePropertyRequest, 'imageUrls'> {
  isFeatured: boolean;
}

export interface GetPropertiesParams {
  city?: string;
  district?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  agentUserId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface CreateAgentReviewRequest {
  agentUserId: string;
  propertyId: string;
  rating: number;
  comment?: string;
}
export interface AgentReview {
  id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment?: string;
  createdOnUtc: string;
}
