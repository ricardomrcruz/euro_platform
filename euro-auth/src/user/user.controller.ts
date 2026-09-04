import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

// Internal, server-to-server only -- never exposed to the browser (same convention as
// AuthController's /auth/validate: reachable only from euro-platform-api over the Docker
// network, no separate secret needed).
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('public-names')
  getPublicNames(@Query('ids') ids: string): Promise<Record<number, string>> {
    const parsedIds = (ids ?? '')
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isInteger(id) && id > 0);
    return this.userService.getPublicNames(parsedIds);
  }
}
