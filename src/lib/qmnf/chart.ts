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
import { dignitiesForChart, type DignityResult } from "./dignities";
import { computeLots, isDayChart, type Lot } from "./lots";
import { meanLilithArcsec, meanLilithDeg } from "./lilith";
import { lunarPhase, isMoonVoidOfCourse, type LunarPhase } from "./phase";
import { classifyChartShape, type ShapeResult } from "./shape";
import { CrtAddress } from "./crt";
import { findStarConjunctions, type StarConjunction } from "./fixedstars";
import { findAntisciaContacts, type AntisciaContact } from "./antiscia";
import { termAndFace, type TermFaceResult } from "./terms";
import type { PlanetName } from "./dignities";

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
  // ── Traditional astrology additions ─────────────────────────────────────
  dignities: DignityResult[];
  lots: Lot[];
  lilith: { longitudeArcsec: bigint; longitudeDeg: number; house: number };
  lunarPhase: LunarPhase;
  voidOfCourse: { voc: boolean; nextSignChangeDays: number; nextAspectDays: number | null };
  shape: ShapeResult;
  isDayChart: boolean;
  /** Bright fixed stars within 1° of a natal planet. */
  fixedStarContacts: StarConjunction[];
  /** Pairs in mutual antiscia / contra-antiscia within 1°. */
  antisciaContacts: AntisciaContact[];
  /** Term and decan ruler for each classical planet — refines essential dignity. */
  termFace: TermFaceResult[];
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
  const ephemerisCore = computeEphemeris(jd);
  // Add Black Moon Lilith into the chart's planet list (using addOn naming).
  const lilithArcsec = meanLilithArcsec(jd);
  const lilithPlanet: PlanetPosition = {
    name: "Lilith",
    longitudeArcsec: lilithArcsec,
    retrograde: false,
    address: CrtAddress.fromArcsec(lilithArcsec),
  };
  const ephemeris: EphemerisChart = {
    jd,
    planets: [...ephemerisCore.planets, lilithPlanet],
  };

  const houses = computeHouses(jd, birth.latitude, birth.longitude, birth.houseSystem);
  const aspects = buildAspects(ephemeris.planets);
  const shadowNetwork = buildShadowNetwork(ephemeris.planets, SHADOW_LANE_NAMES);
  const boundaryNetwork = buildBoundaryNetwork(ephemeris.planets, BOUNDARY_LANE_NAMES);
  const faceOfZero = findFaceOfZero(shadowNetwork, boundaryNetwork);
  const invisibleShadowBonds = findClassicallyInvisible(shadowNetwork, aspects);
  const patterns = findAspectPatterns(aspects, ephemeris.planets);
  const planetHouses: Record<string, number> = {};
  for (const p of ephemeris.planets) {
    planetHouses[p.name] = houseOf(p.longitudeArcsec, houses.cuspsArcsec);
  }
  const dignities = dignitiesForChart(ephemeris.planets);
  const findPos = (name: string) =>
    ephemeris.planets.find((p) => p.name === name)?.longitudeArcsec ?? 0n;
  const sunArcsec = findPos("Sun");
  const moonArcsec = findPos("Moon");
  const ascArcsec = houses.cuspsArcsec[0];
  const dayChart = isDayChart(sunArcsec, ascArcsec);
  const lots = computeLots({
    ascArcsec,
    sunArcsec,
    moonArcsec,
    venusArcsec: findPos("Venus"),
    marsArcsec: findPos("Mars"),
    jupiterArcsec: findPos("Jupiter"),
    saturnArcsec: findPos("Saturn"),
    mercuryArcsec: findPos("Mercury"),
    isDay: dayChart,
  });
  const phase = lunarPhase(sunArcsec, moonArcsec);
  const moonForVoc = ephemeris.planets.find((p) => p.name === "Moon");
  const voc = isMoonVoidOfCourse(
    moonArcsec,
    47400,
    ephemeris.planets
      .filter((p) => ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(p.name))
      .map((p) => ({
        name: p.name,
        longitudeArcsec: p.longitudeArcsec,
        speedArcsecPerDay:
          p.name === "Sun"
            ? 3548
            : p.name === "Mercury"
              ? 14400
              : p.name === "Venus"
                ? 5760
                : p.name === "Mars"
                  ? 1886
                  : p.name === "Jupiter"
                    ? 299
                    : 120,
      })),
  );
  void moonForVoc;
  const shape = classifyChartShape(
    ephemeris.planets.filter((p) =>
      [
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
      ].includes(p.name),
    ),
  );
  const fixedStarContacts = findStarConjunctions(ephemeris.planets, jd);
  const antisciaContacts = findAntisciaContacts(ephemeris.planets);
  const TERM_PLANETS: PlanetName[] = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
  ];
  const termFace: TermFaceResult[] = ephemeris.planets
    .filter((p) => TERM_PLANETS.includes(p.name as PlanetName))
    .map((p) => termAndFace(p.name as PlanetName, p.longitudeArcsec));
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
    dignities,
    lots,
    lilith: {
      longitudeArcsec: lilithArcsec,
      longitudeDeg: meanLilithDeg(jd),
      house: houseOf(lilithArcsec, houses.cuspsArcsec),
    },
    lunarPhase: phase,
    voidOfCourse: voc,
    shape,
    isDayChart: dayChart,
    fixedStarContacts,
    antisciaContacts,
    termFace,
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
    dignity?: string;
  }>;
  conventionalAspects: Array<{
    a: string;
    b: string;
    aspect: string;
    orb: string;
    applying?: boolean;
  }>;
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
  traditional: {
    dignities: Array<{ planet: string; sign: string; kind: string; score: number }>;
    lots: Array<{ name: string; position: string; formula: string }>;
    lilith: { position: string; house: number };
    lunarPhase: { phase: string; illumination: number; waxing: boolean };
    voidOfCourse: { voc: boolean; nextSignChangeDays: number };
    shape: { shape: string; largestGapDeg: number; handle?: string };
    sect: "day" | "night";
    fixedStars: Array<{ planet: string; star: string; orbDeg: number; nature: string }>;
    antiscia: Array<{ a: string; b: string; kind: string; orbDeg: number }>;
    termFace: Array<{
      planet: string;
      termRuler: string;
      inOwnTerm: boolean;
      faceRuler: string;
      inOwnFace: boolean;
    }>;
  };
  rigorous?: boolean;
}

function describePlanet(p: PlanetPosition, house: number, dignity?: DignityResult) {
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
    dignity: dignity?.kind,
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

  const dignityByName = new Map(chart.dignities.map((d) => [d.planet, d]));
  return {
    meta: {
      name: b.name,
      bornUTC,
      latitude: b.latitude,
      longitude: b.longitude,
      houseSystem: b.houseSystem,
    },
    foundation: chart.ephemeris.planets.map((p) =>
      describePlanet(p, chart.planetHouses[p.name], dignityByName.get(p.name as never)),
    ),
    conventionalAspects: chart.aspects
      .filter((a) => a.aspect.family === "cardinal" || a.aspect.family === "classical")
      .map((a) => ({
        a: a.a,
        b: a.b,
        aspect: a.aspect.name,
        orb: `${(Number(a.orbDeltaArcsec) / 3600).toFixed(2)}°`,
        applying: a.applying,
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
    traditional: {
      dignities: chart.dignities.map((d) => ({
        planet: d.planet,
        sign: d.sign,
        kind: d.kind,
        score: d.score,
      })),
      lots: chart.lots.map((l) => ({
        name: l.name,
        position: formatPosition(l.longitudeArcsec),
        formula: l.formula,
      })),
      lilith: { position: formatPosition(chart.lilith.longitudeArcsec), house: chart.lilith.house },
      lunarPhase: {
        phase: chart.lunarPhase.phase,
        illumination: chart.lunarPhase.illumination,
        waxing: chart.lunarPhase.waxing,
      },
      voidOfCourse: {
        voc: chart.voidOfCourse.voc,
        nextSignChangeDays: chart.voidOfCourse.nextSignChangeDays,
      },
      shape: {
        shape: chart.shape.shape,
        largestGapDeg: chart.shape.largestGapDeg,
        handle: chart.shape.handle,
      },
      sect: chart.isDayChart ? "day" : "night",
      fixedStars: chart.fixedStarContacts.map((s) => ({
        planet: s.planet,
        star: s.star,
        orbDeg: Number(s.orbArcsec) / 3600,
        nature: s.nature,
      })),
      antiscia: chart.antisciaContacts.map((a) => ({
        a: a.a,
        b: a.b,
        kind: a.kind,
        orbDeg: Number(a.orbArcsec) / 3600,
      })),
      termFace: chart.termFace.map((t) => ({
        planet: t.planet,
        termRuler: t.termRuler,
        inOwnTerm: t.inOwnTerm,
        faceRuler: t.faceRuler,
        inOwnFace: t.inOwnFace,
      })),
    },
    rigorous,
  };
}
