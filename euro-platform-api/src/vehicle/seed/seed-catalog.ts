import 'dotenv/config';
import axios from 'axios';
import dataSource from '../../data-source';
import { VehicleMake } from '../entities/vehicle-make.entity';
import { VehicleModel } from '../entities/vehicle-model.entity';
import { VehicleTrim } from '../entities/vehicle-trim.entity';
import { VehicleTrimPowertrain } from '../entities/vehicle-trim-powertrain.entity';
import { mapBodyType, mapFuelType } from '../catalog-mappers.util';

// One-off (rerunnable) catalog seed, run manually: `npm run seed:catalog`.
// Not part of the running app -- populates VehicleMake/VehicleModel/VehicleTrim from
// Wikidata's public SPARQL endpoint, since neither CarAPI (2015-2020 only) nor NHTSA
// (US-market-submission-biased) fit a European collectible-car catalog.
//
// Wikidata data quality caveats, deliberately not engineered around here:
// - Coverage tracks notability, not completeness -- strong for well-documented/famous
//   cars, sparse for generic trims. That's fine for an enthusiast/collectible platform.
// - Quantity properties (displacement/power/torque) don't reliably record a consistent
//   unit across items (cc vs L, hp vs kW vs PS, N*m vs lb-ft) -- stored best-effort as
//   whatever magnitude Wikidata returns, not unit-normalized. Sellers can correct these
//   per-listing later.
// - Each model gets one synthetic "Standard" VehicleTrim as a baseline, not a real
//   distinct trim level -- we don't have per-trim granularity from this source.
// - `transmission`, `drivetrain`, `numberOfDoors` are left unset on purpose: after
//   checking real items (incl. a flagship, extremely well-documented one), no confirmed
//   Wikidata property exists for these on car-model items. Not guessing at property IDs
//   for these -- left null until a real source is confirmed, not a forgotten TODO.
//   `engine` (P1002 engine configuration) and `fuelType` (P516 "powered by") are real,
//   confirmed properties and are seeded below.

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

// European manufacturer countries + Japan, by Wikidata QID (P17 on the manufacturer).
// Not exhaustive of every European country -- extend this list as needed.
const COUNTRY_QIDS = [
  'Q142', // France
  'Q183', // Germany
  'Q38', // Italy
  'Q145', // United Kingdom
  'Q17', // Japan
  'Q29', // Spain
  'Q34', // Sweden
  'Q55', // Netherlands
  'Q31', // Belgium
  'Q40', // Austria
  'Q39', // Switzerland
  'Q213', // Czech Republic
  'Q36', // Poland
];

const RESULT_LIMIT = 2000;

interface SparqlValue {
  value: string;
}

interface SparqlBinding {
  modelLabel?: SparqlValue;
  manufacturerLabel?: SparqlValue;
  classLabel?: SparqlValue;
  displacement?: SparqlValue;
  power?: SparqlValue;
  torque?: SparqlValue;
  engineConfigLabel?: SparqlValue;
  poweredByLabel?: SparqlValue;
  wmiCode?: SparqlValue;
  countryLabel?: SparqlValue;
}

interface SparqlResponse {
  results: { bindings: SparqlBinding[] };
}

function buildQuery(): string {
  const values = COUNTRY_QIDS.map((qid) => `wd:${qid}`).join(' ');
  return `
    SELECT ?modelLabel ?manufacturerLabel ?classLabel
           ?displacement ?power ?torque ?engineConfigLabel ?poweredByLabel ?wmiCode
           ?countryLabel
    WHERE {
      VALUES ?country { ${values} }
      ?model wdt:P31 ?class .
      ?class wdt:P279* wd:Q3231690 .
      ?model wdt:P176 ?manufacturer .
      ?manufacturer wdt:P17 ?country .
      OPTIONAL { ?model wdt:P8628 ?displacement . }
      OPTIONAL { ?model wdt:P2109 ?power . }
      OPTIONAL { ?model wdt:P2230 ?torque . }
      OPTIONAL { ?model wdt:P1002 ?engineConfig . }
      OPTIONAL { ?model wdt:P516 ?poweredBy . }
      OPTIONAL { ?manufacturer wdt:P6793 ?wmiCode . }
      SERVICE wikibase:label {
        bd:serviceParam wikibase:language "en,fr,de,it,ja,es,sv,nl,cs,pl".
      }
    }
    LIMIT ${RESULT_LIMIT}
  `;
}

// When an entity has no label in any of the requested languages, Wikidata's label service
// falls back to returning the raw entity ID (e.g. "Q53098") instead of failing -- that's
// worse than skipping the row, since a QID isn't a usable name in the catalog.
function isUsableLabel(value?: string): value is string {
  return !!value && !/^Q\d+$/.test(value);
}

async function fetchWikidataRows(): Promise<SparqlBinding[]> {
  const response = await axios.get<SparqlResponse>(SPARQL_ENDPOINT, {
    params: { query: buildQuery(), format: 'json' },
    headers: {
      Accept: 'application/sparql-results+json',
      // Wikidata's usage policy asks for an identifying User-Agent on programmatic access.
      'User-Agent': 'euro-platform-api-catalog-seed/1.0 (school project, non-commercial)',
    },
    timeout: 60_000,
  });
  return response.data.results.bindings;
}

async function run(): Promise<void> {
  await dataSource.initialize();
  const makeRepository = dataSource.getRepository(VehicleMake);
  const modelRepository = dataSource.getRepository(VehicleModel);
  const trimRepository = dataSource.getRepository(VehicleTrim);
  const trimPowertrainRepository = dataSource.getRepository(VehicleTrimPowertrain);

  console.log('Querying Wikidata...');
  const rows = await fetchWikidataRows();
  console.log(`Got ${rows.length} rows from Wikidata.`);

  let makesCreated = 0;
  let modelsCreated = 0;
  let trimsCreated = 0;
  let rowsFailed = 0;

  for (const row of rows) {
    try {
      const makeName = row.manufacturerLabel?.value;
      const modelName = row.modelLabel?.value;
      if (!isUsableLabel(makeName) || !isUsableLabel(modelName)) {
        continue;
      }

      let make = await makeRepository.findOneBy({ name: makeName });
      if (!make) {
        make = await makeRepository.save(makeRepository.create({ name: makeName }));
        makesCreated++;
      }

      // A manufacturer can have several WMI codes (different plants/regions) -- Wikidata
      // returns one row per code, so accumulate across rows rather than overwrite.
      const wmiCode = row.wmiCode?.value;
      if (wmiCode && !make.wmiCodes?.includes(wmiCode)) {
        make.wmiCodes = [...(make.wmiCodes ?? []), wmiCode];
        make = await makeRepository.save(make);
      }

      if (!make.country && isUsableLabel(row.countryLabel?.value)) {
        make.country = row.countryLabel.value;
        make = await makeRepository.save(make);
      }

      // (make, name) and (model, name) are a model's/trim's actual identity in this
      // catalog -- looked up by name directly, same as make above.
      let model = await modelRepository.findOne({ where: { make: { id: make.id }, name: modelName } });

      if (!model) {
        model = await modelRepository.save(
          modelRepository.create({
            make,
            name: modelName,
            bodyType: mapBodyType(row.classLabel?.value),
          }),
        );
        modelsCreated++;
      }

      let existingTrim = await trimRepository.findOne({
        where: { model: { id: model.id }, name: 'Standard' },
      });

      if (!existingTrim) {
        const trim = await trimRepository.save(
          trimRepository.create({
            model,
            name: 'Standard',
          }),
        );

        // P516 ("powered by") is multi-valued for hybrids (e.g. both a gasoline engine and
        // an electric motor) -- SPARQL returns one row per value, so this only captures
        // whichever fuel type is processed first for this trim. Good enough for a
        // best-effort seed; not worth a GROUP_CONCAT rewrite for this.
        const fuelType = mapFuelType(row.poweredByLabel?.value);
        if (fuelType) {
          await trimPowertrainRepository.save(
            trimPowertrainRepository.create({
              trim,
              fuelType,
              displacement: row.displacement ? Number(row.displacement.value) : undefined,
              horsepower: row.power ? Math.round(Number(row.power.value)) : undefined,
              torque: row.torque ? Math.round(Number(row.torque.value)) : undefined,
              engine: row.engineConfigLabel?.value,
            }),
          );
        }
        trimsCreated++;
      }
    } catch (error) {
      // One bad row shouldn't halt a 2000-row batch -- log and move on. Whatever succeeded
      // before/after this row stays committed (saves aren't wrapped in one transaction).
      rowsFailed++;
      console.warn(`Skipped a row after error: ${(error as Error).message}`);
    }
  }

  console.log(
    `Done. Makes created: ${makesCreated}, models created: ${modelsCreated}, ` +
      `trims created: ${trimsCreated}, rows skipped after error: ${rowsFailed}.`,
  );
  await dataSource.destroy();
}

run().catch((error) => {
  console.error('Catalog seed failed:', error);
  process.exit(1);
});
