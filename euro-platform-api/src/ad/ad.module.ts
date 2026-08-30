import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleModule } from '../vehicle/vehicle.module';
import { NotificationModule } from '../notification/notification.module';
import { StorageModule } from '../storage/storage.module';
import { Ad } from './entities/ad.entity';
import { AdPhoto } from './entities/ad-photo.entity';
import { AdMessage } from './entities/ad-message.entity';
import { AdRepository } from './ad.repository';
import { AdPhotoRepository } from './ad-photo.repository';
import { AdMessageRepository } from './ad-message.repository';
import { AdService } from './ad.service';
import { AdController } from './ad.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ad, AdPhoto, AdMessage]),
    VehicleModule,
    NotificationModule,
    StorageModule,
  ],
  controllers: [AdController],
  providers: [AdService, AdRepository, AdPhotoRepository, AdMessageRepository],
  // AdRepository is also exported for AuctionModule's ownership/status check on launch() --
  // see auction.module.ts.
  exports: [AdService, AdRepository],
})
export class AdModule {}
