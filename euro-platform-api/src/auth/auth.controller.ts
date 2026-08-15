import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthClientService, AccessToken, RegisteredUser } from './auth-client.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

// The browser only ever talks to euro-platform-api (per the design doc's single-entry-point
// architecture) -- these two routes are a thin forward to euro-auth, which is never exposed
// to the browser directly.
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authClient: AuthClientService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<RegisteredUser> {
    return this.authClient.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<AccessToken> {
    return this.authClient.login(dto);
  }
}
