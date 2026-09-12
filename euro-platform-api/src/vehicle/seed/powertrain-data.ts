import { FuelType } from '../enums/fuel-type.enum';
import { Transmission } from '../enums/transmission.enum';
import { Drivetrain } from '../enums/drivetrain.enum';

// Curated, real-world powertrain figures for a set of well-known models, used to give the
// vehicle_trim_powertrains table meaningful data. Output figures are metric (ch / Nm),
// weights are kerb weight in kg where a confident figure is known and omitted otherwise.
// Each trim keeps one representative powertrain per fuel type (the table's (trim, fuel_type)
// key), picked to match how the car is most commonly sold.

export interface PowertrainRow {
  fuelType: FuelType;
  engine: string;
  displacement?: number;
  horsepower: number;
  torque?: number;
  transmission: Transmission;
  drivetrain: Drivetrain;
  weight?: number;
}

export interface TrimRow {
  name: string;
  powertrains: PowertrainRow[];
}

// Keyed by make (as stored, uppercase) -> bare model name (as stored after the make prefix).
export const POWERTRAINS_BY_MODEL: Record<string, Record<string, TrimRow[]>> = {
  VOLKSWAGEN: {
    Golf: [
      {
        name: 'Life',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.0 TSI', displacement: 1.0, horsepower: 110, torque: 200, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1289 },
          { fuelType: FuelType.DIESEL, engine: '2.0 TDI', displacement: 2.0, horsepower: 115, torque: 300, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1401 },
        ],
      },
      {
        name: 'Style',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.5 TSI', displacement: 1.5, horsepower: 150, torque: 250, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1323 },
          { fuelType: FuelType.DIESEL, engine: '2.0 TDI', displacement: 2.0, horsepower: 150, torque: 360, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1428 },
        ],
      },
      {
        name: 'R-Line',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.5 eTSI mild hybrid', displacement: 1.5, horsepower: 150, torque: 250, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1347 },
          { fuelType: FuelType.DIESEL, engine: '2.0 TDI', displacement: 2.0, horsepower: 150, torque: 360, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1428 },
        ],
      },
      {
        name: 'GTE',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '1.4 TSI plug-in hybrid', displacement: 1.4, horsepower: 245, torque: 400, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1596 },
        ],
      },
      {
        name: 'GTD',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.0 TDI', displacement: 2.0, horsepower: 200, torque: 400, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1508 },
        ],
      },
      {
        name: 'GTI',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TSI', displacement: 2.0, horsepower: 245, torque: 370, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1479 },
        ],
      },
      {
        name: 'R',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TSI', displacement: 2.0, horsepower: 320, torque: 420, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1551 },
        ],
      },
    ],
    Polo: [
      {
        name: 'Life',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.0 MPI', displacement: 1.0, horsepower: 80, torque: 93, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1150 },
        ],
      },
      {
        name: 'Style',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.0 TSI', displacement: 1.0, horsepower: 110, torque: 200, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1200 },
        ],
      },
      {
        name: 'GTI',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TSI', displacement: 2.0, horsepower: 207, torque: 320, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1355 },
        ],
      },
    ],
    Tiguan: [
      {
        name: 'Life',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.5 eTSI mild hybrid', displacement: 1.5, horsepower: 150, torque: 250, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1638 },
          { fuelType: FuelType.DIESEL, engine: '2.0 TDI', displacement: 2.0, horsepower: 150, torque: 360, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1714 },
        ],
      },
      {
        name: 'Elegance',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TSI', displacement: 2.0, horsepower: 204, torque: 320, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1782 },
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '1.5 eHybrid', displacement: 1.5, horsepower: 272, torque: 400, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1856 },
        ],
      },
      {
        name: 'R-Line',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TSI', displacement: 2.0, horsepower: 265, torque: 400, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1799 },
          { fuelType: FuelType.DIESEL, engine: '2.0 TDI', displacement: 2.0, horsepower: 193, torque: 400, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1795 },
        ],
      },
    ],
  },

  AUDI: {
    A3: [
      {
        name: '30 TFSI',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.0 TFSI', displacement: 1.0, horsepower: 110, torque: 200, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1305 },
        ],
      },
      {
        name: '35 TFSI',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.5 TFSI', displacement: 1.5, horsepower: 150, torque: 250, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1340 },
        ],
      },
      {
        name: '35 TDI',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.0 TDI', displacement: 2.0, horsepower: 150, torque: 360, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1425 },
        ],
      },
      {
        name: '40 TFSIe',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '1.4 TFSI plug-in hybrid', displacement: 1.4, horsepower: 204, torque: 350, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1660 },
        ],
      },
      {
        name: 'S3',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TFSI', displacement: 2.0, horsepower: 333, torque: 420, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1575 },
        ],
      },
      {
        name: 'RS3',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.5 TFSI 5-cylinder', displacement: 2.5, horsepower: 400, torque: 500, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1575 },
        ],
      },
    ],
    A4: [
      {
        name: '35 TFSI',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TFSI', displacement: 2.0, horsepower: 150, torque: 270, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1510 },
        ],
      },
      {
        name: '40 TFSI',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TFSI', displacement: 2.0, horsepower: 204, torque: 320, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1525 },
        ],
      },
      {
        name: '40 TDI quattro',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.0 TDI', displacement: 2.0, horsepower: 204, torque: 400, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1660 },
        ],
      },
      {
        name: 'S4 TDI',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '3.0 V6 TDI', displacement: 3.0, horsepower: 341, torque: 700, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1795 },
        ],
      },
    ],
    Q5: [
      {
        name: '40 TDI quattro',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.0 TDI', displacement: 2.0, horsepower: 204, torque: 400, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1865 },
        ],
      },
      {
        name: '45 TFSI quattro',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TFSI', displacement: 2.0, horsepower: 265, torque: 370, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1825 },
        ],
      },
      {
        name: '55 TFSIe quattro',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '2.0 TFSI plug-in hybrid', displacement: 2.0, horsepower: 367, torque: 500, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2135 },
        ],
      },
      {
        name: 'SQ5 TDI',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '3.0 V6 TDI', displacement: 3.0, horsepower: 341, torque: 700, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2060 },
        ],
      },
    ],
    TT: [
      {
        name: '40 TFSI',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TFSI', displacement: 2.0, horsepower: 197, torque: 320, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1385 },
        ],
      },
      {
        name: 'TTS',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TFSI', displacement: 2.0, horsepower: 320, torque: 400, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1520 },
        ],
      },
      {
        name: 'TT RS',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.5 TFSI 5-cylinder', displacement: 2.5, horsepower: 400, torque: 480, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1544 },
        ],
      },
    ],
    R8: [
      {
        name: 'V10 performance',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '5.2 V10', displacement: 5.2, horsepower: 620, torque: 580, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1660 },
        ],
      },
    ],
  },

  BMW: {
    'Série 1': [
      {
        name: '118i',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.5 turbo 3-cylinder', displacement: 1.5, horsepower: 140, torque: 230, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1370 },
        ],
      },
      {
        name: '120d',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.0 turbo diesel', displacement: 2.0, horsepower: 190, torque: 400, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1540 },
        ],
      },
      {
        name: 'M135i xDrive',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo', displacement: 2.0, horsepower: 306, torque: 450, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1560 },
        ],
      },
    ],
    'Série 3': [
      {
        name: '320i',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo', displacement: 2.0, horsepower: 184, torque: 300, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1545 },
        ],
      },
      {
        name: '330i',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo', displacement: 2.0, horsepower: 258, torque: 400, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1570 },
        ],
      },
      {
        name: '320d',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.0 turbo diesel', displacement: 2.0, horsepower: 190, torque: 400, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1610 },
        ],
      },
      {
        name: '330e',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '2.0 turbo plug-in hybrid', displacement: 2.0, horsepower: 292, torque: 420, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1740 },
        ],
      },
      {
        name: 'M340i xDrive',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.0 turbo 6-cylinder', displacement: 3.0, horsepower: 374, torque: 500, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1720 },
        ],
      },
    ],
    M3: [
      {
        name: 'Competition',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.0 twin-turbo 6-cylinder', displacement: 3.0, horsepower: 510, torque: 650, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1730 },
        ],
      },
      {
        name: 'Competition xDrive',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.0 twin-turbo 6-cylinder', displacement: 3.0, horsepower: 510, torque: 650, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1780 },
        ],
      },
    ],
    'Série 5': [
      {
        name: '520d',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.0 turbo diesel mild hybrid', displacement: 2.0, horsepower: 197, torque: 400, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1755 },
        ],
      },
      {
        name: '530e',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '2.0 turbo plug-in hybrid', displacement: 2.0, horsepower: 299, torque: 450, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 2000 },
        ],
      },
      {
        name: 'i5 eDrive40',
        powertrains: [
          { fuelType: FuelType.ELECTRIC, engine: 'Single motor', horsepower: 340, torque: 400, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 2200 },
        ],
      },
    ],
    Z4: [
      {
        name: 'sDrive20i',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo', displacement: 2.0, horsepower: 197, torque: 320, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1405 },
        ],
      },
      {
        name: 'M40i',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.0 turbo 6-cylinder', displacement: 3.0, horsepower: 340, torque: 500, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1535 },
        ],
      },
    ],
  },

  'MERCEDES-BENZ': {
    'Classe A': [
      {
        name: 'A 180',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.3 turbo', displacement: 1.3, horsepower: 136, torque: 200, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1375 },
        ],
      },
      {
        name: 'A 200 d',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.0 turbo diesel', displacement: 2.0, horsepower: 150, torque: 320, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1485 },
        ],
      },
      {
        name: 'A 250 e',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '1.3 turbo plug-in hybrid', displacement: 1.3, horsepower: 218, torque: 450, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1680 },
        ],
      },
      {
        name: 'AMG A 35 4MATIC',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo', displacement: 2.0, horsepower: 306, torque: 400, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1555 },
        ],
      },
      {
        name: 'AMG A 45 S 4MATIC+',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo', displacement: 2.0, horsepower: 421, torque: 500, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1620 },
        ],
      },
    ],
    'Classe C': [
      {
        name: 'C 200',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.5 turbo mild hybrid', displacement: 1.5, horsepower: 204, torque: 300, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1625 },
        ],
      },
      {
        name: 'C 220 d',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.0 turbo diesel mild hybrid', displacement: 2.0, horsepower: 200, torque: 440, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1700 },
        ],
      },
      {
        name: 'C 300 e',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '2.0 turbo plug-in hybrid', displacement: 2.0, horsepower: 313, torque: 550, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1955 },
        ],
      },
      {
        name: 'AMG C 43 4MATIC',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo mild hybrid', displacement: 2.0, horsepower: 408, torque: 500, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1820 },
        ],
      },
      {
        name: 'AMG C 63 S E Performance',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '2.0 turbo plug-in hybrid', displacement: 2.0, horsepower: 680, torque: 1020, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2165 },
        ],
      },
    ],
    'Classe E': [
      {
        name: 'E 220 d',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.0 turbo diesel mild hybrid', displacement: 2.0, horsepower: 197, torque: 440, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1840 },
        ],
      },
      {
        name: 'E 300 e',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '2.0 turbo plug-in hybrid', displacement: 2.0, horsepower: 313, torque: 550, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 2100 },
        ],
      },
    ],
    'AMG GT': [
      {
        name: 'GT 63 4MATIC+',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '4.0 V8 biturbo', displacement: 4.0, horsepower: 585, torque: 800, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2015 },
        ],
      },
      {
        name: 'GT R',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '4.0 V8 biturbo', displacement: 4.0, horsepower: 585, torque: 700, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1630 },
        ],
      },
    ],
  },

  PEUGEOT: {
    '208': [
      {
        name: 'Active',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: 'PureTech 75', displacement: 1.2, horsepower: 75, torque: 118, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1090 },
        ],
      },
      {
        name: 'Allure',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: 'PureTech 100', displacement: 1.2, horsepower: 100, torque: 205, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1113 },
          { fuelType: FuelType.DIESEL, engine: 'BlueHDi 100', displacement: 1.5, horsepower: 100, torque: 250, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1215 },
        ],
      },
      {
        name: 'GT',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: 'PureTech 130', displacement: 1.2, horsepower: 130, torque: 230, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1165 },
          { fuelType: FuelType.ELECTRIC, engine: 'e-208 single motor', horsepower: 156, torque: 260, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1530 },
        ],
      },
    ],
    '308': [
      {
        name: 'Allure',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: 'PureTech 130', displacement: 1.2, horsepower: 130, torque: 230, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1301 },
          { fuelType: FuelType.DIESEL, engine: 'BlueHDi 130', displacement: 1.5, horsepower: 130, torque: 300, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1388 },
        ],
      },
      {
        name: 'GT',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: 'Hybrid 180', displacement: 1.6, horsepower: 180, torque: 360, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1614 },
          { fuelType: FuelType.ELECTRIC, engine: 'e-308 single motor', horsepower: 156, torque: 270, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1717 },
        ],
      },
    ],
    '3008': [
      {
        name: 'Allure',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: 'PureTech 130', displacement: 1.2, horsepower: 130, torque: 230, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1320 },
          { fuelType: FuelType.DIESEL, engine: 'BlueHDi 130', displacement: 1.5, horsepower: 130, torque: 300, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1435 },
        ],
      },
      {
        name: 'GT',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: 'Hybrid 225', displacement: 1.6, horsepower: 225, torque: 360, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1770 },
        ],
      },
      {
        name: 'GT Hybrid4',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: 'Hybrid4 300', displacement: 1.6, horsepower: 300, torque: 520, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1875 },
        ],
      },
    ],
    '508': [
      {
        name: 'Allure',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: 'PureTech 130', displacement: 1.2, horsepower: 130, torque: 230, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1394 },
          { fuelType: FuelType.DIESEL, engine: 'BlueHDi 130', displacement: 1.5, horsepower: 130, torque: 300, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1481 },
        ],
      },
      {
        name: 'GT',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: 'PureTech 180', displacement: 1.6, horsepower: 180, torque: 250, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1440 },
          { fuelType: FuelType.PLUGIN_HYBRID, engine: 'Hybrid 225', displacement: 1.6, horsepower: 225, torque: 360, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1710 },
        ],
      },
      {
        name: 'PSE',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: 'Hybrid4 360', displacement: 1.6, horsepower: 360, torque: 520, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1875 },
        ],
      },
    ],
    RCZ: [
      {
        name: 'THP 200',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.6 THP', displacement: 1.6, horsepower: 200, torque: 275, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1355 },
        ],
      },
      {
        name: 'R',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.6 THP', displacement: 1.6, horsepower: 270, torque: 330, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1280 },
        ],
      },
    ],
  },

  RENAULT: {
    Clio: [
      {
        name: 'Evolution',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: 'TCe 90', displacement: 1.0, horsepower: 90, torque: 160, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1178 },
          { fuelType: FuelType.LPG, engine: 'TCe 100 LPG', displacement: 1.0, horsepower: 100, torque: 170, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1213 },
        ],
      },
      {
        name: 'Techno',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: 'TCe 90', displacement: 1.0, horsepower: 90, torque: 160, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1178 },
          { fuelType: FuelType.HYBRID, engine: 'E-Tech full hybrid 145', displacement: 1.6, horsepower: 145, torque: 205, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1298 },
        ],
      },
      {
        name: 'Esprit Alpine',
        powertrains: [
          { fuelType: FuelType.HYBRID, engine: 'E-Tech full hybrid 145', displacement: 1.6, horsepower: 145, torque: 205, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1298 },
        ],
      },
    ],
    Megane: [
      {
        name: 'Techno',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: 'TCe 140', displacement: 1.3, horsepower: 140, torque: 260, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1320 },
          { fuelType: FuelType.DIESEL, engine: 'Blue dCi 115', displacement: 1.5, horsepower: 115, torque: 260, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1400 },
        ],
      },
      {
        name: 'E-Tech EV60',
        powertrains: [
          { fuelType: FuelType.ELECTRIC, engine: 'Single motor 60 kWh', horsepower: 220, torque: 300, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1636 },
        ],
      },
      {
        name: 'R.S. 300 Trophy',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.8 turbo', displacement: 1.8, horsepower: 300, torque: 420, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1450 },
        ],
      },
    ],
    Captur: [
      {
        name: 'Techno',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: 'TCe 90', displacement: 1.0, horsepower: 90, torque: 160, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1276 },
          { fuelType: FuelType.HYBRID, engine: 'E-Tech full hybrid 145', displacement: 1.6, horsepower: 145, torque: 205, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1408 },
        ],
      },
    ],
  },

  TOYOTA: {
    Corolla: [
      {
        name: 'Dynamic',
        powertrains: [
          { fuelType: FuelType.HYBRID, engine: '1.8 full hybrid', displacement: 1.8, horsepower: 140, torque: 185, transmission: Transmission.CVT, drivetrain: Drivetrain.FWD, weight: 1375 },
        ],
      },
      {
        name: 'GR Sport',
        powertrains: [
          { fuelType: FuelType.HYBRID, engine: '2.0 full hybrid', displacement: 2.0, horsepower: 196, torque: 190, transmission: Transmission.CVT, drivetrain: Drivetrain.FWD, weight: 1450 },
        ],
      },
    ],
    'C-HR': [
      {
        name: 'Dynamic',
        powertrains: [
          { fuelType: FuelType.HYBRID, engine: '1.8 full hybrid', displacement: 1.8, horsepower: 140, torque: 185, transmission: Transmission.CVT, drivetrain: Drivetrain.FWD, weight: 1445 },
        ],
      },
      {
        name: 'GR Sport',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '2.0 plug-in hybrid', displacement: 2.0, horsepower: 223, torque: 208, transmission: Transmission.CVT, drivetrain: Drivetrain.FWD, weight: 1745 },
        ],
      },
    ],
    RAV4: [
      {
        name: 'Dynamic',
        powertrains: [
          { fuelType: FuelType.HYBRID, engine: '2.5 full hybrid', displacement: 2.5, horsepower: 218, torque: 221, transmission: Transmission.CVT, drivetrain: Drivetrain.FWD, weight: 1615 },
        ],
      },
      {
        name: 'GR Sport',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '2.5 plug-in hybrid', displacement: 2.5, horsepower: 306, torque: 270, transmission: Transmission.CVT, drivetrain: Drivetrain.AWD, weight: 1920 },
        ],
      },
    ],
    'GR Supra': [
      {
        name: '2.0',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo', displacement: 2.0, horsepower: 258, torque: 400, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1395 },
        ],
      },
      {
        name: '3.0',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.0 turbo 6-cylinder', displacement: 3.0, horsepower: 340, torque: 500, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1495 },
        ],
      },
    ],
    GR86: [
      {
        name: 'Base',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.4 flat-4', displacement: 2.4, horsepower: 234, torque: 250, transmission: Transmission.MANUAL, drivetrain: Drivetrain.RWD, weight: 1275 },
        ],
      },
    ],
  },

  PORSCHE: {
    '911': [
      {
        name: 'Carrera',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.0 flat-6 twin-turbo', displacement: 3.0, horsepower: 394, torque: 450, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1520 },
        ],
      },
      {
        name: 'Carrera S',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.0 flat-6 twin-turbo', displacement: 3.0, horsepower: 450, torque: 530, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1540 },
        ],
      },
      {
        name: 'Carrera 4S',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.0 flat-6 twin-turbo', displacement: 3.0, horsepower: 450, torque: 530, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1585 },
        ],
      },
      {
        name: 'Turbo S',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.7 flat-6 twin-turbo', displacement: 3.7, horsepower: 650, torque: 800, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1640 },
        ],
      },
      {
        name: 'GT3',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '4.0 flat-6 naturally aspirated', displacement: 4.0, horsepower: 510, torque: 470, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1435 },
        ],
      },
    ],
    Cayman: [
      {
        name: '718 Cayman',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 flat-4 turbo', displacement: 2.0, horsepower: 300, torque: 380, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1365 },
        ],
      },
      {
        name: '718 Cayman S',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.5 flat-4 turbo', displacement: 2.5, horsepower: 350, torque: 420, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1385 },
        ],
      },
      {
        name: '718 Cayman GT4',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '4.0 flat-6 naturally aspirated', displacement: 4.0, horsepower: 420, torque: 420, transmission: Transmission.MANUAL, drivetrain: Drivetrain.RWD, weight: 1420 },
        ],
      },
    ],
    Cayenne: [
      {
        name: 'Cayenne',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.0 V6 turbo', displacement: 3.0, horsepower: 353, torque: 500, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2030 },
        ],
      },
      {
        name: 'Cayenne E-Hybrid',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '3.0 V6 turbo plug-in hybrid', displacement: 3.0, horsepower: 470, torque: 650, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2295 },
        ],
      },
      {
        name: 'Cayenne Turbo GT',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '4.0 V8 twin-turbo', displacement: 4.0, horsepower: 660, torque: 850, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2280 },
        ],
      },
    ],
    Macan: [
      {
        name: 'Macan',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo', displacement: 2.0, horsepower: 265, torque: 400, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1895 },
        ],
      },
      {
        name: 'Macan Electric 4',
        powertrains: [
          { fuelType: FuelType.ELECTRIC, engine: 'Dual motor', horsepower: 408, torque: 650, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2405 },
        ],
      },
    ],
    Taycan: [
      {
        name: 'Taycan',
        powertrains: [
          { fuelType: FuelType.ELECTRIC, engine: 'Single motor', horsepower: 435, torque: 410, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 2130 },
        ],
      },
      {
        name: 'Taycan Turbo S',
        powertrains: [
          { fuelType: FuelType.ELECTRIC, engine: 'Dual motor', horsepower: 952, torque: 1110, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2320 },
        ],
      },
    ],
  },

  'ALFA ROMEO': {
    Giulia: [
      {
        name: 'Sprint',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo', displacement: 2.0, horsepower: 200, torque: 330, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1429 },
          { fuelType: FuelType.DIESEL, engine: '2.2 turbo diesel', displacement: 2.2, horsepower: 160, torque: 450, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1515 },
        ],
      },
      {
        name: 'Veloce',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo', displacement: 2.0, horsepower: 280, torque: 400, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1480 },
        ],
      },
      {
        name: 'Quadrifoglio',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.9 V6 biturbo', displacement: 2.9, horsepower: 520, torque: 600, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1580 },
        ],
      },
    ],
    Stelvio: [
      {
        name: 'Sprint',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo', displacement: 2.0, horsepower: 280, torque: 400, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1660 },
          { fuelType: FuelType.DIESEL, engine: '2.2 turbo diesel', displacement: 2.2, horsepower: 210, torque: 470, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1730 },
        ],
      },
      {
        name: 'Quadrifoglio',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.9 V6 biturbo', displacement: 2.9, horsepower: 520, torque: 600, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1830 },
        ],
      },
    ],
  },

  MAZDA: {
    'MX-5': [
      {
        name: '1.5 Skyactiv-G',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.5 naturally aspirated', displacement: 1.5, horsepower: 132, torque: 152, transmission: Transmission.MANUAL, drivetrain: Drivetrain.RWD, weight: 1030 },
        ],
      },
      {
        name: '2.0 Skyactiv-G',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 naturally aspirated', displacement: 2.0, horsepower: 184, torque: 205, transmission: Transmission.MANUAL, drivetrain: Drivetrain.RWD, weight: 1045 },
        ],
      },
    ],
    'Mazda 3': [
      {
        name: 'Skyactiv-G 122',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 mild hybrid', displacement: 2.0, horsepower: 122, torque: 213, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1335 },
        ],
      },
      {
        name: 'Skyactiv-X 186',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 Skyactiv-X mild hybrid', displacement: 2.0, horsepower: 186, torque: 240, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1410 },
        ],
      },
    ],
    'CX-5': [
      {
        name: 'Skyactiv-G 165',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 naturally aspirated', displacement: 2.0, horsepower: 165, torque: 213, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1520 },
        ],
      },
      {
        name: 'Skyactiv-D 184 AWD',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.2 twin-turbo diesel', displacement: 2.2, horsepower: 184, torque: 445, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1690 },
        ],
      },
    ],
  },

  NISSAN: {
    'GT-R': [
      {
        name: 'Premium',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.8 V6 twin-turbo', displacement: 3.8, horsepower: 570, torque: 637, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1752 },
        ],
      },
      {
        name: 'Nismo',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.8 V6 twin-turbo', displacement: 3.8, horsepower: 600, torque: 652, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1720 },
        ],
      },
    ],
    Qashqai: [
      {
        name: 'N-Connecta',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.3 mild hybrid', displacement: 1.3, horsepower: 158, torque: 260, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1450 },
        ],
      },
      {
        name: 'Tekna e-POWER',
        powertrains: [
          { fuelType: FuelType.HYBRID, engine: '1.5 e-POWER series hybrid', displacement: 1.5, horsepower: 190, torque: 330, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1666 },
        ],
      },
    ],
    Leaf: [
      {
        name: 'Acenta',
        powertrains: [
          { fuelType: FuelType.ELECTRIC, engine: 'Single motor 40 kWh', horsepower: 150, torque: 320, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1580 },
        ],
      },
      {
        name: 'Tekna e+',
        powertrains: [
          { fuelType: FuelType.ELECTRIC, engine: 'Single motor 62 kWh', horsepower: 217, torque: 340, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1756 },
        ],
      },
    ],
  },

  FORD: {
    Fiesta: [
      {
        name: 'Titanium',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.0 EcoBoost mild hybrid', displacement: 1.0, horsepower: 125, torque: 210, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1178 },
        ],
      },
      {
        name: 'ST',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.5 EcoBoost 3-cylinder', displacement: 1.5, horsepower: 200, torque: 320, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1262 },
        ],
      },
    ],
    Focus: [
      {
        name: 'Titanium',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.0 EcoBoost mild hybrid', displacement: 1.0, horsepower: 155, torque: 190, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1372 },
          { fuelType: FuelType.DIESEL, engine: '1.5 EcoBlue', displacement: 1.5, horsepower: 120, torque: 300, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1440 },
        ],
      },
      {
        name: 'ST',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.3 EcoBoost', displacement: 2.3, horsepower: 280, torque: 420, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1508 },
        ],
      },
    ],
    Mustang: [
      {
        name: 'GT',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '5.0 V8', displacement: 5.0, horsepower: 449, torque: 529, transmission: Transmission.MANUAL, drivetrain: Drivetrain.RWD, weight: 1740 },
        ],
      },
      {
        name: 'Dark Horse',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '5.0 V8', displacement: 5.0, horsepower: 453, torque: 540, transmission: Transmission.MANUAL, drivetrain: Drivetrain.RWD, weight: 1805 },
        ],
      },
      {
        name: 'Mach 1',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '5.0 V8', displacement: 5.0, horsepower: 460, torque: 529, transmission: Transmission.MANUAL, drivetrain: Drivetrain.RWD, weight: 1780 },
        ],
      },
    ],
    Puma: [
      {
        name: 'ST-Line',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.0 EcoBoost mild hybrid', displacement: 1.0, horsepower: 155, torque: 190, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1280 },
        ],
      },
      {
        name: 'ST',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.5 EcoBoost 3-cylinder', displacement: 1.5, horsepower: 200, torque: 320, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1358 },
        ],
      },
    ],
  },

  HONDA: {
    Civic: [
      {
        name: 'Elegance',
        powertrains: [
          { fuelType: FuelType.HYBRID, engine: '2.0 e:HEV full hybrid', displacement: 2.0, horsepower: 184, torque: 315, transmission: Transmission.CVT, drivetrain: Drivetrain.FWD, weight: 1467 },
        ],
      },
      {
        name: 'Type R',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 VTEC Turbo', displacement: 2.0, horsepower: 329, torque: 420, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1429 },
        ],
      },
    ],
    'CR-V': [
      {
        name: 'Elegance e:HEV',
        powertrains: [
          { fuelType: FuelType.HYBRID, engine: '2.0 e:HEV full hybrid', displacement: 2.0, horsepower: 184, torque: 335, transmission: Transmission.CVT, drivetrain: Drivetrain.FWD, weight: 1660 },
        ],
      },
      {
        name: 'Advance Tech e:PHEV',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '2.0 e:PHEV plug-in hybrid', displacement: 2.0, horsepower: 184, torque: 335, transmission: Transmission.CVT, drivetrain: Drivetrain.FWD, weight: 1848 },
        ],
      },
    ],
    S2000: [
      {
        name: 'Base',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 VTEC naturally aspirated', displacement: 2.0, horsepower: 240, torque: 208, transmission: Transmission.MANUAL, drivetrain: Drivetrain.RWD, weight: 1260 },
        ],
      },
    ],
    NSX: [
      {
        name: 'Base',
        powertrains: [
          { fuelType: FuelType.HYBRID, engine: '3.5 V6 twin-turbo hybrid', displacement: 3.5, horsepower: 581, torque: 646, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1725 },
        ],
      },
    ],
  },

  SKODA: {
    Octavia: [
      {
        name: 'Ambition',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.5 TSI mild hybrid', displacement: 1.5, horsepower: 150, torque: 250, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1376 },
          { fuelType: FuelType.DIESEL, engine: '2.0 TDI', displacement: 2.0, horsepower: 150, torque: 360, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1471 },
        ],
      },
      {
        name: 'RS',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TSI', displacement: 2.0, horsepower: 265, torque: 370, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1505 },
        ],
      },
    ],
    Enyaq: [
      {
        name: '85',
        powertrains: [
          { fuelType: FuelType.ELECTRIC, engine: 'Single motor 82 kWh', horsepower: 286, torque: 545, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 2143 },
        ],
      },
      {
        name: 'RS',
        powertrains: [
          { fuelType: FuelType.ELECTRIC, engine: 'Dual motor 82 kWh', horsepower: 340, torque: 545, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2296 },
        ],
      },
    ],
  },

  SEAT: {
    Leon: [
      {
        name: 'FR',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.5 eTSI mild hybrid', displacement: 1.5, horsepower: 150, torque: 250, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1335 },
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '1.5 e-Hybrid', displacement: 1.5, horsepower: 204, torque: 350, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1587 },
        ],
      },
      {
        name: 'Cupra',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 TSI', displacement: 2.0, horsepower: 300, torque: 400, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1445 },
        ],
      },
    ],
    Ibiza: [
      {
        name: 'FR',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '1.0 TSI', displacement: 1.0, horsepower: 115, torque: 200, transmission: Transmission.MANUAL, drivetrain: Drivetrain.FWD, weight: 1188 },
        ],
      },
    ],
  },

  VOLVO: {
    XC60: [
      {
        name: 'Plus B4',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.0 turbo diesel mild hybrid', displacement: 2.0, horsepower: 197, torque: 420, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1900 },
        ],
      },
      {
        name: 'Ultra T8 AWD',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '2.0 turbo plug-in hybrid', displacement: 2.0, horsepower: 455, torque: 709, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2150 },
        ],
      },
    ],
    XC40: [
      {
        name: 'Plus B3',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '2.0 turbo mild hybrid', displacement: 2.0, horsepower: 163, torque: 265, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FWD, weight: 1735 },
        ],
      },
      {
        name: 'Recharge Twin',
        powertrains: [
          { fuelType: FuelType.ELECTRIC, engine: 'Dual motor 78 kWh', horsepower: 408, torque: 660, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2188 },
        ],
      },
    ],
  },

  LAMBORGHINI: {
    Huracan: [
      {
        name: 'EVO',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '5.2 V10 naturally aspirated', displacement: 5.2, horsepower: 640, torque: 600, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1422 },
        ],
      },
      {
        name: 'STO',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '5.2 V10 naturally aspirated', displacement: 5.2, horsepower: 640, torque: 565, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1339 },
        ],
      },
    ],
    Urus: [
      {
        name: 'S',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '4.0 V8 twin-turbo', displacement: 4.0, horsepower: 666, torque: 850, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2197 },
        ],
      },
      {
        name: 'SE',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '4.0 V8 twin-turbo plug-in hybrid', displacement: 4.0, horsepower: 800, torque: 950, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2565 },
        ],
      },
    ],
  },

  BENTLEY: {
    'Continental GT': [
      {
        name: 'V8',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '4.0 V8 twin-turbo', displacement: 4.0, horsepower: 550, torque: 770, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2165 },
        ],
      },
      {
        name: 'Speed',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '6.0 W12 twin-turbo', displacement: 6.0, horsepower: 659, torque: 900, transmission: Transmission.SEMI_AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2280 },
        ],
      },
    ],
    Bentayga: [
      {
        name: 'V8',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '4.0 V8 twin-turbo', displacement: 4.0, horsepower: 550, torque: 770, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2416 },
        ],
      },
    ],
  },

  JAGUAR: {
    'F-Type': [
      {
        name: 'P450',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '5.0 V8 supercharged', displacement: 5.0, horsepower: 450, torque: 580, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.RWD, weight: 1620 },
        ],
      },
      {
        name: 'R75',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '5.0 V8 supercharged', displacement: 5.0, horsepower: 575, torque: 700, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1743 },
        ],
      },
    ],
    'F-Pace': [
      {
        name: 'D200 AWD',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '2.0 turbo diesel mild hybrid', displacement: 2.0, horsepower: 204, torque: 430, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 1861 },
        ],
      },
      {
        name: 'SVR',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '5.0 V8 supercharged', displacement: 5.0, horsepower: 550, torque: 700, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.AWD, weight: 2070 },
        ],
      },
    ],
  },

  'LAND-ROVER': {
    Defender: [
      {
        name: '110 D250',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '3.0 inline-6 turbo diesel mild hybrid', displacement: 3.0, horsepower: 249, torque: 570, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FOUR_WD, weight: 2245 },
        ],
      },
      {
        name: '110 P400',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '3.0 inline-6 turbo mild hybrid', displacement: 3.0, horsepower: 400, torque: 550, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FOUR_WD, weight: 2323 },
        ],
      },
      {
        name: '110 V8',
        powertrains: [
          { fuelType: FuelType.GASOLINE, engine: '5.0 V8 supercharged', displacement: 5.0, horsepower: 525, torque: 625, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FOUR_WD, weight: 2551 },
        ],
      },
    ],
    'Range Rover Sport': [
      {
        name: 'D350',
        powertrains: [
          { fuelType: FuelType.DIESEL, engine: '3.0 inline-6 turbo diesel mild hybrid', displacement: 3.0, horsepower: 350, torque: 700, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FOUR_WD, weight: 2560 },
        ],
      },
      {
        name: 'P550e',
        powertrains: [
          { fuelType: FuelType.PLUGIN_HYBRID, engine: '3.0 inline-6 turbo plug-in hybrid', displacement: 3.0, horsepower: 550, torque: 800, transmission: Transmission.AUTOMATIC, drivetrain: Drivetrain.FOUR_WD, weight: 2810 },
        ],
      },
    ],
  },
};
