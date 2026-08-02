import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ad } from './ad.entity';

@Entity('ad_photos')
export class AdPhoto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  url!: string;

  @Column({ nullable: true })
  caption?: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({ name: 'is_primary', default: false })
  isPrimary!: boolean;

  @ManyToOne(() => Ad, (ad) => ad.photos, { onDelete: 'CASCADE' })
  ad!: Ad;
}
