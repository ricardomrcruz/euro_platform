import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import authConfig from '../config/auth.config';
import { RequestUser } from './interfaces/authenticated-request.interface';

// The real network call behind the architecture decision in CLAUDE.md: euro-platform-api
// never verifies JWTs locally, it asks euro-auth on every protected request, so revocation
// (tokenVersion bump) takes effect immediately instead of waiting for token expiry.
@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async validate(authHeader: string): Promise<RequestUser | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<RequestUser>(
          `${this.config.serviceUrl}/auth/validate`,
          {},
          { headers: { Authorization: authHeader } },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.debug(`Token validation failed: ${(error as Error).message}`);
      return null;
    }
  }
}
