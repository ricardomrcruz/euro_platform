import { registerAs } from '@nestjs/config';

export default registerAs('carApi', () => ({
  baseUrl: process.env.CARAPI_BASE_URL ?? 'https://carapi.app/api',
  apiToken: process.env.CARAPI_API_TOKEN,
  apiSecret: process.env.CARAPI_API_SECRET,
}));
