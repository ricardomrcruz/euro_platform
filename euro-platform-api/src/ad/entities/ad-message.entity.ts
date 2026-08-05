import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from '../../auth/enums/user-role.enum';
import { Ad } from './ad.entity';

// Chat thread on an ad, between its seller and admins.
@Entity('ad_messages')
export class AdMessage {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  message!: string;

  // Opaque reference into euro-auth's users table, no enforced FK.
  @Column({ name: 'sender_id' })
  senderId!: number;

  // Stored redundantly to avoid a lookup back into euro-auth.
  @Column({ name: 'sender_role', type: 'enum', enum: UserRole })
  senderRole!: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Ad, { onDelete: 'CASCADE' })
  ad!: Ad;
}
