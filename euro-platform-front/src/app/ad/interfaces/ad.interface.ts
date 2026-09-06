import type { VehicleColor } from '../../vehicle/interfaces/vehicle-catalog.interface';

export type CritAir = 'CRITAIR_0' | 'CRITAIR_1' | 'CRITAIR_2' | 'CRITAIR_3' | 'CRITAIR_4' | 'CRITAIR_5';

export type AdStatus = 'DRAFT' | 'REVIEW' | 'VALIDATED' | 'REJECTED';
export type VehicleCondition =
  | 'EXCELLENT'
  | 'NOT_DAMAGED'
  | 'GOOD'
  | 'NORMAL_WEAR'
  | 'MINOR_REPAIRS_NEEDED'
  | 'MAJOR_REPAIRS_NEEDED'
  | 'DAMAGED'
  | 'NOT_RUNNING';

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
  exteriorColor?: VehicleColor;
  interiorColor?: VehicleColor;
  mileage?: number;
  numberOfOwners?: number;
  plateCountry?: string;
  fiscalPower: number;
  critAir?: CritAir;
  numberOfSeats?: number;
  numberOfDoors?: number;
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
  exteriorColor?: VehicleColor;
  interiorColor?: VehicleColor;
  mileage?: number;
  numberOfOwners?: number;
  plateCountry?: string;
  fiscalPower: number;
  critAir?: CritAir;
  numberOfSeats?: number;
  numberOfDoors?: number;
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

// For a VALIDATED ad only -- title/location/condition/vehicle fields are permanent
// fundamentals and can't be changed through this payload.
export interface UpdateAdContentPayload {
  description: string;
  highlights?: string;
  knownFlaws?: string;
  modifications?: string;
  serviceHistory?: string;
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
