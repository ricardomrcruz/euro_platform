import { IsOptional, IsString } from 'class-validator';

// Deliberately excludes title/location/condition and every vehicle field -- those are
// permanent fundamentals once an ad is VALIDATED. Only these "lesser" content fields (and
// photos, via the existing photo endpoints) may still change, subject to re-review.
export class UpdateAdContentDto {
  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  highlights?: string;

  @IsOptional()
  @IsString()
  knownFlaws?: string;

  @IsOptional()
  @IsString()
  modifications?: string;

  @IsOptional()
  @IsString()
  serviceHistory?: string;
}
