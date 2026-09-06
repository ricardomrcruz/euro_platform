import 'dotenv/config';
import dataSource from '../../data-source';
import { VehicleMake } from '../entities/vehicle-make.entity';
import { VehicleModel } from '../entities/vehicle-model.entity';
import { VehicleTrim } from '../entities/vehicle-trim.entity';
import { BodyType } from '../enums/body-type.enum';
import { CATALOG_MAKES, FINITIONS_BY_MODEL } from './vehicle-catalog-data';

// One-off (rerunnable) catalog seed, run manually: `npm run seed:vehicle-catalog`.
const GENERIC_TRIMS = ['Base', 'Sport', 'Premium'];
const INSERT_CHUNK_SIZE = 500;

const SUV_MODELS = new Set([
  'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'XM', 'iX', 'iX1', 'iX2', 'iX3',
  'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'RS Q3', 'RS Q8', 'SQ2', 'SQ5', 'SQ6', 'SQ7', 'SQ8',
  'Classe GLA', 'Classe GLB', 'Classe GLC', 'Classe GLE', 'Classe GLK', 'Classe GLS', 'Classe G', 'Classe GL', 'EQA', 'EQB', 'EQE SUV', 'EQS SUV', 'EQG',
  'Cayenne', 'Macan',
  'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar', 'Discovery', 'Discovery Sport', 'Defender', 'Freelander',
  'RAV4', 'Land Cruiser', 'Fortuner', 'FJ', '4-Runner', 'Highlander', 'C-HR', 'C-HR+',
  'Tucson', 'Santa Fe', 'Grand Santa Fe', 'Kona', 'ix35', 'ix55', 'Bayon', 'Terracan', 'Galloper',
  'CR-V', 'HR-V', 'Pilot', 'ZR-V', 'e:Ny1',
  'Kadjar', 'Koleos', 'Captur', 'Austral', 'Arkana', 'Symbioz', 'Duster',
  'Crossland', 'Crossland X', 'Grandland', 'Grandland X', 'Mokka', 'Mokka X', 'Antara', 'Frontera',
  '2008', '3008', '4008', '4007', '5008',
  'Tiguan', 'Tiguan Allspace', 'Touareg', 'T-Roc', 'T-Cross', 'Taigo', 'TAYRON', 'ID.4', 'ID.5', 'ID. Buzz',
  'Ateca', 'Arona', 'Tarraco',
  'Karoq', 'Kodiaq', 'Kamiq', 'Yeti', 'Enyaq', 'Elroq',
  'ASX', 'Outlander', 'Pajero', 'Pajero Pinin', 'Pajero Sport', 'Montero',
  'X-Trail', 'Qashqai', 'Qashqai+2', 'Juke', 'Murano', 'Pathfinder', 'Patrol', 'Terrano', 'Ariya',
  'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-6e', 'CX-7', 'CX-9',
  'NX', 'RX', 'GX', 'LX', 'UX', 'RZ', 'LBX', 'GS',
  'Grand Vitara', 'Vitara', 'Jimny', 'S-Cross', 'SX4 S-Cross', 'Across',
  'XC40', 'XC60', 'XC70', 'XC90', 'EX30', 'EX30 Cross Country', 'EX60', 'EX90',
  'Levante', 'Grecale', 'Urus', 'Bentayga', 'Cullinan',
  'Stelvio', 'Tonale', 'ASX',
  'Bronco', 'Escape', 'Edge', 'Explorer', 'Expedition', 'EcoSport', 'Kuga', 'Puma',
  'Genesis', 'Nexo', 'Staria', 'i-Miev',
  'Sportage', 'Grandis', 'e-tron',
]);

const COUPE_MODELS = new Set([
  'M2', 'M3', 'M4', 'M6', 'M8', 'Série 4', 'Série 6', 'Série 8', 'Z1', 'Z3', 'Z4', 'Z8', 'i8',
  'Coupé', 'TT', 'TT RS', 'TTS', 'R8', 'RS5',
  'Classe CLK', 'Classe CLE', 'Classe CLC', 'AMG GT', 'SLR', 'SLS AMG',
  'Cayman', '911', '718', '944', '928', '924', '968', '928', 'Carrera GT',
  'Mustang', 'Puma', 'Capri', 'Probe', 'Cougar', 'Thunderbird',
  'Corvette', 'Camaro', 'Firebird', 'Trans Am', 'Monte Carlo', 'Fiero',
  'Civic', 'CRX', 'Prelude', 'Integra', 'NSX', 'S2000', 'CR-Z',
  'Genesis Coupe', 'Coupe', 'Scoupe', 'Veloster', 'Tiburon',
  'Supra', 'GR Supra', 'GR86', 'GT86', 'Celica', 'MR', '2000 GT',
  'RX-7', 'RX-8', 'MX-5', 'MX-6',
  'Giulietta', 'GTV', 'Brera', 'Spider', 'MiTo',
  'F-Type', 'XK', 'XK8', 'XKR', 'XJS', 'E-Pace',
  'Boxster', 'Panamera',
  'GranTurismo', 'GranCabrio', 'Ghibli', 'Gransport',
  '570GT', '570S', '600LT', '650S Coupé', '675LT', '720S', '750S', '765LT', '540C', 'MP4 12C',
  'Continental GT', 'Continental GTC',
  'DS3', 'DS4', 'DS5', 'DS4 Crossback',
  'Alpine', 'Wind',
]);

const CONVERTIBLE_MODELS = new Set([
  'Cabriolet', 'Z1', 'Z3', 'Z4', 'Z8', 'Série 4', 'M4',
  '124 Spider', 'Barchetta', 'Spider Europa', 'Spider',
  'Boxster', 'Speedster', '918', 'Carrera GT',
  'MX-5', 'Miata',
  'Continental GTC', 'Azure', 'Corniche', 'Dawn',
  '650S Spider', '675LT Spider', 'MP4 12C Spider',
  'Solstice', 'Firebird',
  'XJS cabriolet', 'F-Type',
  'e-Mehari', 'Méhari',
]);

const WAGON_MODELS = new Set([
  'A4 Allroad', 'A6 Allroad', 'RS4', 'RS6',
  'Classe T', 'Classe E',
  'V40', 'V40 Cross Country', 'V50', 'V60', 'V60 Cross Country', 'V70', 'V70 Cross Country', 'V90', 'V90 Cross Country',
  'Variant', 'Golf', 'Passat',
  'Grande Punto', 'Focus', 'Mondeo',
  '156 Crosswagon',
  'Insignia Ctry Tourer',
  '500L Wagon',
]);

const MINIVAN_MODELS = new Set([
  'Espace', 'Grand Espace', 'Scenic', 'Grand Scenic', 'Symbioz',
  'Zafira', 'Zafira Life', 'Zafira Tourer', 'Meriva',
  'Touran', 'Sharan', 'Multivan', 'Caravelle', 'ID. Buzz',
  'C3 Picasso', 'C4 Picasso', 'C4 SpaceTourer', 'C8', 'Xsara Picasso',
  '5008', '807', '806', 'Galaxy', 'S-MAX', 'C-MAX', 'Grand C-Max', 'B-MAX',
  'Previa', 'Sienna', 'Verso', 'Corolla Verso', 'Avensis Verso',
  'Alhambra', 'Grand Vitara',
  'Odyssey', 'Stream', 'FR-V',
  'PROACE Verso', 'PROACE CITY Verso', 'PROACE Combi', 'Traveller', 'SpaceTourer',
]);

const VAN_MODELS = new Set([
  'Berlingo', 'Partner', 'Partner Tepee', 'Kangoo', 'Caddy', 'Combo', 'Combo Life', 'Combo Tour',
  'Transit', 'Transit 2T', 'Transit CustomCamper', 'Tourneo', 'Tourneo Connect', 'Tourneo Courier',
  'Trafic', 'Master', 'Vivaro', 'Movano', 'Primastar', 'Kubistar',
  'Vito', 'Viano', 'Sprinter', 'Citan', 'Vaneo', 'Marco Polo', 'MB 100', 'Vario', 'Classe V',
  'Transporter', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7 Multivan', 'Crafter', 'LT', 'VW-Busse', 'Minibus',
  'Jumper', 'Jumpy', 'Boxer', 'Expert', 'Expert Tepee', 'Ducato', 'Doblo', 'Scudo', 'Talento', 'Fiorino', 'Fiorino Qubo',
  'Bipper', 'Bipper Tepee', 'Rifter', 'J5',
  'NV200', 'NV250', 'NV300', 'NV400', 'Cabstar', 'Interstar', 'Urvan', 'Vanette', 'Townstar',
  'HiAce', 'TownAce', 'LiteAce', 'PROACE Verso',
  'Cargo', 'Custom', 'Customline',
  'Escapade', 'Iltis',
]);

const PICKUP_MODELS = new Set([
  'Hilux', 'Ranger', 'Navara', 'L200', 'Amarok', 'Tacoma', 'Tundra', 'F 100', 'F 150', 'F 250',
  'F 350', 'Silverado', 'Colorado', 'Frontier', 'Raptor', 'K1500', 'C1500', 'K30', 'BT-50',
  'Pick-up', 'Pick Up Sportscap', 'Alaskan', 'S-10',
]);

function guessBodyType(bareName: string): BodyType | undefined {
  if (SUV_MODELS.has(bareName)) return BodyType.SUV;
  if (VAN_MODELS.has(bareName)) return BodyType.VAN;
  if (MINIVAN_MODELS.has(bareName)) return BodyType.MINIVAN;
  if (PICKUP_MODELS.has(bareName)) return BodyType.PICKUP;
  if (CONVERTIBLE_MODELS.has(bareName)) return BodyType.CONVERTIBLE;
  if (WAGON_MODELS.has(bareName)) return BodyType.WAGON;
  if (COUPE_MODELS.has(bareName)) return BodyType.COUPE;

  const lower = bareName.toLowerCase();
  if (/cabriolet|spider|roadster|cabrio/.test(lower)) return BodyType.CONVERTIBLE;
  if (/break|touring sports|estate|kombi|sw\b/.test(lower)) return BodyType.WAGON;
  if (/coupe|coupé/.test(lower)) return BodyType.COUPE;
  if (/pick-?up/.test(lower)) return BodyType.PICKUP;
  if (/van\b|minibus|combi\b/.test(lower)) return BodyType.VAN;
  if (/cross(?!way)/.test(lower)) return BodyType.CROSSOVER;

  if (bareName === 'Autre') return undefined;

  // Small/compact hatch-shaped city cars across brands, identified by well-known nameplates.
  const HATCHBACK_NAMES = new Set([
    '1', '2', '3', 'Série 1', 'Série 2', 'Série 3', 'A1', 'A2', 'A3', 'Q3 Sportback',
    'C1', 'C2', 'C3', 'C4', 'DS3', '106', '107', '108', 'Panda', 'Punto', 'Grande Punto',
    'Fiesta', 'Focus', 'Fusion', 'Ka', 'Ka+', 'Classe A', 'Classe B', 'One', 'Cooper', 'Mini',
    'Micra', 'Note', 'Leaf', 'Pulsar', 'Corsa', 'Astra', 'Adam', 'Karl', 'Agila',
    '106', '107', '108', '206', '207', '208', '306', '307', '308', 'Clio', 'Twingo', 'Megane',
    'Zoe', 'Yaris', 'Aygo', 'Aygo X', 'Auris', 'Corolla', 'i10', 'i20', 'i30', 'Getz', 'Accent',
    'Golf', 'Polo', 'Up', 'Lupo', 'Fox', 'ID.3', 'Fabia', 'Citigo', 'Scala', 'Rapid',
    'Ibiza', 'Leon', 'Arosa', 'Mii', 'Swift', 'Alto', 'Baleno', 'Ignis', 'Splash', 'Celerio',
    '2', '3', '5', 'Mazda 2', 'Mazda 3', 'Jazz', 'City', 'Colt', 'ZS', 'ZR', 'MG3', 'MG4',
  ]);
  if (HATCHBACK_NAMES.has(bareName)) return BodyType.HATCHBACK;

  return undefined;
}

async function ensureMake(name: string): Promise<VehicleMake> {
  const makeRepo = dataSource.getRepository(VehicleMake);
  const existing = await makeRepo.findOneBy({ name });
  if (existing) return existing;
  return makeRepo.save(makeRepo.create({ name }));
}

async function ensureModel(make: VehicleMake, bareName: string): Promise<VehicleModel> {
  const modelRepo = dataSource.getRepository(VehicleModel);
  const fullName = `${make.name} ${bareName}`.trim();
  const existing = await modelRepo.findOne({ where: { make: { id: make.id }, name: fullName } });
  if (existing) return existing;
  return modelRepo.save(
    modelRepo.create({ make, name: fullName, bodyType: guessBodyType(bareName) }),
  );
}

function trimsForModel(makeName: string, bareModelName: string): string[] {
  const brandFinitions = FINITIONS_BY_MODEL[makeName];
  if (!brandFinitions) return GENERIC_TRIMS;

  const ownList = brandFinitions[bareModelName];
  if (ownList) return ownList;

  const pooled = new Set<string>();
  for (const list of Object.values(brandFinitions)) {
    for (const name of list) pooled.add(name);
  }
  return [...pooled].sort((a, b) => a.localeCompare(b));
}

async function insertMissingTrims(model: VehicleModel, names: string[]): Promise<number> {
  const trimRepo = dataSource.getRepository(VehicleTrim);
  const existing = await trimRepo.find({ where: { model: { id: model.id } }, select: { name: true } });
  const existingNames = new Set(existing.map((t) => t.name));
  const toInsert = names.filter((name) => !existingNames.has(name));
  if (toInsert.length === 0) return 0;

  for (let i = 0; i < toInsert.length; i += INSERT_CHUNK_SIZE) {
    const chunk = toInsert.slice(i, i + INSERT_CHUNK_SIZE).map((name) => ({ model: { id: model.id }, name }));
    await trimRepo.insert(chunk);
  }
  return toInsert.length;
}

async function run(): Promise<void> {
  await dataSource.initialize();

  let makesCreated = 0;
  let modelsCreated = 0;
  let trimsCreated = 0;

  for (const [makeName, bareModels] of Object.entries(CATALOG_MAKES)) {
    const makeRepo = dataSource.getRepository(VehicleMake);
    const existingMake = await makeRepo.findOneBy({ name: makeName });
    const make = await ensureMake(makeName);
    if (!existingMake) makesCreated++;

    let makeModels = 0;
    let makeTrims = 0;

    for (const bareModel of bareModels) {
      try {
        const modelRepo = dataSource.getRepository(VehicleModel);
        const fullName = `${make.name} ${bareModel}`.trim();
        const existingModel = await modelRepo.findOne({ where: { make: { id: make.id }, name: fullName } });
        const model = await ensureModel(make, bareModel);
        if (!existingModel) {
          modelsCreated++;
          makeModels++;
        }

        const names = trimsForModel(makeName, bareModel);
        const inserted = await insertMissingTrims(model, names);
        trimsCreated += inserted;
        makeTrims += inserted;
      } catch (error) {
        console.warn(`Skipped ${makeName} ${bareModel} after error: ${(error as Error).message}`);
      }
    }

    console.log(`${makeName}: ${makeModels} models created, ${makeTrims} trims created.`);
  }

  console.log(`Done. Makes created: ${makesCreated}, models created: ${modelsCreated}, trims created: ${trimsCreated}.`);
  await dataSource.destroy();
}

run().catch((error) => {
  console.error('Catalog seed failed:', error);
  process.exit(1);
});
