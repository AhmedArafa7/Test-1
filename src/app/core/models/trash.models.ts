import { CreatePropertyRequest } from './property.models';

export interface TrashImageData {
  imageId: string;
  imageUrl: string;
  propertyId: string;
  propertyTitle: string;
}

export interface TrashPropertyData {
  propertyId: string;
  propertyTitle: string;
  propertyImageUrl?: string;
  createRequest: CreatePropertyRequest;
}

export type TrashItemType = 'image' | 'property';

export interface TrashItem<T = TrashImageData | TrashPropertyData> {
  id: string;
  type: TrashItemType;
  data: T;
  deletedAt: string;
  expiresAt: string;
  synced: boolean;
}
