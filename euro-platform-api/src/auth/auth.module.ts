import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthClientService } from './auth-client.service';

@Module({
  imports: [HttpModule],
  providers: [AuthClientService],
  exports: [AuthClientService],
})
export class AuthModule {}
