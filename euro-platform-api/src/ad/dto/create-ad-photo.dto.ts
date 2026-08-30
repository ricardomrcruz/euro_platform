import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { AdPhotoCategory } from '../enums/ad-photo-category.enum';

// Registers a photo already uploaded to GCS (see StorageService/upload-url endpoint) by its
// public URL -- this endpoint never sees the file bytes.
export class CreateAdPhotoDto {
  @IsUrl()
  url!: string;

  @IsOptional()
  @IsEnum(AdPhotoCategory)
  category?: AdPhotoCategory;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
