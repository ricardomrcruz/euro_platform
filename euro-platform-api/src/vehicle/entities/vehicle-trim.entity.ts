import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { VehicleModel } from './vehicle-model.entity';
import { VehicleTrimPowertrain } from './vehicle-trim-powertrain.entity';

// A trim name isn't tied to one specific model-year -- e.g. "AMG Line" has existed across
// several C-Class generations, so (model, name) alone is what makes a trim unique, not a
// year. Engine/output figures live on VehicleTrimPowertrain, not here, since the same
// finition name commonly ships with several distinct engines.
@Entity('vehicle_trims')
@Index(['model', 'name'], { unique: true })
export class VehicleTrim {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToOne(() => VehicleModel, (model) => model.trims)
  model!: VehicleModel;

  @OneToMany(() => VehicleTrimPowertrain, (powertrain) => powertrain.trim)
  powertrains!: VehicleTrimPowertrain[];
}
