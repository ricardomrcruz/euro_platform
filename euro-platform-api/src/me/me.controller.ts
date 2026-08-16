import { Controller, Get } from '@nestjs/common';
import { AdService } from '../ad/ad.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { RequestUser } from '../auth/interfaces/authenticated-request.interface';

// Home for "current user" endpoints -- /me/ads today, /me/bids and /me/watchlist expected
// to land here later, so this stays its own module rather than living inside AdModule.
@Controller('me')
export class MeController {
  constructor(private readonly adService: AdService) {}

  @Get('ads')
  myAds(@CurrentUser() user: RequestUser) {
    return this.adService.findMine(user.id);
  }
}
