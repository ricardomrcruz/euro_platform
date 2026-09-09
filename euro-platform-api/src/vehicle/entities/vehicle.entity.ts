import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleMake } from './vehicle-make.entity';
import { VehicleModel } from './vehicle-model.entity';
import { VehicleTrim } from './vehicle-trim.entity';
import { VehicleColor } from '../enums/vehicle-color.enum';
import { CritAir } from '../enums/crit-air.enum';
import { Transmission } from '../enums/transmission.enum';
import { Drivetrain } from '../enums/drivetrain.enum';
import { FuelType } from '../enums/fuel-type.enum';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  vin?: string;

  @Column()
  year!: number;

  @Column({ name: 'exterior_color', type: 'enum', enum: VehicleColor, enumName: 'vehicle_color_enum', nullable: true })
  exteriorColor?: VehicleColor;

  @Column({ name: 'interior_color', type: 'enum', enum: VehicleColor, enumName: 'vehicle_color_enum', nullable: true })
  interiorColor?: VehicleColor;

  @Column({ nullable: true })
  mileage?: number;

  @Column({ name: 'number_of_owners', nullable: true })
  numberOfOwners?: number;

  @Column({ name: 'plate_country', nullable: true })
  plateCountry?: string;

  // French administrative tax rating (cv) -- distinct from horsepower (DIN, the real physical
  // power, which lives on the trim).
  @Column({ name: 'fiscal_power' })
  fiscalPower!: number;

  // French emissions vignette -- optional, not derivable cleanly from fuel type + year alone.
  @Column({ name: 'crit_air', type: 'enum', enum: CritAir, nullable: true })
  critAir?: CritAir;

  @Column({ name: 'number_of_seats', nullable: true })
  numberOfSeats?: number;

  // Lives here, not on VehicleTrim: the same trim (e.g. "GTI") commonly ships as both a 3-door
  // and 5-door body variant, so door count is a per-car fact, not a catalog-level trim fact.
  @Column({ name: 'number_of_doors', nullable: true })
  numberOfDoors?: number;

  // The 8 fields below default to whatever the selected finition's matching powertrain
  // specifies (see VehicleTrimPowertrain) but are this car's own values -- a seller can
  // override any of them individually when their actual car differs from the catalog entry.
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

  @Column({ name: 'fuel_type', type: 'enum', enum: FuelType, enumName: 'fuel_type_enum', nullable: true })
  fuelType?: FuelType;

  @Column({ nullable: true })
  weight?: number;

  @ManyToOne(() => VehicleMake)
  make!: VehicleMake;

  @ManyToOne(() => VehicleModel)
  model!: VehicleModel;

  @ManyToOne(() => VehicleTrim, { nullable: true })
  trim?: VehicleTrim;
}
