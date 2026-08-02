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

  // World Manufacturer Identifier(s) -- first 3 characters of a VIN. A make can have
  // several (different plants/regions), so this is an array, not a single value. Used by
  // VehicleFactoryService.resolveByVin() for best-effort make recognition from a VIN.
  @Column('text', { name: 'wmi_codes', array: true, nullable: true })
  wmiCodes?: string[];

  @OneToMany(() => VehicleModel, (model) => model.make)
  models!: VehicleModel[];
}
