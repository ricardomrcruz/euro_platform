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
