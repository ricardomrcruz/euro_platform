// Mirrors euro-auth's UserRole enum. Duplicated, not shared, per the existing
// no-cross-service-coupling decision (separate schemas, no shared FKs, no shared code).
export enum UserRole {
  GUEST = 'GUEST',
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
}
