import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { AdPhotoCategory } from '../enums/ad-photo-category.enum';

export class RequestPhotoUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @Matches(/^image\//)
  contentType!: string;

  @IsOptional()
  @IsEnum(AdPhotoCategory)
  category?: AdPhotoCategory;
}
