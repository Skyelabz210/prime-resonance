// Arabic Parts / Hellenistic Lots.
// All computed as pure integer arcsecond arithmetic.
// Sect determines whether the Sun→Moon or Moon→Sun arc is taken.
//
// Day chart: Sun above horizon (in houses 7–12).
// Night chart: Sun below horizon (in houses 1–6).

import { FULL_CIRCLE_ARCSEC } from "./constants";
import { CrtAddress } from "./crt";

export interface Lot {
  name: string;
  longitudeArcsec: bigint;
  address: CrtAddress;
  formula: string;
}

const ARCSEC_PER_DEG = 3600n;

function arcsec(deg: number): bigint {
  const a = BigInt(Math.round(deg * Number(ARCSEC_PER_DEG)));
  return ((a % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

function modPos(a: bigint): bigint {
  return ((a % FULL_CIRCLE_ARCSEC) + FULL_CIRCLE_ARCSEC) % FULL_CIRCLE_ARCSEC;
}

export interface LotInputs {
  ascArcsec: bigint;
  sunArcsec: bigint;
  moonArcsec: bigint;
  venusArcsec: bigint;
  marsArcsec: bigint;
  jupiterArcsec: bigint;
  saturnArcsec: bigint;
  mercuryArcsec: bigint;
  /** True if Sun is above the horizon (houses 7–12). */
  isDay: boolean;
}

/** Build the seven Hellenistic Lots. */
export function computeLots(i: LotInputs): Lot[] {
  const out: Lot[] = [];
  const push = (name: string, longitudeArcsec: bigint, formula: string) => {
    const v = modPos(longitudeArcsec);
    out.push({ name, longitudeArcsec: v, address: CrtAddress.fromArcsec(v), formula });
  };
  // Fortune
  push(
    "Part of Fortune",
    i.isDay ? i.ascArcsec + i.moonArcsec - i.sunArcsec : i.ascArcsec + i.sunArcsec - i.moonArcsec,
    i.isDay ? "ASC + Moon − Sun" : "ASC + Sun − Moon",
  );
  // Spirit (mirror of Fortune)
  push(
    "Part of Spirit",
    i.isDay ? i.ascArcsec + i.sunArcsec - i.moonArcsec : i.ascArcsec + i.moonArcsec - i.sunArcsec,
    i.isDay ? "ASC + Sun − Moon" : "ASC + Moon − Sun",
  );
  // Eros: ASC + Venus − Spirit (using Spirit from above is reflective; classic: ASC+Venus−Spirit)
  // Following Valens: Eros = ASC + Venus − Spirit
  const spiritLon = out[1].longitudeArcsec;
  push("Part of Eros", i.ascArcsec + i.venusArcsec - spiritLon, "ASC + Venus − Spirit (Valens)");
  // Necessity: ASC + Fortune − Mercury
  const fortLon = out[0].longitudeArcsec;
  push("Part of Necessity", i.ascArcsec + fortLon - i.mercuryArcsec, "ASC + Fortune − Mercury");
  // Courage: ASC + Fortune − Mars
  push("Part of Courage", i.ascArcsec + fortLon - i.marsArcsec, "ASC + Fortune − Mars");
  // Victory: ASC + Jupiter − Spirit
  push("Part of Victory", i.ascArcsec + i.jupiterArcsec - spiritLon, "ASC + Jupiter − Spirit");
  // Nemesis: ASC + Fortune − Saturn
  push("Part of Nemesis", i.ascArcsec + fortLon - i.saturnArcsec, "ASC + Fortune − Saturn");
  void arcsec; // helper kept for ad-hoc callers
  return out;
}

export function isDayChart(sunArcsec: bigint, ascArcsec: bigint): boolean {
  // Day chart if Sun is above the horizon — i.e., between Descendant (ASC+180°)
  // and ASC going through houses 12,11,10,9,8,7. Equivalently:
  // longitude diff (sun − asc) mod 360° is in (180°, 360°).
  const diff = modPos(sunArcsec - ascArcsec);
  const half = FULL_CIRCLE_ARCSEC / 2n;
  return diff > half;
}
