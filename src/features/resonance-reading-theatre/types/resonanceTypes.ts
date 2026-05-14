// Resonance Reading Theatre — type definitions
// Every claim made by the UI must trace back to one of these structures.

export type ResonanceEventType =
  | "planet_house_ingress"
  | "planet_house_egress"
  | "house_depth_peak"
  | "aspect_exact"
  | "aspect_applying"
  | "aspect_separating"
  | "shadow_contact"
  | "residue_contact"
  | "crt_lane_overlap"
  | "winding_recurrence"
  | "angular_threshold"
  | "cluster_density"
  | "transit_to_natal"
  | "natal_static";

export interface CelestialBodyState {
  name: string;
  longitudeDeg: number;
  sign?: string;
  degreeInSign?: number;
  velocityDegPerDay: number;
  retrograde: boolean;
  source: string;
  sourceConfidence: number;
}

export interface HouseContext {
  houseNumber: number;
  cuspStartDeg: number;
  cuspEndDeg: number;
  houseSpanDeg: number;
  bodyLongitudeDeg: number;
  depthPercent: number;
  distanceFromEntryCuspDeg: number;
  distanceToExitCuspDeg: number;
  phaseState:
    | "pre_entry"
    | "entering"
    | "early"
    | "building"
    | "peak"
    | "late"
    | "egressing"
    | "post_exit";
  houseConfidence: number;
}

export interface AspectContext {
  bodyA: string;
  bodyB: string;
  angleActualDeg: number;
  aspectTargetDeg: number;
  orbDeg: number;
  maxOrbDeg: number;
  normalizedStrength: number;
  applying: boolean;
  separating: boolean;
  angularVelocityDelta: number;
}

export interface ShadowContactContext {
  contactType:
    | "near_miss"
    | "midpoint"
    | "axis_mirror"
    | "antiscia"
    | "contra_antiscia"
    | "cusp_echo"
    | "residue_echo"
    | "phase_inversion"
    | "secondary_orb";
  bodies: string[];
  contactLongitudeDeg?: number;
  deviationDeg: number;
  normalizedStrength: number;
  explanation: string;
}

export interface ResidueContext {
  modulusSet: number[];
  residues: Record<string, number[]>;
  crtLaneId?: string;
  laneOverlapScore?: number;
  windingCount?: number;
  recurrenceScore?: number;
}

export interface PhaseContext {
  phaseAngleDeg: number;
  phaseDepth: number;
  phaseState:
    | "dormant"
    | "entering"
    | "building"
    | "peak"
    | "waning"
    | "released"
    | "shadow_active";
  visualDepthIcon: "new" | "crescent" | "quarter" | "gibbous" | "full" | "waning";
}

export interface ConfidenceVector {
  ephemeris: number;
  house: number;
  aspect: number;
  residue: number;
  shadow: number;
  narration: number;
  total: number;
}

export interface CardVisualState {
  glyphs: string[];
  primaryBodyColorToken?: string;
  depthIcon: string;
  overlayMode:
    | "clean"
    | "threshold"
    | "high_intensity"
    | "shadow_overlay"
    | "residue_grid"
    | "crt_lane"
    | "cluster";
  animationMode:
    | "static"
    | "orbit_drift"
    | "cusp_crossing"
    | "aspect_pulse"
    | "shadow_flicker"
    | "lane_lock"
    | "winding_loop";
}

export interface NarrationSegment {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
  highlightTargets: string[]; // e.g. ["body:Venus", "value:orb", "arc:house"]
  mathRefs: string[]; // keys into MathTrace.intermediateValues / finalScores
}

export interface NarrationTrack {
  text: string;
  segments: NarrationSegment[];
  audioUrl?: string;
}

export interface MathTrace {
  summary: string;
  inputs: Record<string, unknown>;
  equations: string[];
  intermediateValues: Record<string, unknown>;
  finalScores: Record<string, number>;
  reasoningPath: string[];
}

export interface ResonanceCard {
  id: string;
  priority: number;
  eventType: ResonanceEventType;
  title: string;
  subtitle: string;
  bodies: CelestialBodyState[];
  houseContext?: HouseContext;
  aspectContext?: AspectContext;
  residueContext?: ResidueContext;
  shadowContext?: ShadowContactContext;
  phaseContext: PhaseContext;
  depth: number;
  intensity: number;
  confidence: ConfidenceVector;
  visualState: CardVisualState;
  narration: NarrationTrack;
  mathTrace: MathTrace;
}

export interface ReadingSummary {
  totalCards: number;
  topEventType: ResonanceEventType;
  averageConfidence: number;
  dominantBodies: string[];
  notes: string[];
}

export interface EngineDiagnostics {
  totalCandidates: number;
  rejectedLowConfidence: number;
  computeMs: number;
  warnings: string[];
}

export interface CalculationConfig {
  maxCards: number;
  minConfidence: number;
  includeShadow: boolean;
  includeResidue: boolean;
}

export interface ResonanceReadingSession {
  sessionId: string;
  userId?: string;
  birthDataLabel: string;
  calculationConfig: CalculationConfig;
  generatedAt: string;
  engineVersion: string;
  cards: ResonanceCard[];
  globalSummary: ReadingSummary;
  diagnostics: EngineDiagnostics;
}
