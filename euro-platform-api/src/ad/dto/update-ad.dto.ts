import { CreateAdDto } from './create-ad.dto';

// Same shape as creation -- editing replaces every field, including the vehicle.
export class UpdateAdDto extends CreateAdDto {}
