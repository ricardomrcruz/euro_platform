import { Module } from '@nestjs/common';
import { AdModule } from '../ad/ad.module';
import { AccountController } from './account.controller';

@Module({
  imports: [AdModule],
  controllers: [AccountController],
})
export class AccountModule {}
