import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleTrim } from './vehicle-trim.entity';
import { Transmission } from '../enums/transmission.enum';
import { Drivetrain } from '../enums/drivetrain.enum';
import { FuelType } from '../enums/fuel-type.enum';

// A finition name (e.g. "GT Line") commonly ships with several distinct engines -- one row
// per fuel type actually offered under that finition, each with its own engine/output figures.
@Entity('vehicle_trim_powertrains')
@Index(['trim', 'fuelType'], { unique: true })
export class VehicleTrimPowertrain {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'fuel_type', type: 'enum', enum: FuelType, enumName: 'fuel_type_enum' })
  fuelType!: FuelType;

  @Column({ nullable: true })
  engine?: string;

  @Column({ type: 'float', nullable: true })
  displacement?: number;

  @Column({ nullable: true })
  horsepower?: number;

  @Column({ nullable: true })
  torque?: number;

  @Column({ type: 'enum', enum: Transmission, enumName: 'transmission_enum', nullable: true })
  transmission?: Transmission;

  @Column({ type: 'enum', enum: Drivetrain, enumName: 'drivetrain_enum', nullable: true })
  drivetrain?: Drivetrain;

  @Column({ nullable: true })
  weight?: number;

  @ManyToOne(() => VehicleTrim, (trim) => trim.powertrains, { onDelete: 'CASCADE' })
  trim!: VehicleTrim;
}
