import { IsDateString, IsNumber, IsOptional, IsPositive } from 'class-validator';

export class LaunchAuctionDto {
  @IsDateString()
  endDate!: string;

  @IsNumber()
  @IsPositive()
  reservePrice!: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  buyNowPrice?: number;
}
