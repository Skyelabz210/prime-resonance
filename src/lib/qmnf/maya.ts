// Maya/Dresden Codex calendrics
import { MAYA_EPOCH_JD } from "./constants";

const TZOLKIN_NAMES = [
  "Imix",
  "Ik'",
  "Ak'b'al",
  "K'an",
  "Chikchan",
  "Kimi",
  "Manik'",
  "Lamat",
  "Muluk",
  "Ok",
  "Chuwen",
  "Eb",
  "B'en",
  "Ix",
  "Men",
  "K'ib'",
  "Kaban",
  "Etz'nab'",
  "Kawak",
  "Ajaw",
];
const HAAB_MONTHS = [
  "Pop",
  "Wo'",
  "Sip",
  "Sotz'",
  "Sek",
  "Xul",
  "Yaxk'in",
  "Mol",
  "Ch'en",
  "Yax",
  "Sak'",
  "Keh",
  "Mak",
  "K'ank'in",
  "Muwan",
  "Pax",
  "K'ayab'",
  "Kumk'u",
  "Wayeb'",
];
const STATIONS_819 = ["East-Red", "North-White", "West-Black", "South-Yellow"];

export interface MayaPosition {
  longCount: string;
  tzolkin: { number: number; name: string };
  haab: { day: number; month: string };
  calendarRound: string;
  station819: { stationIndex: number; color: string; dayInCycle: number };
  venusPhase: { dayInCycle: number; phase: string };
}

function pyMod(a: bigint, n: bigint): bigint {
  const r = a % n;
  return r < 0n ? r + n : r;
}

export function computeMaya(jd: number): MayaPosition {
  const jdInt = BigInt(Math.floor(jd + 0.5)); // noon-rollover convention
  const days = jdInt - MAYA_EPOCH_JD;

  // Long Count (baktun.katun.tun.uinal.kin)
  let d = days;
  const baktun = d / 144000n;
  d = pyMod(d, 144000n);
  const katun = d / 7200n;
  d = pyMod(d, 7200n);
  const tun = d / 360n;
  d = pyMod(d, 360n);
  const uinal = d / 20n;
  d = pyMod(d, 20n);
  const kin = d;

  // Tzolk'in: epoch was 4 Ajaw → number=4, name index 19
  const tzNum = Number(pyMod(days + 3n, 13n)) + 1; // start at 4
  const tzName = TZOLKIN_NAMES[Number(pyMod(days + 19n, 20n))];

  // Haab: epoch was 8 Kumk'u → day 8 of month index 17
  const haabPos = Number(pyMod(days + 348n, 365n)); // 348 = 17*20 + 8
  const haabMonth = Math.floor(haabPos / 20);
  const haabDay = haabPos % 20;

  // 819-day cycle
  const station = Number(pyMod(days, 819n));
  const stationIdx = Math.floor(station / Math.floor(819 / 4)) % 4;

  // Venus 584-day cycle: phases — Inferior conj (8d), Morning Star (236d),
  // Superior conj (90d), Evening Star (250d)
  const vpos = Number(pyMod(days, 584n));
  let phase: string;
  if (vpos < 8) phase = "Inferior Conjunction";
  else if (vpos < 244) phase = "Morning Star";
  else if (vpos < 334) phase = "Superior Conjunction";
  else phase = "Evening Star";

  return {
    longCount: `${baktun}.${katun}.${tun}.${uinal}.${kin}`,
    tzolkin: { number: tzNum, name: tzName },
    haab: { day: haabDay, month: HAAB_MONTHS[haabMonth] },
    calendarRound: `${tzNum} ${tzName} ${haabDay} ${HAAB_MONTHS[haabMonth]}`,
    station819: { stationIndex: stationIdx, color: STATIONS_819[stationIdx], dayInCycle: station },
    venusPhase: { dayInCycle: vpos, phase },
  };
}
