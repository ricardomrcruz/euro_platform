export type AdStatus = 'DRAFT' | 'REVIEW' | 'VALIDATED' | 'REJECTED';
export type VehicleCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

export type AdPhotoCategory =
  | 'EXTERIOR_FRONT'
  | 'EXTERIOR_REAR'
  | 'EXTERIOR_DRIVER_SIDE'
  | 'EXTERIOR_PASSENGER_SIDE'
  | 'EXTERIOR_FRONT_THREE_QUARTER'
  | 'EXTERIOR_REAR_THREE_QUARTER'
  | 'EXTERIOR_UNDERCARRIAGE'
  | 'WHEELS_TIRES'
  | 'ENGINE_BAY'
  | 'INTERIOR_DASHBOARD'
  | 'INTERIOR_FRONT_SEATS'
  | 'INTERIOR_REAR_SEATS'
  | 'ODOMETER'
  | 'TRUNK'
  | 'REGISTRATION_DOCUMENT'
  | 'OTHER';

export interface CreateAdPayload {
  title: string;
  description: string;
  condition: VehicleCondition;
  highlights?: string;
  knownFlaws?: string;
  modifications?: string;
  serviceHistory?: string;
  location?: string;
  makeId: number;
  modelId: number;
  trimId?: number;
  vin?: string;
  year: number;
  exteriorColor?: string;
  interiorColor?: string;
  mileage?: number;
  numberOfOwners?: number;
  plateCountry?: string;
}

export interface AdPhoto {
  id: number;
  url: string;
  category: AdPhotoCategory;
  caption?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface AdVehicleSummary {
  id: number;
  vin?: string;
  year: number;
  exteriorColor?: string;
  interiorColor?: string;
  mileage?: number;
  numberOfOwners?: number;
  plateCountry?: string;
  make: { id: number; name: string };
  model: { id: number; name: string };
  trim?: { id: number; name: string };
}

export interface Ad {
  id: number;
  title: string;
  description: string;
  condition: VehicleCondition;
  status: AdStatus;
  highlights?: string;
  knownFlaws?: string;
  modifications?: string;
  serviceHistory?: string;
  location?: string;
  createdAt: string;
  rejectionMessage?: string;
  sellerId: number;
  vehicle: AdVehicleSummary;
  photos: AdPhoto[];
}

export interface AddPhotoPayload {
  url: string;
  category?: AdPhotoCategory;
  caption?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

export interface RequestUploadUrlPayload {
  filename: string;
  contentType: string;
  category?: AdPhotoCategory;
}

export interface SignedUpload {
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
}

export interface AdMessage {
  id: number;
  message: string;
  senderId: number;
  senderRole: 'GUEST' | 'CLIENT' | 'ADMIN';
  createdAt: string;
}
