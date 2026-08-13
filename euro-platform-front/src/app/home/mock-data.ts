// UI-mock data only -- no backend wiring yet. Real data will come from GET /auctions and
// GET /ads/:id once the frontend's data needs are settled and the DTOs get built around them.
// Placeholder images (placehold.co) stand in for real AdPhoto records for now.

export interface AuctionCardData {
  id: number;
  photoUrl: string;
  title: string;
  highlights: string;
  location: string;
  currentBid: number;
  endDate: Date;
  listedAt: Date;
  mileage: number;
  badge?: 'NO RESERVE';
}

export interface FeaturedCar {
  id: number;
  title: string;
  subtitle: string;
  mainPhotoUrl: string;
  detailPhotoUrls: [string, string, string, string];
  currentBid: number;
  endDate: Date;
}

export const HOUR = 60 * 60 * 1000;
export const DAY = 24 * HOUR;
const now = Date.now();

export function placeholder(label: string, bg = 'CBD5E1', fg = '1E293B', size = '800x600'): string {
  return `https://placehold.co/${size}/${bg}/${fg}?text=${encodeURIComponent(label)}`;
}

export const FEATURED_CARS: FeaturedCar[] = [
  {
    id: 101,
    title: '2015 Porsche 911 Carrera S',
    subtitle: '9k km',
    mainPhotoUrl: placeholder('2015 Porsche 911 Carrera S', 'CBD5E1', '0F172A', '1200x800'),
    detailPhotoUrls: [
      placeholder('Interior', '94A3B8', '0F172A'),
      placeholder('Rear 3/4', 'CBD5E1', '0F172A'),
      placeholder('Engine Bay', '94A3B8', '0F172A'),
      placeholder('Seats', 'CBD5E1', '0F172A'),
    ],
    currentBid: 85000,
    endDate: new Date(now + 6 * DAY),
  },
  {
    id: 102,
    title: '2019 Audi RS6 Avant',
    subtitle: '15k km',
    mainPhotoUrl: placeholder('2019 Audi RS6 Avant', 'CBD5E1', '0F172A', '1200x800'),
    detailPhotoUrls: [
      placeholder('Interior', '94A3B8', '0F172A'),
      placeholder('Rear 3/4', 'CBD5E1', '0F172A'),
      placeholder('Engine Bay', '94A3B8', '0F172A'),
      placeholder('Wheels', 'CBD5E1', '0F172A'),
    ],
    currentBid: 62000,
    endDate: new Date(now + 4 * DAY),
  },
  {
    id: 103,
    title: '2021 BMW M3 Competition',
    subtitle: '8k km',
    mainPhotoUrl: placeholder('2021 BMW M3 Competition', 'CBD5E1', '0F172A', '1200x800'),
    detailPhotoUrls: [
      placeholder('Interior', '94A3B8', '0F172A'),
      placeholder('Rear 3/4', 'CBD5E1', '0F172A'),
      placeholder('Engine Bay', '94A3B8', '0F172A'),
      placeholder('Seats', 'CBD5E1', '0F172A'),
    ],
    currentBid: 71500,
    endDate: new Date(now + 2 * DAY),
  },
  {
    id: 104,
    title: '2018 Mercedes-AMG GT R',
    subtitle: '12k km',
    mainPhotoUrl: placeholder('2018 Mercedes-AMG GT R', 'CBD5E1', '0F172A', '1200x800'),
    detailPhotoUrls: [
      placeholder('Interior', '94A3B8', '0F172A'),
      placeholder('Rear 3/4', 'CBD5E1', '0F172A'),
      placeholder('Engine Bay', '94A3B8', '0F172A'),
      placeholder('Wheels', 'CBD5E1', '0F172A'),
    ],
    currentBid: 98000,
    endDate: new Date(now + 5 * DAY),
  },
];

export const MOCK_AUCTIONS: AuctionCardData[] = [
  {
    id: 1,
    photoUrl: placeholder('2004 Lamborghini Gallardo'),
    title: '2004 Lamborghini Gallardo Coupe',
    highlights: '10k Miles, V10, AWD, Arancio Borealis, Mostly Unmodified, $15k+ Recent Service',
    location: 'Chandler, AZ 85248',
    currentBid: 95000,
    endDate: new Date(now + 18 * HOUR + 32 * 60 * 1000),
    listedAt: new Date(now - 6 * DAY),
    mileage: 16000,
  },
  {
    id: 2,
    photoUrl: placeholder('1998 Mitsubishi Evo V'),
    title: '1998 Mitsubishi Lancer Evolution V GSR',
    highlights: 'Japanese-Market Sedan, 5-Speed Manual, Evolution IX Turbocharger, U.S. Title',
    location: 'Issaquah, WA 98027',
    currentBid: 23000,
    endDate: new Date(now + 18 * HOUR + 35 * 60 * 1000),
    listedAt: new Date(now - 5 * DAY),
    mileage: 88000,
  },
  {
    id: 3,
    photoUrl: placeholder('2019 BMW M850i xDrive'),
    title: '2019 BMW M850i xDrive Coupe',
    highlights: 'Twin-Turbo V8, AWD, Highly Equipped, Numerous Modifications',
    location: 'Shawnee Mission, KS 66223',
    currentBid: 27000,
    endDate: new Date(now + 18 * HOUR + 38 * 60 * 1000),
    listedAt: new Date(now - 1 * DAY),
    mileage: 31000,
    badge: 'NO RESERVE',
  },
  {
    id: 4,
    photoUrl: placeholder('2011 Lotus Elise R'),
    title: '2011 Lotus Elise R',
    highlights: '37k Miles, 6-Speed Manual, Touring Package, Saffron Yellow',
    location: 'Oak Lawn, IL 60453',
    currentBid: 50000,
    endDate: new Date(now + 18 * HOUR + 41 * 60 * 1000),
    listedAt: new Date(now - 4 * DAY),
    mileage: 37000,
  },
  {
    id: 5,
    photoUrl: placeholder('2017 Porsche Cayman GT4'),
    title: '2017 Porsche Cayman GT4',
    highlights: 'Guards Red, PCCB, Sport Chrono Package, Adaptive Sport Seats',
    location: 'Miami, FL 33101',
    currentBid: 105000,
    endDate: new Date(now + 2 * DAY),
    listedAt: new Date(now - 2 * HOUR),
    mileage: 9500,
  },
  {
    id: 6,
    photoUrl: placeholder('2020 Toyota Supra Launch Edition'),
    title: '2020 Toyota Supra Launch Edition',
    highlights: 'Absolute Zero White, 6-Speed Manual Swap, Track Package',
    location: 'Denver, CO 80202',
    currentBid: 48000,
    endDate: new Date(now + 3 * DAY),
    listedAt: new Date(now - 3 * DAY),
    mileage: 22000,
    badge: 'NO RESERVE',
  },
  {
    id: 7,
    photoUrl: placeholder('1995 Honda NSX-T'),
    title: '1995 Honda NSX-T',
    highlights: 'Formula Red, 5-Speed Manual, Recent Timing Belt Service',
    location: 'Portland, OR 97201',
    currentBid: 72000,
    endDate: new Date(now + 5 * HOUR + 12 * 60 * 1000),
    listedAt: new Date(now - 7 * DAY),
    mileage: 61000,
  },
  {
    id: 8,
    photoUrl: placeholder('2016 Chevrolet Corvette Z06'),
    title: '2016 Chevrolet Corvette Z06',
    highlights: 'Torch Red, 7-Speed Manual, Z07 Performance Package',
    location: 'Austin, TX 78701',
    currentBid: 58000,
    endDate: new Date(now + 4 * DAY),
    listedAt: new Date(now - 12 * HOUR),
    mileage: 14500,
  },
  {
    id: 9,
    photoUrl: placeholder('2013 Mercedes-Benz SLS AMG'),
    title: '2013 Mercedes-Benz SLS AMG',
    highlights: 'Alubeam Silver, Gullwing Doors, AMG Performance Exhaust',
    location: 'Scottsdale, AZ 85251',
    currentBid: 145000,
    endDate: new Date(now + 1 * DAY),
    listedAt: new Date(now - 8 * DAY),
    mileage: 8200,
    badge: 'NO RESERVE',
  },
  {
    id: 10,
    photoUrl: placeholder('1991 Nissan Skyline GT-R'),
    title: '1991 Nissan Skyline GT-R',
    highlights: 'R32, Gunmetal Gray, JDM Import, RB26DETT, 5-Speed Manual',
    location: 'Seattle, WA 98101',
    currentBid: 65000,
    endDate: new Date(now + 6 * HOUR + 45 * 60 * 1000),
    listedAt: new Date(now - 9 * DAY),
    mileage: 47000,
  },
];
