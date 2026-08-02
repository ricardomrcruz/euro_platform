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

// Design doc 8.2: State Pattern for Ad/Auction is implemented as an enum + guard methods on
// the entity (not a class per state) -- same approach already used for User.checkPassword()
// in euro-auth. The entity owns its own valid transitions; AdService just calls these.
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

  // Opaque reference into euro-auth's users table -- no enforced FK, per the
  // no-cross-service-coupling decision (separate schemas, separate services).
  @Column({ name: 'seller_id' })
  sellerId!: number;

  @ManyToOne(() => Vehicle)
  vehicle!: Vehicle;

  @OneToMany(() => AdPhoto, (photo) => photo.ad)
  photos!: AdPhoto[];

  canEdit(): boolean {
    return this.status === AdStatus.DRAFT || this.status === AdStatus.REJECTED;
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
