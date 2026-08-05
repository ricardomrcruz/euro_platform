import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { BidService } from './bid.service';
import { LaunchAuctionDto } from './dto/launch-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import type { RequestUser } from '../auth/interfaces/authenticated-request.interface';

// No common prefix -- launch is under /ads, everything else under /auctions.
@Controller()
export class AuctionController {
  constructor(
    private readonly auctionService: AuctionService,
    private readonly bidService: BidService,
  ) {}

  @Post('ads/:adId/auction')
  launch(
    @CurrentUser() user: RequestUser,
    @Param('adId', ParseIntPipe) adId: number,
    @Body() dto: LaunchAuctionDto,
  ) {
    return this.auctionService.launch(user, adId, dto);
  }

  @Post('auctions/:id/bids')
  placeBid(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PlaceBidDto,
  ) {
    return this.bidService.placeBid(user.id, id, dto.amount);
  }

  @Post('auctions/:id/buy-now')
  buyNow(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.bidService.buyNow(user.id, id);
  }

  @Post('auctions/:id/end')
  endManually(@CurrentUser() user: RequestUser, @Param('id', ParseIntPipe) id: number) {
    return this.auctionService.endManually(user, id);
  }

  @Public()
  @Get('auctions')
  listLive() {
    return this.auctionService.listLive();
  }

  @Public()
  @Get('auctions/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auctionService.findOne(id);
  }
}
