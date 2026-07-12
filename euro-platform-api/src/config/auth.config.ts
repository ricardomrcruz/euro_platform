import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  serviceUrl: process.env.AUTH_SERVICE_URL,
}));
