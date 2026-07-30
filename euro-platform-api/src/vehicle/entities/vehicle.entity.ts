import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleMake } from './vehicle-make.entity';
import { VehicleModel } from './vehicle-model.entity';
import { VehicleTrim } from './vehicle-trim.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  vin?: string;

  @Column()
  year!: number;

  @Column({ name: 'exterior_color', nullable: true })
  exteriorColor?: string;

  @Column({ name: 'interior_color', nullable: true })
  interiorColor?: string;

  @Column({ nullable: true })
  mileage?: number;

  @Column({ name: 'number_of_owners', nullable: true })
  numberOfOwners?: number;

  @Column({ name: 'plate_country', nullable: true })
  plateCountry?: string;

  @ManyToOne(() => VehicleMake)
  make!: VehicleMake;

  @ManyToOne(() => VehicleModel)
  model!: VehicleModel;

  @ManyToOne(() => VehicleTrim, { nullable: true })
  trim?: VehicleTrim;
}
