// Fixed stars — bright stars at the Royal/important positions.
// Longitudes (ecliptic) at J2000, precessed forward at 50.29″/yr.
//
// Dresden refinement: a fixed star is a "stationary residue address" — the
// integer arcsec longitude advances by exactly 50″ per year (the precession
// constant), making each star a slow-moving carrier on the 1,296,000″ ring.
// A conjunction within 1° is treated as a planet-on-star activation; the
// star's residue (r₁₁, r₁₃) then enters the chart's shadow / boundary
// networks alongside the planets.

import { J2000_JD } from "./julian";
import { FULL_CIRCLE_ARCSEC } from "./constants";
import { CrtAddress } from "./crt";

const PRECESSION_ARCSEC_PER_DAY = 50.29 / 365.25;

export interface FixedStar {
  name: string;
  /** Magnitude (lower = brighter). */
  magnitude: number;
  /** Ecliptic longitude at J2000 in arcsec. */
  longJ2000Arcsec: bigint;
  /** Brief mythic-traditional meaning. */
  nature: string;
}

// Source: Robson, _Fixed Stars and Constellations in Astrology_ (1923),
// updated to J2000 with the Hipparcos epoch.
export const FIXED_STARS: readonly FixedStar[] = [
  {
    name: "Algol",
    magnitude: 2.1,
    longJ2000Arcsec: BigInt(Math.round(56.166 * 3600)),
    nature: "Caput Algol — beheading, intensity, hidden danger",
  },
  {
    name: "Pleiades (Alcyone)",
    magnitude: 2.9,
    longJ2000Arcsec: BigInt(Math.round(60.0 * 3600)),
    nature: "Pleiades — weeping, vision, refining sorrow",
  },
  {
    name: "Aldebaran",
    magnitude: 0.87,
    longJ2000Arcsec: BigInt(Math.round(69.79 * 3600)),
    nature: "Eye of the Bull — royal star of the east; integrity",
  },
  {
    name: "Capella",
    magnitude: 0.08,
    longJ2000Arcsec: BigInt(Math.round(81.95 * 3600)),
    nature: "She-Goat — curious mind, public honor",
  },
  {
    name: "Rigel",
    magnitude: 0.18,
    longJ2000Arcsec: BigInt(Math.round(76.95 * 3600)),
    nature: "Foot of Orion — teaching, structural ascent",
  },
  {
    name: "Betelgeuse",
    magnitude: 0.45,
    longJ2000Arcsec: BigInt(Math.round(88.55 * 3600)),
    nature: "Shoulder of Orion — martial honor, large success",
  },
  {
    name: "Sirius",
    magnitude: -1.46,
    longJ2000Arcsec: BigInt(Math.round(104.05 * 3600)),
    nature: "The Dog Star — guardianship, faithfulness, fame",
  },
  {
    name: "Procyon",
    magnitude: 0.34,
    longJ2000Arcsec: BigInt(Math.round(115.83 * 3600)),
    nature: "Lesser Dog — swift rise then fall, restlessness",
  },
  {
    name: "Regulus",
    magnitude: 1.36,
    longJ2000Arcsec: BigInt(Math.round(149.83 * 3600)),
    nature: "Heart of the Lion — royal star of the north; kingship requires conduct",
  },
  {
    name: "Algorab",
    magnitude: 2.94,
    longJ2000Arcsec: BigInt(Math.round(193.42 * 3600)),
    nature: "The Crow — destruction by ill-will, lies",
  },
  {
    name: "Spica",
    magnitude: 1.04,
    longJ2000Arcsec: BigInt(Math.round(203.83 * 3600)),
    nature: "Ear of Wheat — gift, talent, brilliant insight",
  },
  {
    name: "Arcturus",
    magnitude: -0.05,
    longJ2000Arcsec: BigInt(Math.round(204.32 * 3600)),
    nature: "Bear-Keeper — riches and honor through wisdom",
  },
  {
    name: "Antares",
    magnitude: 1.06,
    longJ2000Arcsec: BigInt(Math.round(249.77 * 3600)),
    nature: "Heart of the Scorpion — royal star of the west; war, intensity",
  },
  {
    name: "Vega",
    magnitude: 0.03,
    longJ2000Arcsec: BigInt(Math.round(285.32 * 3600)),
    nature: "Lyre — magical voice, charisma, refinement",
  },
  {
    name: "Altair",
    magnitude: 0.77,
    longJ2000Arcsec: BigInt(Math.round(301.78 * 3600)),
    nature: "Flying Eagle — bold action, daring, sudden rise",
  },
  {
    name: "Fomalhaut",
    magnitude: 1.16,
    longJ2000Arcsec: BigInt(Math.round(333.87 * 3600)),
    nature: "Fish-Mouth — royal star of the south; mystical, fated",
  },
];

function modPos(a: bigint): bigint {
  return ((a % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

export interface ProjectedStar extends FixedStar {
  longitudeArcsec: bigint;
  address: CrtAddress;
}

/** Project each fixed star's longitude to `jd` via simple precession. */
export function projectedStars(jd: number): ProjectedStar[] {
  const dayDelta = jd - J2000_JD;
  const shift = BigInt(Math.round(dayDelta * PRECESSION_ARCSEC_PER_DAY));
  return FIXED_STARS.map((s) => {
    const lon = modPos(s.longJ2000Arcsec + shift);
    return { ...s, longitudeArcsec: lon, address: CrtAddress.fromArcsec(lon) };
  });
}

export interface StarConjunction {
  planet: string;
  star: string;
  orbArcsec: bigint;
  starLongitudeArcsec: bigint;
  nature: string;
}

/** Find planet–star conjunctions within `orbDeg` (default 1°). */
export function findStarConjunctions(
  planets: Array<{ name: string; longitudeArcsec: bigint }>,
  jd: number,
  orbDeg = 1,
): StarConjunction[] {
  const orb = BigInt(Math.round(orbDeg * 3600));
  const stars = projectedStars(jd);
  const out: StarConjunction[] = [];
  for (const p of planets) {
    for (const s of stars) {
      let d = (p.longitudeArcsec - s.longitudeArcsec + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
      if (d > FULL_CIRCLE_ARCSEC / 2n) d = FULL_CIRCLE_ARCSEC - d;
      if (d <= orb) {
        out.push({
          planet: p.name,
          star: s.name,
          orbArcsec: d,
          starLongitudeArcsec: s.longitudeArcsec,
          nature: s.nature,
        });
      }
    }
  }
  return out;
}
