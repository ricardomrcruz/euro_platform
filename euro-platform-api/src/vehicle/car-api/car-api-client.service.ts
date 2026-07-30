import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import carApiConfig from './car-api.config';
import {
  CarApiCollection,
  CarApiMake,
  CarApiModel,
  CarApiTrimDetail,
  CarApiTrimSummary,
} from './car-api.types';

// The doc's VehicleCatalogueAPI -> HttpService mapping: this is that external client.
// CarAPI's free tier only covers 2015-2020 model years -- an empty result here is the
// "catalog doesn't have this vehicle" signal (design doc 6.2.1.2), not a server error.
@Injectable()
export class CarApiClientService {
  private readonly logger = new Logger(CarApiClientService.name);
  private cachedToken: string | null = null;
  private cachedTokenExpiresAt = 0;

  constructor(
    private readonly httpService: HttpService,
    @Inject(carApiConfig.KEY)
    private readonly config: ConfigType<typeof carApiConfig>,
  ) {}

  async getMakes(year?: number): Promise<CarApiMake[]> {
    return this.getCollection<CarApiMake>('/makes/v2', year ? { year } : {});
  }

  async getModels(make: string, year?: number): Promise<CarApiModel[]> {
    return this.getCollection<CarApiModel>('/models/v2', {
      make,
      ...(year ? { year } : {}),
    });
  }

  async getTrims(make: string, model: string, year?: number): Promise<CarApiTrimSummary[]> {
    return this.getCollection<CarApiTrimSummary>('/trims/v2', {
      make,
      model,
      ...(year ? { year } : {}),
    });
  }

  async getTrimDetail(id: number): Promise<CarApiTrimDetail | null> {
    try {
      const token = await this.getToken();
      const response = await firstValueFrom(
        this.httpService.get<CarApiTrimDetail>(`${this.config.baseUrl}/trims/v2/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.warn(`CarAPI trim detail lookup failed for id=${id}: ${(error as Error).message}`);
      return null;
    }
  }

  private async getCollection<T>(
    path: string,
    params: Record<string, string | number>,
  ): Promise<T[]> {
    try {
      const token = await this.getToken();
      const response = await firstValueFrom(
        this.httpService.get<CarApiCollection<T>>(`${this.config.baseUrl}${path}`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data.data;
    } catch (error) {
      this.logger.warn(`CarAPI request failed for ${path}: ${(error as Error).message}`);
      return [];
    }
  }

  private async getToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && now < this.cachedTokenExpiresAt) {
      return this.cachedToken;
    }

    const response = await firstValueFrom(
      this.httpService.post<string | { token?: string; jwt?: string }>(
        `${this.config.baseUrl}/auth/login`,
        { api_token: this.config.apiToken, api_secret: this.config.apiSecret },
        { headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const body = response.data;
    const token = typeof body === 'string' ? body : (body?.token ?? body?.jwt);
    if (!token) {
      throw new Error('CarAPI login did not return a token');
    }

    this.cachedToken = token;
    // CarAPI JWTs are valid ~7 days; refresh a day early to be safe.
    this.cachedTokenExpiresAt = now + 6 * 24 * 60 * 60 * 1000;
    return this.cachedToken;
  }
}
