export interface CountryInfo {
  code: string;
  name: string;
  region: string;
  flag: string;
}

export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  const upper = countryCode.toUpperCase();
  const codePoints = [...upper].map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const COUNTRIES: Record<string, { name: string; region: string }> = {
  US: { name: "United States", region: "North America" },
  GB: { name: "United Kingdom", region: "Europe" },
  DE: { name: "Germany", region: "Europe" },
  FR: { name: "France", region: "Europe" },
  NL: { name: "Netherlands", region: "Europe" },
  SE: { name: "Sweden", region: "Europe" },
  NO: { name: "Norway", region: "Europe" },
  FI: { name: "Finland", region: "Europe" },
  PL: { name: "Poland", region: "Europe" },
  CZ: { name: "Czech Republic", region: "Europe" },
  CH: { name: "Switzerland", region: "Europe" },
  RU: { name: "Russia", region: "Europe" },
  UA: { name: "Ukraine", region: "Europe" },
  JP: { name: "Japan", region: "Asia" },
  KR: { name: "South Korea", region: "Asia" },
  CN: { name: "China", region: "Asia" },
  IN: { name: "India", region: "Asia" },
  SG: { name: "Singapore", region: "Asia" },
  AU: { name: "Australia", region: "Oceania" },
  CA: { name: "Canada", region: "North America" },
  BR: { name: "Brazil", region: "LATAM" },
  AR: { name: "Argentina", region: "LATAM" },
  MX: { name: "Mexico", region: "LATAM" },
  IL: { name: "Israel", region: "Middle East" },
  TR: { name: "Turkey", region: "Europe" },
  ZA: { name: "South Africa", region: "Africa" },
  NG: { name: "Nigeria", region: "Africa" },
  EG: { name: "Egypt", region: "Africa" },
};

export function getCountryInfo(code: string): CountryInfo | null {
  if (!code) return null;
  const upper = code.toUpperCase();
  const found = COUNTRIES[upper];
  if (!found) {
    return {
      code: upper,
      name: upper,
      region: "Global",
      flag: getFlagEmoji(upper),
    };
  }
  return {
    code: upper,
    name: found.name,
    region: found.region,
    flag: getFlagEmoji(upper),
  };
}

export function getAllCountries(): CountryInfo[] {
  return Object.entries(COUNTRIES).map(([code, data]) => ({
    code,
    name: data.name,
    region: data.region,
    flag: getFlagEmoji(code),
  }));
}
