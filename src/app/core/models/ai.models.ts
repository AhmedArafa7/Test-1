import { ListingType, PropertyType, SearchEngine, SearchInputType } from './enums';

export interface CreateSearchRequest {
  inputType: SearchInputType;
  searchEngine: SearchEngine;
  rawQuery?: string;
  audioFileUrl?: string;
  imageFileUrl?: string;
  city?: string;
  district?: string;
  propertyType?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
}

export interface SearchResult {
  propertyId: string;
  rank: number;
  relevanceScore: number;
  scoreSource?: string;
  snapshotTitle?: string;
  snapshotPrice?: number;
  snapshotCity?: string;
  snapshotStatus?: string;
}

export interface SearchRequestDetail {
  id: string;
  userId: string;
  inputType: string;
  searchEngine: string;
  status: string;
  resultCount: number;
  createdAt: string;
  resolvedAt?: string;
  results: SearchResult[];
}

export interface CreateRecommendationRequest {
  sourceEntityType: string;
  sourceEntityId?: string;
  topN: number;
}

export interface RecommendationResult {
  recommendedPropertyId?: string;
  externalReference?: string;
  similarityScore: number;
  rank: number;
  snapshotTitle?: string;
  snapshotPrice?: number;
}

export interface RecommendationRequestDetail {
  id: string;
  requestedByUserId: string;
  sourceEntityType: string;
  sourceEntityId?: string;
  topN: number;
  status: string;
  requestedAt: string;
  resolvedAt?: string;
  results: RecommendationResult[];
}
