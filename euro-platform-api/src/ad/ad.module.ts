import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehicleModule } from '../vehicle/vehicle.module';
import { NotificationModule } from '../notification/notification.module';
import { Ad } from './entities/ad.entity';
import { AdPhoto } from './entities/ad-photo.entity';
import { AdMessage } from './entities/ad-message.entity';
import { AdService } from './ad.service';
import { AdController } from './ad.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Ad, AdPhoto, AdMessage]), VehicleModule, NotificationModule],
  controllers: [AdController],
  providers: [AdService],
})
export class AdModule {}
