// Catalog model names are stored with their make prefixed (e.g. "AUDI A3") so cascading
// lookups by name stay unambiguous across makes -- but showing that prefix again in a model
// dropdown is redundant once the make is already picked in its own field. Case-insensitive
// since a few legacy rows predate the catalog's all-caps make naming convention.
export function stripMakePrefix(modelName: string, makeName: string | undefined): string {
  if (!makeName) return modelName;
  const prefix = `${makeName} `;
  if (modelName.toUpperCase().startsWith(prefix.toUpperCase())) {
    return modelName.slice(prefix.length).trim() || modelName;
  }
  return modelName;
}
