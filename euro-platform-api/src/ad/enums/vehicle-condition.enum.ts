// Finer-grained than the previous 4-value scale -- FAIR/POOR no longer exist; migration
// AddVehicleColorAndConditionEnums remaps existing rows onto the values below.
export enum VehicleCondition {
  EXCELLENT = 'EXCELLENT',
  NOT_DAMAGED = 'NOT_DAMAGED',
  GOOD = 'GOOD',
  NORMAL_WEAR = 'NORMAL_WEAR',
  MINOR_REPAIRS_NEEDED = 'MINOR_REPAIRS_NEEDED',
  MAJOR_REPAIRS_NEEDED = 'MAJOR_REPAIRS_NEEDED',
  DAMAGED = 'DAMAGED',
  NOT_RUNNING = 'NOT_RUNNING',
}
