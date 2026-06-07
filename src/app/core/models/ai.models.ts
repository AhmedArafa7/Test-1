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

export interface MatchedProperty {
  property_id?: number | string;
  propertyId?: number | string;
  id?: string;
  title: string;
  description?: string;
  type?: string;
  property_type?: string;
  listing_type?: string;
  price: number;
  area?: number;
  size_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  district?: string;
  location?: string;
  url?: string;
  image_url?: string;
  status?: string;
  visual_similarity_score?: number;
  visual_similarity_engine?: string;
}

export interface ImageSearchResponse {
  count: number;
  properties: MatchedProperty[];
  message: string;
  engine: string;
  query_image?: { content_type: string; size_bytes: number };
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
