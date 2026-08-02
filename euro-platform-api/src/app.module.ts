import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import authConfig from './config/auth.config';
import typeormConfig from './config/typeorm.config';
import carApiConfig from './vehicle/car-api/car-api.config';
import { VehicleModule } from './vehicle/vehicle.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { AdModule } from './ad/ad.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [typeormConfig, authConfig, carApiConfig] }),
    TypeOrmModule.forRootAsync({
      inject: [typeormConfig.KEY],
      useFactory: (config: ConfigType<typeof typeormConfig>) => config,
    }),
    AuthModule,
    VehicleModule,
    AdModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Order matters: AuthGuard runs first and attaches request.user, RolesGuard reads it.
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
