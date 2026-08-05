import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Auction } from './auction.entity';

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('float')
  amount!: number;

  @Column('float')
  commission!: number;

  @Column()
  timestamp!: Date;

  // Opaque reference into euro-auth's users table, no enforced FK.
  @Column({ name: 'bidder_id' })
  bidderId!: number;

  @ManyToOne(() => Auction, (auction) => auction.bids)
  auction!: Auction;
}
