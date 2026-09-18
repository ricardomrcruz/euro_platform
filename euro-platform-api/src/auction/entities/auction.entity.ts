import { BadRequestException } from '@nestjs/common';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ad } from '../../ad/entities/ad.entity';
import { AuctionState } from '../enums/auction-state.enum';
import { Bid } from './bid.entity';
import { MIN_COMMISSION } from '../commission.service';

// A €1 opening bid would still trigger the flat €MIN_COMMISSION buyer's premium, netting the
// seller almost nothing -- the first bid must clear double the commission floor so both the
// seller's cut and the platform's minimum commission are actually meaningful.
const MIN_STARTING_BID = MIN_COMMISSION * 2;

// State transitions are guarded here, not in a separate class-per-state hierarchy.
@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'start_date' })
  startDate!: Date;

  @Column({ name: 'end_date' })
  endDate!: Date;

  @Column('float', { name: 'reserve_price' })
  reservePrice!: number;

  @Column('float', { name: 'buy_now_price', nullable: true })
  buyNowPrice?: number;

  @Column('float', { name: 'current_highest_bid', nullable: true })
  currentHighestBid?: number;

  @Column({ type: 'enum', enum: AuctionState, default: AuctionState.LIVE })
  state!: AuctionState;

  // Only set for a buy-now close -- endDate is the scheduled end and stays accurate for every
  // other way an auction closes, so this is the one case where endDate alone would mislead.
  @Column({ name: 'closed_at', nullable: true })
  closedAt?: Date;

  @OneToOne(() => Ad)
  @JoinColumn()
  ad!: Ad;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids!: Bid[];

  // Enforces the bid-must-beat-current-high invariant; BidService still persists the change.
  registerBid(amount: number): void {
    if (this.state !== AuctionState.LIVE) {
      throw new BadRequestException(`Cannot bid on an auction in state ${this.state}`);
    }
    if (this.currentHighestBid == null && amount < MIN_STARTING_BID) {
      throw new BadRequestException(`First bid must be at least €${MIN_STARTING_BID}`);
    }
    if (this.currentHighestBid != null && amount <= this.currentHighestBid) {
      throw new BadRequestException('Bid must be higher than the current highest bid');
    }
    this.currentHighestBid = amount;
  }

  sell(): void {
    if (this.state !== AuctionState.LIVE) {
      throw new BadRequestException(`Cannot sell an auction in state ${this.state}`);
    }
    this.state = AuctionState.SOLD;
  }

  expire(): void {
    if (this.state !== AuctionState.LIVE) {
      throw new BadRequestException(`Cannot expire an auction in state ${this.state}`);
    }
    this.state = AuctionState.EXPIRED;
  }

  cancel(): void {
    if (this.state !== AuctionState.LIVE) {
      throw new BadRequestException(`Cannot cancel an auction in state ${this.state}`);
    }
    this.state = AuctionState.CANCELLED;
  }

  // Shared by manual-end and the auto-close cron.
  finalize(): void {
    if (this.currentHighestBid != null && this.currentHighestBid >= this.reservePrice) {
      this.sell();
    } else {
      this.expire();
    }
  }
}
