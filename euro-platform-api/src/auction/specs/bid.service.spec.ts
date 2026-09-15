// @ts-nocheck
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BidService } from '../bid.service';
import { CommissionService } from '../commission.service';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { AuctionState } from '../enums/auction-state.enum';

// BidService deliberately runs every query inside the SERIALIZABLE transaction's own
// EntityManager (manager.getRepository(...)), never the app-wide Auction/Bid repositories --
// so the fake DataSource here has to route getRepository() by entity, the same way Postgres
// would route it inside a real transaction.
function buildAuction(overrides: Partial<Auction> = {}): Auction {
  const auction = new Auction();
  auction.id = 1;
  auction.state = AuctionState.LIVE;
  auction.reservePrice = 10_000;
  auction.ad = { sellerId: 99 } as Auction['ad'];
  Object.assign(auction, overrides);
  return auction;
}

function buildHarness() {
  const auctionRepo = {
    findOne: jest.fn(),
    save: jest.fn((a: Auction) => Promise.resolve(a)),
  };
  const txBidRepo = {
    findOne: jest.fn(),
    create: jest.fn((data: Partial<Bid>) => ({ ...data }) as Bid),
    save: jest.fn((bid: Bid) => Promise.resolve({ ...bid, id: 1 })),
  };

  const manager = {
    getRepository: jest.fn((entity: unknown) =>
      entity === Auction ? auctionRepo : txBidRepo,
    ),
  };

  const dataSource = {
    transaction: jest.fn(
      (_isolation: string, work: (m: typeof manager) => unknown) =>
        work(manager),
    ),
  };

  const bidRepository = { count: jest.fn().mockResolvedValue(1) };
  const authClient = { getPublicNames: jest.fn().mockResolvedValue({}) };
  const notificationService = {
    notifyOutbid: jest.fn(),
    notifyAuctionClosed: jest.fn(),
  };
  const auctionGateway = {
    emitBidPlaced: jest.fn(),
    emitAuctionClosed: jest.fn(),
  };

  const service = new BidService(
    dataSource as never,
    new CommissionService(),
    notificationService as never,
    bidRepository as never,
    authClient as never,
    auctionGateway as never,
  );

  return {
    service,
    dataSource,
    auctionRepo,
    txBidRepo,
    notificationService,
    auctionGateway,
  };
}

describe('BidService.placeBid', () => {
  it('throws NotFoundException when the auction does not exist', async () => {
    const { service, auctionRepo } = buildHarness();
    auctionRepo.findOne.mockResolvedValue(null);

    await expect(service.placeBid(1, 1, 5000)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws ForbiddenException when the bidder is the seller', async () => {
    const { service, auctionRepo } = buildHarness();
    auctionRepo.findOne.mockResolvedValue(
      buildAuction({ ad: { sellerId: 42 } as Auction['ad'] }),
    );

    await expect(service.placeBid(42, 1, 5000)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('rejects a bid that does not beat the current highest (state-machine invariant)', async () => {
    const { service, auctionRepo } = buildHarness();
    auctionRepo.findOne.mockResolvedValue(
      buildAuction({ currentHighestBid: 6000 }),
    );

    await expect(service.placeBid(1, 1, 5000)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('persists the bid with the calculated commission and emits it over the gateway', async () => {
    const { service, auctionRepo, txBidRepo, auctionGateway } = buildHarness();
    auctionRepo.findOne.mockResolvedValue(buildAuction());
    txBidRepo.findOne.mockResolvedValue(null); // no previous top bid

    const bid = await service.placeBid(1, 1, 20_000);

    expect(bid.amount).toBe(20_000);
    expect(bid.commission).toBe(1000); // 5% of 20000
    expect(auctionGateway.emitBidPlaced).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ auctionId: 1, amount: 20_000 }),
    );
  });

  it('notifies the previous highest bidder when outbid by someone else', async () => {
    const { service, auctionRepo, txBidRepo, notificationService } =
      buildHarness();
    auctionRepo.findOne.mockResolvedValue(
      buildAuction({ currentHighestBid: 5000 }),
    );
    txBidRepo.findOne.mockResolvedValue({ bidderId: 7 });

    await service.placeBid(1, 1, 6000);

    expect(notificationService.notifyOutbid).toHaveBeenCalledWith(7, 1, 6000);
  });

  it('does not notify when the same bidder raises their own top bid', async () => {
    const { service, auctionRepo, txBidRepo, notificationService } =
      buildHarness();
    auctionRepo.findOne.mockResolvedValue(
      buildAuction({ currentHighestBid: 5000 }),
    );
    txBidRepo.findOne.mockResolvedValue({ bidderId: 1 });

    await service.placeBid(1, 1, 6000);

    expect(notificationService.notifyOutbid).not.toHaveBeenCalled();
  });
});

describe('BidService.buyNow', () => {
  it('throws NotFoundException when the auction does not exist', async () => {
    const { service, auctionRepo } = buildHarness();
    auctionRepo.findOne.mockResolvedValue(null);

    await expect(service.buyNow(1, 1)).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when the bidder is the seller', async () => {
    const { service, auctionRepo } = buildHarness();
    auctionRepo.findOne.mockResolvedValue(
      buildAuction({
        buyNowPrice: 30_000,
        ad: { sellerId: 42 } as Auction['ad'],
      }),
    );

    await expect(service.buyNow(42, 1)).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when the auction has no buy-now price', async () => {
    const { service, auctionRepo } = buildHarness();
    auctionRepo.findOne.mockResolvedValue(
      buildAuction({ buyNowPrice: undefined }),
    );

    await expect(service.buyNow(1, 1)).rejects.toThrow(BadRequestException);
  });

  it('sells the auction at the buy-now price and closes it out', async () => {
    const { service, auctionRepo, notificationService, auctionGateway } =
      buildHarness();
    auctionRepo.findOne.mockResolvedValue(
      buildAuction({ buyNowPrice: 30_000 }),
    );

    const bid = await service.buyNow(1, 1);

    expect(bid.amount).toBe(30_000);
    expect(notificationService.notifyAuctionClosed).toHaveBeenCalledWith(
      99,
      1,
      AuctionState.SOLD,
    );
    expect(auctionGateway.emitAuctionClosed).toHaveBeenCalledWith(1, {
      auctionId: 1,
      state: AuctionState.SOLD,
    });
  });
});

describe('BidService SERIALIZABLE retry', () => {
  it('retries on a Postgres serialization failure (40001) and succeeds', async () => {
    const { service, dataSource, auctionRepo } = buildHarness();
    auctionRepo.findOne.mockResolvedValue(
      buildAuction({ buyNowPrice: 30_000 }),
    );

    let attempts = 0;
    dataSource.transaction.mockImplementation(
      (_isolation: string, work: (m: unknown) => unknown) => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(
            Object.assign(new Error('could not serialize access'), {
              code: '40001',
            }),
          );
        }
        return Promise.resolve(work({ getRepository: () => auctionRepo }));
      },
    );

    // Route both entities through the same auctionRepo stub for this attempt-counting test --
    // only the retry behavior itself is under test here.
    auctionRepo.save = jest.fn((a: Auction) => Promise.resolve(a));
    (auctionRepo as { create?: unknown }).create = jest.fn((d: unknown) => d);

    await expect(service.buyNow(1, 1)).resolves.toBeDefined();
    expect(attempts).toBe(3);
  });

  it('gives up after the max retry count and surfaces the last error', async () => {
    const { service, dataSource } = buildHarness();
    dataSource.transaction.mockImplementation(() =>
      Promise.reject(
        Object.assign(new Error('could not serialize access'), {
          code: '40001',
        }),
      ),
    );

    await expect(service.buyNow(1, 1)).rejects.toThrow(
      'could not serialize access',
    );
    expect(dataSource.transaction).toHaveBeenCalledTimes(3);
  });

  it('does not retry a non-serialization error', async () => {
    const { service, dataSource } = buildHarness();
    dataSource.transaction.mockImplementation(() =>
      Promise.reject(new Error('unrelated database error')),
    );

    await expect(service.buyNow(1, 1)).rejects.toThrow(
      'unrelated database error',
    );
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
  });
});
