import { FormControl, FormGroup } from '@angular/forms';
import { AdPhotoCategory, CritAir, VehicleCondition } from '../../interfaces/ad.interface';
import {
  Drivetrain,
  FuelType,
  Transmission,
  VehicleColor,
  VehicleMake,
  VehicleModel,
  VehicleTrim,
} from '../../../vehicle/interfaces/vehicle-catalog.interface';

export interface ConditionOption {
  value: VehicleCondition;
  labelKey: string;
}

export interface ColorOption {
  value: VehicleColor;
  labelKey: string;
}

export interface CritAirOption {
  value: CritAir;
  labelKey: string;
}

export interface FuelTypeOption {
  value: FuelType;
  labelKey: string;
}

export interface TransmissionOption {
  value: Transmission;
  labelKey: string;
}

export interface DrivetrainOption {
  value: Drivetrain;
  labelKey: string;
}

export interface PhotoCategoryOption {
  value: AdPhotoCategory;
  labelKey: string;
}

export type PhotoRow = FormGroup<{
  caption: FormControl<string>;
  category: FormControl<AdPhotoCategory | null>;
}>;

export type PhotoUploadStatus = 'idle' | 'uploading' | 'error';

// Editable p-selects emit a plain string when the typed text doesn't match any catalog
// option -- these fields hold either the real catalog object (selected from the list) or a
// custom-typed name, resolved to a real id via find-or-create right before submit.
export type MakeValue = VehicleMake | string | null;
export type ModelValue = VehicleModel | string | null;
export type TrimValue = VehicleTrim | string | null;
