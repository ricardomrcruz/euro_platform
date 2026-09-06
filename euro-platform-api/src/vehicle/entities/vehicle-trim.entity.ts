import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleModel } from './vehicle-model.entity';
import { Transmission } from '../enums/transmission.enum';
import { Drivetrain } from '../enums/drivetrain.enum';
import { FuelType } from '../enums/fuel-type.enum';

// A trim name isn't tied to one specific model-year -- e.g. "AMG Line" has existed across
// several C-Class generations. year is kept for cases where it's actually known, but is no
// longer part of what makes a trim unique.
@Entity('vehicle_trims')
@Index(['model', 'name'], { unique: true })
export class VehicleTrim {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  year?: number;

  @Column({ nullable: true })
  engine?: string;

  @Column({ type: 'float', nullable: true })
  displacement?: number;

  @Column({ nullable: true })
  horsepower?: number;

  @Column({ nullable: true })
  torque?: number;

  @Column({ type: 'enum', enum: Transmission, nullable: true })
  transmission?: Transmission;

  @Column({ type: 'enum', enum: Drivetrain, nullable: true })
  drivetrain?: Drivetrain;

  @Column({ name: 'fuel_type', type: 'enum', enum: FuelType, nullable: true })
  fuelType?: FuelType;

  @Column({ nullable: true })
  weight?: number;

  @Column({ name: 'external_id', nullable: true })
  externalId?: number;

  @ManyToOne(() => VehicleModel, (model) => model.trims)
  model!: VehicleModel;
}
