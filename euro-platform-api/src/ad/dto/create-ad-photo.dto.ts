import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

// Direct-URL registration; GCS signed-upload-URL generation isn't built yet.
export class CreateAdPhotoDto {
  @IsUrl()
  url!: string;

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
