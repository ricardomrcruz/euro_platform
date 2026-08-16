import { Module } from '@nestjs/common';
import { AdModule } from '../ad/ad.module';
import { MeController } from './me.controller';

@Module({
  imports: [AdModule],
  controllers: [MeController],
})
export class MeModule {}
