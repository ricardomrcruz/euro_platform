import { BadRequestException } from '@nestjs/common';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicle/entities/vehicle.entity';
import { AdStatus } from '../enums/ad-status.enum';
import { VehicleCondition } from '../enums/vehicle-condition.enum';
import { AdPhoto } from './ad-photo.entity';

// State transitions are guarded here, not in a separate class-per-state hierarchy.
@Entity('ads')
export class Ad {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column({ type: 'enum', enum: VehicleCondition })
  condition!: VehicleCondition;

  @Column({ type: 'enum', enum: AdStatus, default: AdStatus.DRAFT })
  status!: AdStatus;

  @Column('text', { nullable: true })
  highlights?: string;

  @Column('text', { name: 'known_flaws', nullable: true })
  knownFlaws?: string;

  @Column('text', { nullable: true })
  modifications?: string;

  @Column('text', { name: 'service_history', nullable: true })
  serviceHistory?: string;

  @Column({ nullable: true })
  location?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column('text', { name: 'rejection_message', nullable: true })
  rejectionMessage?: string;

  // Opaque reference into euro-auth's users table, no enforced FK.
  @Column({ name: 'seller_id' })
  sellerId!: number;

  // Transient, not persisted -- populated on read by whichever service resolved it via
  // AuthClientService.getPublicNames() (currently AuctionService, for the auction-detail page).
  sellerName?: string;

  @ManyToOne(() => Vehicle)
  vehicle!: Vehicle;

  @OneToMany(() => AdPhoto, (photo) => photo.ad)
  photos!: AdPhoto[];

  canEdit(): boolean {
    return this.status === AdStatus.DRAFT || this.status === AdStatus.REJECTED;
  }

  // A VALIDATED ad's fundamentals (vehicle, title, condition, location) are locked forever --
  // only content fields (description/highlights/knownFlaws/modifications/serviceHistory) and
  // photos may still change, and doing so always sends the ad back for re-review via
  // resubmitForReview(). Allowed regardless of whether a live auction already exists for this
  // ad -- deliberately not gated on auction state.
  canEditContent(): boolean {
    return this.status === AdStatus.VALIDATED;
  }

  resubmitForReview(): void {
    if (this.status !== AdStatus.VALIDATED) {
      throw new BadRequestException(`Cannot resubmit an ad in status ${this.status}`);
    }
    this.status = AdStatus.REVIEW;
  }

  submit(): void {
    if (this.status !== AdStatus.DRAFT && this.status !== AdStatus.REJECTED) {
      throw new BadRequestException(`Cannot submit an ad in status ${this.status}`);
    }
    this.status = AdStatus.REVIEW;
  }

  validate(): void {
    if (this.status !== AdStatus.REVIEW) {
      throw new BadRequestException(`Cannot validate an ad in status ${this.status}`);
    }
    this.status = AdStatus.VALIDATED;
  }

  reject(message: string): void {
    if (this.status !== AdStatus.REVIEW) {
      throw new BadRequestException(`Cannot reject an ad in status ${this.status}`);
    }
    this.status = AdStatus.REJECTED;
    this.rejectionMessage = message;
  }
}
