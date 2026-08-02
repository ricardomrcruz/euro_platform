import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../../auth/enums/user-role.enum';
import { Ad } from './ad.entity';

// Ongoing admin<->seller conversation on an ad (e.g. "needs a photo of the rear lights to
// validate") -- separate from the one-shot rejectionMessage field on Ad, though a reject
// call also posts its message here as the first entry (see AdService.rejectAd).
@Entity('ad_messages')
export class AdMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  message!: string;

  // Opaque reference into euro-auth's users table, same pattern as Ad.sellerId -- no
  // enforced FK across services.
  @Column({ name: 'sender_id' })
  senderId!: number;

  // Stored redundantly (not looked up) so the thread renders "Admin"/"Seller" without
  // calling back into euro-auth.
  @Column({ name: 'sender_role', type: 'enum', enum: UserRole })
  senderRole!: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Ad, { onDelete: 'CASCADE' })
  ad!: Ad;
}
