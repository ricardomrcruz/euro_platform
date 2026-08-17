// Categories mirror Cars & Bids' official photo guide (carsandbids.com/photos/guide),
// scoped down from their ~65-shot full gallery to the angles that matter most for review.
// Categories with a fixed angle/purpose are REQUIRED -- an ad can't be submitted for review
// until one photo of each exists. OTHER is unlimited and carries no special designation:
// flaw close-ups, service records, keys, window sticker, mirrors/lights, anything extra.
// REGISTRATION_DOCUMENT is an EU-market addition (carte grise) -- not part of the C&B list,
// which instead expects US-specific items (window sticker, VIN stickers) we fold into OTHER.
export enum AdPhotoCategory {
  EXTERIOR_FRONT = 'EXTERIOR_FRONT',
  EXTERIOR_REAR = 'EXTERIOR_REAR',
  EXTERIOR_DRIVER_SIDE = 'EXTERIOR_DRIVER_SIDE',
  EXTERIOR_PASSENGER_SIDE = 'EXTERIOR_PASSENGER_SIDE',
  EXTERIOR_FRONT_THREE_QUARTER = 'EXTERIOR_FRONT_THREE_QUARTER',
  EXTERIOR_REAR_THREE_QUARTER = 'EXTERIOR_REAR_THREE_QUARTER',
  EXTERIOR_UNDERCARRIAGE = 'EXTERIOR_UNDERCARRIAGE',
  WHEELS_TIRES = 'WHEELS_TIRES',
  ENGINE_BAY = 'ENGINE_BAY',
  INTERIOR_DASHBOARD = 'INTERIOR_DASHBOARD',
  INTERIOR_FRONT_SEATS = 'INTERIOR_FRONT_SEATS',
  INTERIOR_REAR_SEATS = 'INTERIOR_REAR_SEATS',
  ODOMETER = 'ODOMETER',
  TRUNK = 'TRUNK',
  REGISTRATION_DOCUMENT = 'REGISTRATION_DOCUMENT',
  OTHER = 'OTHER',
}

export const REQUIRED_AD_PHOTO_CATEGORIES: readonly AdPhotoCategory[] = [
  AdPhotoCategory.EXTERIOR_FRONT,
  AdPhotoCategory.EXTERIOR_REAR,
  AdPhotoCategory.EXTERIOR_DRIVER_SIDE,
  AdPhotoCategory.EXTERIOR_PASSENGER_SIDE,
  AdPhotoCategory.EXTERIOR_FRONT_THREE_QUARTER,
  AdPhotoCategory.EXTERIOR_REAR_THREE_QUARTER,
  AdPhotoCategory.EXTERIOR_UNDERCARRIAGE,
  AdPhotoCategory.WHEELS_TIRES,
  AdPhotoCategory.ENGINE_BAY,
  AdPhotoCategory.INTERIOR_DASHBOARD,
  AdPhotoCategory.INTERIOR_FRONT_SEATS,
  AdPhotoCategory.INTERIOR_REAR_SEATS,
  AdPhotoCategory.ODOMETER,
  AdPhotoCategory.TRUNK,
  AdPhotoCategory.REGISTRATION_DOCUMENT,
];
