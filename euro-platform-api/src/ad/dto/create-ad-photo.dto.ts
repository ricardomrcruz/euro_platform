import { IsBoolean, IsInt, IsOptional, IsString, IsUrl, Min } from 'class-validator';

// Direct-URL registration -- real upload goes through GCS signed URLs (design doc 4.11.2),
// deferred until there's a real GCP bucket/service account to generate them against. For
// now, callers supply a URL directly (e.g. one already uploaded elsewhere, or a placeholder
// for testing).
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
