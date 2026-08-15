import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import authConfig from '../config/auth.config';
import { RequestUser } from './interfaces/authenticated-request.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from './enums/user-role.enum';

export interface RegisteredUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AccessToken {
  accessToken: string;
}

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

  register(dto: RegisterDto): Promise<RegisteredUser> {
    return this.forward<RegisteredUser>('register', dto);
  }

  login(dto: LoginDto): Promise<AccessToken> {
    return this.forward<AccessToken>('login', dto);
  }

  // Register/login errors (409 duplicate email, 401 bad credentials) must reach the browser
  // as-is, unlike validate() above which silently swallows failures for the auth guard.
  private async forward<T>(path: string, body: unknown): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<T>(`${this.config.serviceUrl}/auth/${path}`, body),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const status = axiosError.response?.status ?? HttpStatus.BAD_GATEWAY;
      const message = axiosError.response?.data?.message ?? 'Auth service request failed';
      throw new HttpException(message, status);
    }
  }
}
