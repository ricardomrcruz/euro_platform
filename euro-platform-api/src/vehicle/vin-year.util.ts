// Standard VIN 10th-character model-year code (SAE J853 / ISO 3779), verified against
// published references. Fixed 30-year cycle: letters A-Y skipping I/O/Q/U/Z, then digits
// 1-9 skipping 0. The cycle repeats every 30 years (e.g. "A" = 1980 or 2010), disambiguated
// by the 7th character: numeric => 1980-2009 cycle, alphabetic => 2010-2039 cycle.
const YEAR_CODES: Record<string, number> = {
  A: 1980, B: 1981, C: 1982, D: 1983, E: 1984, F: 1985, G: 1986, H: 1987,
  J: 1988, K: 1989, L: 1990, M: 1991, N: 1992, P: 1993, R: 1994, S: 1995,
  T: 1996, V: 1997, W: 1998, X: 1999, Y: 2000,
  '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
  '6': 2006, '7': 2007, '8': 2008, '9': 2009,
};

const CYCLE_LENGTH = 30;

export function decodeModelYear(vin: string): number | undefined {
  if (vin.length < 10) return undefined;

  const yearChar = vin[9]?.toUpperCase();
  const baseYear = yearChar ? YEAR_CODES[yearChar] : undefined;
  if (baseYear === undefined) return undefined;

  const disambiguatorChar = vin[6];
  const isSecondCycle = disambiguatorChar ? /[A-Z]/i.test(disambiguatorChar) : false;

  return isSecondCycle ? baseYear + CYCLE_LENGTH : baseYear;
}
