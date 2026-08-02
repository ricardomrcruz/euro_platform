import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleMake } from './vehicle-make.entity';
import { VehicleTrim } from './vehicle-trim.entity';
import { BodyType } from '../enums/body-type.enum';

@Entity('vehicle_models')
@Index(['make', 'name'], { unique: true })
export class VehicleModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ name: 'body_type', type: 'enum', enum: BodyType, nullable: true })
  bodyType?: BodyType;

  @Column({ name: 'year_start', nullable: true })
  yearStart?: number;

  @Column({ name: 'year_end', nullable: true })
  yearEnd?: number;

  @Column({ name: 'external_id', nullable: true })
  externalId?: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl?: string;

  @ManyToOne(() => VehicleMake, (make) => make.models)
  make!: VehicleMake;

  @OneToMany(() => VehicleTrim, (trim) => trim.model)
  trims!: VehicleTrim[];
}
