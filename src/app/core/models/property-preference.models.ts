import { PropertyType, ListingType, FurnishingStatus, ViewType } from './enums';

export interface PropertyPreferenceDto {
  id: string;
  propertyType?: PropertyType;
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  city?: string;
  district?: string;
  hasParking?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasElevator?: boolean;
  hasSecurity?: boolean;
  hasBalcony?: boolean;
  hasGarden?: boolean;
  hasCentralAC?: boolean;
  furnishingStatus?: FurnishingStatus;
  viewType?: ViewType;
  isActive: boolean;
  createdOnUtc: string;
  updatedOnUtc?: string;
}

export interface SetPropertyPreferenceRequest {
  propertyType?: PropertyType | null;
  listingType?: ListingType | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minArea?: number | null;
  maxArea?: number | null;
  minBedrooms?: number | null;
  maxBedrooms?: number | null;
  minBathrooms?: number | null;
  maxBathrooms?: number | null;
  city?: string | null;
  district?: string | null;
  hasParking?: boolean | null;
  hasPool?: boolean | null;
  hasGym?: boolean | null;
  hasElevator?: boolean | null;
  hasSecurity?: boolean | null;
  hasBalcony?: boolean | null;
  hasGarden?: boolean | null;
  hasCentralAC?: boolean | null;
  furnishingStatus?: FurnishingStatus | null;
  viewType?: ViewType | null;
}
