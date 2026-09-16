// @ts-nocheck
import { BadRequestException } from '@nestjs/common';
import { Auction } from '../entities/auction.entity';
import { AuctionState } from '../enums/auction-state.enum';
import { MIN_COMMISSION } from '../commission.service';

const MIN_STARTING_BID = MIN_COMMISSION * 2;

function liveAuction(overrides: Partial<Auction> = {}): Auction {
  const auction = new Auction();
  auction.state = AuctionState.LIVE;
  auction.reservePrice = 10_000;
  Object.assign(auction, overrides);
  return auction;
}

describe('Auction state machine', () => {
  describe('registerBid', () => {
    it('throws when the auction is not LIVE', () => {
      const auction = liveAuction({ state: AuctionState.SOLD });
      expect(() => auction.registerBid(MIN_STARTING_BID)).toThrow(
        BadRequestException,
      );
    });

    it('throws when the opening bid is below the starting floor', () => {
      const auction = liveAuction();
      expect(() => auction.registerBid(MIN_STARTING_BID - 1)).toThrow(
        BadRequestException,
      );
    });

    it('accepts an opening bid exactly at the starting floor', () => {
      const auction = liveAuction();
      auction.registerBid(MIN_STARTING_BID);
      expect(auction.currentHighestBid).toBe(MIN_STARTING_BID);
    });

    it('throws when a later bid does not exceed the current highest', () => {
      const auction = liveAuction({ currentHighestBid: 5000 });
      expect(() => auction.registerBid(5000)).toThrow(BadRequestException);
      expect(() => auction.registerBid(4000)).toThrow(BadRequestException);
    });

    it('accepts a bid strictly higher than the current highest', () => {
      const auction = liveAuction({ currentHighestBid: 5000 });
      auction.registerBid(5001);
      expect(auction.currentHighestBid).toBe(5001);
    });
  });

  describe('sell / expire / cancel', () => {
    it.each([
      ['sell', AuctionState.SOLD],
      ['expire', AuctionState.EXPIRED],
      ['cancel', AuctionState.CANCELLED],
    ] as const)('%s moves a LIVE auction to %s', (method, expected) => {
      const auction = liveAuction();
      auction[method]();
      expect(auction.state).toBe(expected);
    });

    it.each(['sell', 'expire', 'cancel'] as const)(
      '%s throws when the auction is not LIVE',
      (method) => {
        const auction = liveAuction({ state: AuctionState.CANCELLED });
        expect(() => auction[method]()).toThrow(BadRequestException);
      },
    );
  });

  describe('finalize', () => {
    it('sells when the highest bid meets the reserve', () => {
      const auction = liveAuction({
        reservePrice: 10_000,
        currentHighestBid: 10_000,
      });
      auction.finalize();
      expect(auction.state).toBe(AuctionState.SOLD);
    });

    it('sells when the highest bid exceeds the reserve', () => {
      const auction = liveAuction({
        reservePrice: 10_000,
        currentHighestBid: 12_000,
      });
      auction.finalize();
      expect(auction.state).toBe(AuctionState.SOLD);
    });

    it('expires when the highest bid is below the reserve', () => {
      const auction = liveAuction({
        reservePrice: 10_000,
        currentHighestBid: 9_999,
      });
      auction.finalize();
      expect(auction.state).toBe(AuctionState.EXPIRED);
    });

    it('expires when there were no bids at all', () => {
      const auction = liveAuction({ reservePrice: 10_000 });
      auction.finalize();
      expect(auction.state).toBe(AuctionState.EXPIRED);
    });
  });
});
