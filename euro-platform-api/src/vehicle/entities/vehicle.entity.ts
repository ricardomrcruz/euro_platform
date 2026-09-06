import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleMake } from './vehicle-make.entity';
import { VehicleModel } from './vehicle-model.entity';
import { VehicleTrim } from './vehicle-trim.entity';
import { VehicleColor } from '../enums/vehicle-color.enum';
import { CritAir } from '../enums/crit-air.enum';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  vin?: string;

  @Column()
  year!: number;

  @Column({ name: 'exterior_color', type: 'enum', enum: VehicleColor, nullable: true })
  exteriorColor?: VehicleColor;

  @Column({ name: 'interior_color', nullable: true })
  interiorColor?: string;

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

  @ManyToOne(() => VehicleMake)
  make!: VehicleMake;

  @ManyToOne(() => VehicleModel)
  model!: VehicleModel;

  @ManyToOne(() => VehicleTrim, { nullable: true })
  trim?: VehicleTrim;
}
