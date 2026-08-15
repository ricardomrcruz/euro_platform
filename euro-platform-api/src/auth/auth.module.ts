import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthClientService } from './auth-client.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [HttpModule],
  controllers: [AuthController],
  providers: [AuthClientService],
  exports: [AuthClientService],
})
export class AuthModule {}
