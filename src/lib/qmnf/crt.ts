// CRT primitives — exact integer arithmetic on the Safe Basis
import {
  SAFE_BASIS, M_SAFE, GEAR_MODULUS, FULL_CIRCLE_ARCSEC,
  SHADOW_LANE_NAMES, BOUNDARY_LANE_NAMES,
} from "./constants";

export function modBig(a: bigint, n: bigint): bigint {
  const r = a % n;
  return r < 0n ? r + n : r;
}

export function modInverse(a: bigint, n: bigint): bigint {
  // Extended Euclidean
  let [old_r, r] = [modBig(a, n), n];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_r !== 1n) throw new Error(`No inverse: gcd(${a}, ${n}) = ${old_r}`);
  return modBig(old_s, n);
}

// Garner's algorithm: reconstruct x from residues r_i mod p_i (coprime)
export function garnerReconstruct(residues: bigint[], primes: readonly bigint[]): bigint {
  const k = primes.length;
  const v: bigint[] = new Array(k);
  v[0] = modBig(residues[0], primes[0]);
  for (let i = 1; i < k; i++) {
    let prod = 1n;
    let term = v[0];
    for (let j = 1; j < i; j++) {
      prod *= primes[j - 1];
      term = modBig(term + v[j] * prod, primes[i]);
    }
    prod *= primes[i - 1];
    v[i] = modBig((residues[i] - term) * modInverse(prod, primes[i]), primes[i]);
  }
  let x = 0n;
  let mul = 1n;
  for (let i = 0; i < k; i++) {
    x += v[i] * mul;
    mul *= primes[i];
  }
  return x;
}

// K-elimination: gear residue mod 323
export function kEliminate(arcsec: bigint): bigint {
  return modBig(arcsec, GEAR_MODULUS);
}

export interface CrtResidues {
  r2: bigint; r3: bigint; r5: bigint; r7: bigint; r11: bigint; r13: bigint;
}

export class CrtAddress {
  constructor(
    public arcsec: bigint,            // canonical longitude in [0, 1_296_000)
    public r2: bigint,
    public r3: bigint,
    public r5: bigint,
    public r7: bigint,
    public r11: bigint,
    public r13: bigint,
    public gearK: bigint,             // arcsec mod 323
  ) {}

  static fromArcsec(n: bigint): CrtAddress {
    const a = modBig(n, FULL_CIRCLE_ARCSEC);
    return new CrtAddress(
      a,
      modBig(a, 2n),
      modBig(a, 3n),
      modBig(a, 5n),
      modBig(a, 7n),
      modBig(a, 11n),
      modBig(a, 13n),
      kEliminate(a),
    );
  }

  residues(): CrtResidues {
    return { r2: this.r2, r3: this.r3, r5: this.r5, r7: this.r7, r11: this.r11, r13: this.r13 };
  }

  shadowLane(): string {
    return SHADOW_LANE_NAMES[Number(this.r11)];
  }

  boundaryLane(): string {
    return BOUNDARY_LANE_NAMES[Number(this.r13)];
  }

  // Reconstruct from safe basis (sanity check — equals arcsec mod 30030)
  reconstructMod(): bigint {
    return garnerReconstruct(
      [this.r2, this.r3, this.r5, this.r7, this.r11, this.r13],
      SAFE_BASIS,
    );
  }
}

// Difference (B - A) as canonical arcsec separation in [0, 1_296_000)
export function arcsecDiff(a: bigint, b: bigint): bigint {
  return modBig(b - a, FULL_CIRCLE_ARCSEC);
}

// Carry pattern on (7, 11, 13) for a separation
export function carryTuple(sepArcsec: bigint): [number, number, number] {
  return [
    Number(modBig(sepArcsec, 7n)),
    Number(modBig(sepArcsec, 11n)),
    Number(modBig(sepArcsec, 13n)),
  ];
}

export { M_SAFE, SAFE_BASIS };
