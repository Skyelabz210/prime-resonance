// Top-level chart composition + reading bundle
import { datetimeToJD } from "./julian";
import { computeEphemeris, type EphemerisChart, type PlanetPosition } from "./ephemeris";
import {
  buildAspects,
  buildShadowNetwork,
  buildBoundaryNetwork,
  findFaceOfZero,
  findClassicallyInvisible,
  findAspectPatterns,
  type ClassifiedAspect,
  type ResidueBond,
  type FaceOfZero,
  type Pattern,
} from "./aspects";
import { computeHouses, houseOf, type HouseChart, type HouseSystem } from "./houses";
import { computeMaya, type MayaPosition } from "./maya";
import { SHADOW_LANE_NAMES, BOUNDARY_LANE_NAMES } from "./constants";
import { formatPosition } from "./format";
import {
  ayanamsaArcsec,
  siderealLongitudeArcsec,
  nakshatraInfo,
  type NakshatraInfo,
  type DashaPlanet,
} from "./vedic";

export interface BirthData {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  tzOffsetHours: number;
  latitude: number;
  longitude: number;
  houseSystem: HouseSystem;
}

export interface VedicPlanetInfo {
  name: string;
  tropicalArcsec: bigint;
  siderealArcsec: bigint;
  nakshatra: NakshatraInfo;
}

export interface VedicLayer {
  ayanamsaArcsec: bigint;
  planets: VedicPlanetInfo[];
  moonNakshatra: NakshatraInfo;
  moonDashaRuler: DashaPlanet;
}

export interface FullChart {
  birth: BirthData;
  jd: number;
  ephemeris: EphemerisChart;
  houses: HouseChart;
  planetHouses: Record<string, number>;
  aspects: ClassifiedAspect[];
  shadowNetwork: ResidueBond[];
  boundaryNetwork: ResidueBond[];
  faceOfZero: FaceOfZero[];
  invisibleShadowBonds: ResidueBond[];
  patterns: Pattern[];
  maya: MayaPosition;
  vedic: VedicLayer;
}

function computeVedicLayer(jd: number, planets: PlanetPosition[]): VedicLayer {
  const ay = ayanamsaArcsec(jd);
  const vedicPlanets: VedicPlanetInfo[] = planets.map((p) => {
    const sid = siderealLongitudeArcsec(p.longitudeArcsec, jd);
    return {
      name: p.name,
      tropicalArcsec: p.longitudeArcsec,
      siderealArcsec: sid,
      nakshatra: nakshatraInfo(sid),
    };
  });
  const moon = vedicPlanets.find((p) => p.name === "Moon");
  const moonNak = moon ? moon.nakshatra : nakshatraInfo(0n);
  return {
    ayanamsaArcsec: ay,
    planets: vedicPlanets,
    moonNakshatra: moonNak,
    moonDashaRuler: moonNak.ruler,
  };
}

export function computeFullChart(birth: BirthData): FullChart {
  const jd = datetimeToJD(
    birth.year,
    birth.month,
    birth.day,
    birth.hour,
    birth.minute,
    0,
    birth.tzOffsetHours,
  );
  const ephemeris = computeEphemeris(jd);
  const houses = computeHouses(jd, birth.latitude, birth.longitude, birth.houseSystem);
  const aspects = buildAspects(ephemeris.planets);
  const shadowNetwork = buildShadowNetwork(ephemeris.planets, SHADOW_LANE_NAMES);
  const boundaryNetwork = buildBoundaryNetwork(ephemeris.planets, BOUNDARY_LANE_NAMES);
  const faceOfZero = findFaceOfZero(shadowNetwork, boundaryNetwork);
  const invisibleShadowBonds = findClassicallyInvisible(shadowNetwork, aspects);
  const patterns = findAspectPatterns(aspects);
  const planetHouses: Record<string, number> = {};
  for (const p of ephemeris.planets) {
    planetHouses[p.name] = houseOf(p.longitudeArcsec, houses.cuspsArcsec);
  }
  return {
    birth,
    jd,
    ephemeris,
    houses,
    planetHouses,
    aspects,
    shadowNetwork,
    boundaryNetwork,
    faceOfZero,
    invisibleShadowBonds,
    patterns,
    maya: computeMaya(jd),
    vedic: computeVedicLayer(jd, ephemeris.planets),
  };
}

// Reading bundle — purely structural, no narrative. Sent to AI for verbalization.
export interface ReadingBundle {
  meta: { name: string; bornUTC: string; latitude: number; longitude: number; houseSystem: string };
  foundation: Array<{
    planet: string;
    position: string;
    retrograde: boolean;
    house: number;
    residues: { r2: string; r3: string; r5: string; r7: string; r11: string; r13: string };
    gearK: string;
    shadowLane: string;
    boundaryLane: string;
  }>;
  conventionalAspects: Array<{ a: string; b: string; aspect: string; orb: string }>;
  shadowBonds: Array<{ a: string; b: string; lane: string; classicallyInvisible: boolean }>;
  boundaryBonds: Array<{ a: string; b: string; lane: string }>;
  faceOfZero: Array<{ a: string; b: string; shadowLane: string; boundaryLane: string }>;
  patterns: Array<{ type: string; planets: string[] }>;
  maya: MayaPosition;
  vedic: {
    ayanamsa: string;
    moonNakshatra: { name: string; pada: number; ruler: string };
    sidereal: Array<{ planet: string; nakshatra: string; pada: number }>;
  };
  rigorous?: boolean;
}

function describePlanet(p: PlanetPosition, house: number) {
  const a = p.address;
  return {
    planet: p.name,
    position: formatPosition(p.longitudeArcsec),
    retrograde: p.retrograde,
    house,
    residues: {
      r2: a.r2.toString(),
      r3: a.r3.toString(),
      r5: a.r5.toString(),
      r7: a.r7.toString(),
      r11: a.r11.toString(),
      r13: a.r13.toString(),
    },
    gearK: a.gearK.toString(),
    shadowLane: a.shadowLane(),
    boundaryLane: a.boundaryLane(),
  };
}

function arcsecToDegMin(arcsec: bigint): string {
  const total = Number(arcsec);
  const deg = Math.floor(total / 3600);
  const min = Math.floor((total - deg * 3600) / 60);
  return `${deg}°${String(min).padStart(2, "0")}'`;
}

export function buildReadingBundle(chart: FullChart, rigorous = false): ReadingBundle {
  const b = chart.birth;
  const utcHour = b.hour - b.tzOffsetHours;
  const bornUTC =
    `${b.year}-${String(b.month).padStart(2, "0")}-${String(b.day).padStart(2, "0")} ` +
    `${String(((utcHour % 24) + 24) % 24).padStart(2, "0")}:${String(b.minute).padStart(2, "0")} UTC`;
  const invisibleKey = new Set(
    chart.invisibleShadowBonds.map((b) => (b.a < b.b ? `${b.a}|${b.b}` : `${b.b}|${b.a}`)),
  );
  const k = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

  return {
    meta: {
      name: b.name,
      bornUTC,
      latitude: b.latitude,
      longitude: b.longitude,
      houseSystem: b.houseSystem,
    },
    foundation: chart.ephemeris.planets.map((p) => describePlanet(p, chart.planetHouses[p.name])),
    conventionalAspects: chart.aspects
      .filter((a) => a.aspect.family === "cardinal" || a.aspect.family === "classical")
      .map((a) => ({
        a: a.a,
        b: a.b,
        aspect: a.aspect.name,
        orb: `${(Number(a.orbDeltaArcsec) / 3600).toFixed(2)}°`,
      })),
    shadowBonds: chart.shadowNetwork.map((s) => ({
      a: s.a,
      b: s.b,
      lane: s.laneName,
      classicallyInvisible: invisibleKey.has(k(s.a, s.b)),
    })),
    boundaryBonds: chart.boundaryNetwork.map((b) => ({ a: b.a, b: b.b, lane: b.laneName })),
    faceOfZero: chart.faceOfZero.map((f) => ({
      a: f.a,
      b: f.b,
      shadowLane: SHADOW_LANE_NAMES[f.shadowResidue],
      boundaryLane: BOUNDARY_LANE_NAMES[f.boundaryResidue],
    })),
    patterns: chart.patterns.map((p) => ({ type: p.type, planets: p.planets })),
    maya: chart.maya,
    vedic: {
      ayanamsa: arcsecToDegMin(chart.vedic.ayanamsaArcsec),
      moonNakshatra: {
        name: chart.vedic.moonNakshatra.name,
        pada: chart.vedic.moonNakshatra.pada,
        ruler: chart.vedic.moonNakshatra.ruler,
      },
      sidereal: chart.vedic.planets.map((p) => ({
        planet: p.name,
        nakshatra: p.nakshatra.name,
        pada: p.nakshatra.pada,
      })),
    },
    rigorous,
  };
}
