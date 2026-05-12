// Format helpers
import { ARCSEC_PER_SIGN, ZODIAC_SIGNS } from "./constants";

export function arcsecToDMS(arcsec: bigint): { d: number; m: number; s: number } {
  const total = Number(arcsec);
  const d = Math.floor(total / 3600);
  const remM = total - d * 3600;
  const m = Math.floor(remM / 60);
  const s = Math.floor(remM - m * 60);
  return { d, m, s };
}

export function signIndexFromArcsec(arcsec: bigint): number {
  return Number(arcsec / ARCSEC_PER_SIGN);
}

export function formatPosition(arcsec: bigint): string {
  const sign = signIndexFromArcsec(arcsec);
  const inSign = arcsec % ARCSEC_PER_SIGN;
  const { d, m, s } = arcsecToDMS(inSign);
  return `${d}° ${ZODIAC_SIGNS[sign].glyph} ${m}'${s}"`;
}

export function arcsecToDeg(arcsec: bigint): number {
  return Number(arcsec) / 3600;
}
