// QMNF — Safe Basis primes & core constants
// All longitudes are stored as bigint arcseconds in [0, 1_296_000)

export const SAFE_BASIS = [2n, 3n, 5n, 7n, 11n, 13n] as const;
export const TRANSPORT_CORE = [3n, 7n, 11n, 13n] as const;
export const DISCRIMINATING = [7n, 11n, 13n] as const;

export const M_SAFE = 30030n; // 2*3*5*7*11*13
export const GEAR_MODULUS = 323n; // 17 * 19
export const FULL_CIRCLE_ARCSEC = 1_296_000n; // 360 * 3600
export const ARCSEC_PER_SIGN = 108_000n; // 30  * 3600
export const ARCSEC_PER_DEGREE = 3600n;

// GMT epoch for Maya Long Count (correlation constant 584283)
export const MAYA_EPOCH_JD = 584_283n;

// Shadow Prime is 11 — eleven hidden lanes that reveal the +60% structure
export const SHADOW_LANE_NAMES = [
  "Origin", // 0
  "Initiation", // 1
  "Mirror", // 2
  "Triad", // 3
  "Foundation", // 4
  "Bridge", // 5
  "Threshold", // 6
  "Vortex", // 7
  "Crown", // 8
  "Reversal", // 9
  "Return", // 10
] as const;

// Boundary Prime 13 lanes
export const BOUNDARY_LANE_NAMES = [
  "Seed",
  "Spark",
  "Wave",
  "Branch",
  "Root",
  "Stone",
  "Ember",
  "Smoke",
  "Mirror",
  "Bone",
  "Thread",
  "Door",
  "Veil",
] as const;

export const ZODIAC_SIGNS = [
  { name: "Aries", glyph: "♈", element: "Fire", modality: "Cardinal" },
  { name: "Taurus", glyph: "♉", element: "Earth", modality: "Fixed" },
  { name: "Gemini", glyph: "♊", element: "Air", modality: "Mutable" },
  { name: "Cancer", glyph: "♋", element: "Water", modality: "Cardinal" },
  { name: "Leo", glyph: "♌", element: "Fire", modality: "Fixed" },
  { name: "Virgo", glyph: "♍", element: "Earth", modality: "Mutable" },
  { name: "Libra", glyph: "♎", element: "Air", modality: "Cardinal" },
  { name: "Scorpio", glyph: "♏", element: "Water", modality: "Fixed" },
  { name: "Sagittarius", glyph: "♐", element: "Fire", modality: "Mutable" },
  { name: "Capricorn", glyph: "♑", element: "Earth", modality: "Cardinal" },
  { name: "Aquarius", glyph: "♒", element: "Air", modality: "Fixed" },
  { name: "Pisces", glyph: "♓", element: "Water", modality: "Mutable" },
] as const;

export const PLANET_GLYPHS: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
  NorthNode: "☊",
  Chiron: "⚷",
  Lilith: "⚸",
  Ceres: "⚳",
  Pallas: "⚴",
  Juno: "⚵",
  Vesta: "⚶",
};

export const PLANET_ORDER = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "NorthNode",
  "Chiron",
] as const;

export type PlanetName = (typeof PLANET_ORDER)[number];
