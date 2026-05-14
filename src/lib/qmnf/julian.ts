// Julian Date conversions
export const J2000_JD = 2451545.0;

export function datetimeToJD(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  tzOffsetHours = 0,
): number {
  // Convert local → UTC
  const utcHour = hour - tzOffsetHours;
  let y = year,
    m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFrac = day + (utcHour + minute / 60 + second / 3600) / 24;
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayFrac + B - 1524.5;
}

export function jdToCenturiesJ2000(jd: number): number {
  return (jd - J2000_JD) / 36525;
}
