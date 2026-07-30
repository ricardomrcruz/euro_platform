export interface CarApiCollection<T> {
  collection: {
    url: string;
    count: number;
    pages: number;
    total: number;
    next: string;
    prev: string;
    first: string;
    last: string;
  };
  data: T[];
}

export interface CarApiMake {
  id: number;
  name: string;
}

export interface CarApiModel {
  id: number;
  make_id: number;
  make: string;
  name: string;
}

export interface CarApiTrimSummary {
  id: number;
  year: number;
  make: string;
  model: string;
  trim: string;
  description?: string;
  msrp?: number;
  invoice?: number;
}

export interface CarApiTrimDetail extends CarApiTrimSummary {
  bodies?: Array<{
    type?: string;
    doors?: number;
    curb_weight?: number;
  }>;
  engines?: Array<{
    engine_type?: string;
    fuel_type?: string;
    cylinders?: number;
    horsepower_hp?: number;
    torque_ft_lbs?: number;
  }>;
  transmissions?: Array<{ description?: string }>;
  drive_types?: Array<{ description?: string }>;
}
