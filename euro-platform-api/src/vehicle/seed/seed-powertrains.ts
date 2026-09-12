import 'dotenv/config';
import { ILike } from 'typeorm';
import dataSource from '../../data-source';
import { VehicleMake } from '../entities/vehicle-make.entity';
import { VehicleModel } from '../entities/vehicle-model.entity';
import { VehicleTrim } from '../entities/vehicle-trim.entity';
import { VehicleTrimPowertrain } from '../entities/vehicle-trim-powertrain.entity';
import { POWERTRAINS_BY_MODEL, PowertrainRow } from './powertrain-data';

// One-off (rerunnable) seed for real powertrain data, run manually: `npm run seed:powertrains`.
// Re-running refreshes the spec figures on rows it already created, so the dataset can be
// improved in place.

const POWERTRAIN_FIELDS: (keyof PowertrainRow)[] = [
  'engine',
  'displacement',
  'horsepower',
  'torque',
  'transmission',
  'drivetrain',
  'weight',
];

async function run(): Promise<void> {
  await dataSource.initialize();
  const makeRepo = dataSource.getRepository(VehicleMake);
  const modelRepo = dataSource.getRepository(VehicleModel);
  const trimRepo = dataSource.getRepository(VehicleTrim);
  const powertrainRepo = dataSource.getRepository(VehicleTrimPowertrain);

  let trimsCreated = 0;
  let powertrainsCreated = 0;
  let powertrainsUpdated = 0;
  let modelsMissing = 0;

  for (const [makeName, models] of Object.entries(POWERTRAINS_BY_MODEL)) {
    const make = await makeRepo.findOne({ where: { name: ILike(makeName) } });
    if (!make) {
      console.warn(`Make not in catalog, skipping: ${makeName}`);
      continue;
    }

    for (const [bareModel, trims] of Object.entries(models)) {
      const fullName = `${make.name} ${bareModel}`;
      const model = await modelRepo.findOne({
        where: { make: { id: make.id }, name: ILike(fullName) },
      });
      if (!model) {
        console.warn(`Model not in catalog, skipping: ${fullName}`);
        modelsMissing++;
        continue;
      }

      for (const trimRow of trims) {
        let trim = await trimRepo.findOne({
          where: { model: { id: model.id }, name: ILike(trimRow.name) },
        });
        if (!trim) {
          trim = await trimRepo.save(trimRepo.create({ model, name: trimRow.name }));
          trimsCreated++;
        }

        for (const pt of trimRow.powertrains) {
          const existing = await powertrainRepo.findOne({
            where: { trim: { id: trim.id }, fuelType: pt.fuelType },
          });

          if (existing) {
            for (const field of POWERTRAIN_FIELDS) {
              (existing as Record<string, unknown>)[field] = pt[field] ?? null;
            }
            await powertrainRepo.save(existing);
            powertrainsUpdated++;
          } else {
            await powertrainRepo.save(
              powertrainRepo.create({
                trim,
                fuelType: pt.fuelType,
                engine: pt.engine,
                displacement: pt.displacement,
                horsepower: pt.horsepower,
                torque: pt.torque,
                transmission: pt.transmission,
                drivetrain: pt.drivetrain,
                weight: pt.weight,
              }),
            );
            powertrainsCreated++;
          }
        }
      }
    }
  }

  console.log(
    `Done. Trims created: ${trimsCreated}, powertrains created: ${powertrainsCreated}, ` +
      `powertrains updated: ${powertrainsUpdated}, models missing from catalog: ${modelsMissing}.`,
  );
  await dataSource.destroy();
}

run().catch((error) => {
  console.error('Powertrain seed failed:', error);
  process.exit(1);
});
