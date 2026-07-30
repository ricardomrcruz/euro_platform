import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleModel } from './vehicle-model.entity';

@Entity('vehicle_makes')
export class VehicleMake {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;

  @Column({ name: 'external_id', nullable: true })
  externalId?: number;

  @OneToMany(() => VehicleModel, (model) => model.make)
  models!: VehicleModel[];
}
