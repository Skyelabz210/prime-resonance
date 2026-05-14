// Plain-language narration generator. Maps every claim to math fields.
// Each segment carries highlightTargets that the front of the card animates.
import type { NarrationTrack, NarrationSegment, AspectContext, HouseContext, MathTrace, ShadowContactContext } from "../types/resonanceTypes";
import type { ClassifiedAspect, ResidueBond, FaceOfZero } from "@/lib/qmnf/aspects";
import type { PlanetPosition } from "@/lib/qmnf/ephemeris";

// Approximate karaoke timing: ~280ms per word.
const MS_PER_WORD = 280;

function timedSegments(parts: Array<{ text: string; targets: string[]; mathRefs: string[] }>): {
  segments: NarrationSegment[];
  fullText: string;
} {
  let t = 0;
  const segments: NarrationSegment[] = [];
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const wordCount = p.text.trim().split(/\s+/).length;
    const dur = Math.max(600, wordCount * MS_PER_WORD);
    segments.push({
      id: `seg-${i}`,
      startMs: t,
      endMs: t + dur,
      text: p.text,
      highlightTargets: p.targets,
      mathRefs: p.mathRefs,
    });
    t += dur + 120;
  }
  return { segments, fullText: parts.map((p) => p.text).join(" ") };
}

interface AspectArgs {
  aspect: ClassifiedAspect;
  ctx: AspectContext;
  math: MathTrace;
}
interface HouseArgs {
  planet: PlanetPosition;
  ctx: HouseContext;
  math: MathTrace;
}
interface ShadowArgs {
  bond: ResidueBond;
  ctx: ShadowContactContext;
  math: MathTrace;
  a: PlanetPosition;
  b: PlanetPosition;
}
interface FaceOfZeroArgs {
  fz: FaceOfZero;
  math: MathTrace;
  a: PlanetPosition;
  b: PlanetPosition;
}

type NarrationKind = "aspect" | "house" | "shadow" | "faceofzero";
type NarrationArgs = AspectArgs | HouseArgs | ShadowArgs | FaceOfZeroArgs;

export function buildNarrationFor(kind: NarrationKind, args: NarrationArgs): NarrationTrack {
  if (kind === "aspect") {
    const { aspect, ctx } = args as AspectArgs;
    const parts = [
      {
        text: `${aspect.a} and ${aspect.b} are separated by ${ctx.angleActualDeg.toFixed(3)} degrees.`,
        targets: [`body:${aspect.a}`, `body:${aspect.b}`, "value:separation"],
        mathRefs: ["intermediateValues.separationDeg"],
      },
      {
        text: `The target angle for a ${aspect.aspect.name} is ${ctx.aspectTargetDeg} degrees, leaving an orb of ${ctx.orbDeg.toFixed(3)} degrees.`,
        targets: ["value:orb", "value:target"],
        mathRefs: ["intermediateValues.targetDeg", "intermediateValues.orbDeg"],
      },
      {
        text: `Normalized strength is ${(ctx.normalizedStrength * 100).toFixed(1)} percent of full closure.`,
        targets: ["meter:strength"],
        mathRefs: ["finalScores.normalizedStrength"],
      },
      {
        text: ctx.applying
          ? `The two bodies are still approaching exactness — pressure is rising.`
          : `The two bodies have already separated — pressure is releasing.`,
        targets: [ctx.applying ? "indicator:applying" : "indicator:separating"],
        mathRefs: ["intermediateValues.applying"],
      },
    ];
    return { ...timedSegments(parts) };
  }

  if (kind === "house") {
    const { planet, ctx } = args as HouseArgs;
    const parts = [
      {
        text: `${planet.name} sits at ${ctx.bodyLongitudeDeg.toFixed(3)} degrees of ecliptic longitude.`,
        targets: [`body:${planet.name}`, "value:longitude"],
        mathRefs: ["inputs.longitudeDeg"],
      },
      {
        text: `House ${ctx.houseNumber} runs from ${ctx.cuspStartDeg.toFixed(2)} to ${ctx.cuspEndDeg.toFixed(2)} degrees, spanning ${ctx.houseSpanDeg.toFixed(2)} degrees.`,
        targets: ["arc:house", `house:${ctx.houseNumber}`],
        mathRefs: ["intermediateValues.spanDeg"],
      },
      {
        text: `Depth is ${ctx.depthPercent.toFixed(1)} percent — phase state ${ctx.phaseState}.`,
        targets: ["arc:depth", "indicator:phase"],
        mathRefs: ["finalScores.depthPercent"],
      },
      {
        text: ctx.houseConfidence < 0.8
          ? `House confidence is ${ctx.houseConfidence.toFixed(2)}; treat house assignment as approximate.`
          : `House confidence is ${ctx.houseConfidence.toFixed(2)}.`,
        targets: ["meter:confidence"],
        mathRefs: ["inputs.houseSystem"],
      },
    ];
    return { ...timedSegments(parts) };
  }

  if (kind === "shadow") {
    const { bond, ctx, a, b } = args as ShadowArgs;
    const parts = [
      {
        text: `${bond.a} and ${bond.b} share residue ${a.address.r11} modulo 11.`,
        targets: [`body:${bond.a}`, `body:${bond.b}`, "value:residue"],
        mathRefs: ["intermediateValues.r11_A", "intermediateValues.r11_B"],
      },
      {
        text: `Both bodies inhabit shadow lane "${bond.laneName}".`,
        targets: ["overlay:shadow"],
        mathRefs: ["intermediateValues.shadowLane"],
      },
      {
        text: ctx.explanation,
        targets: ["text:explanation"],
        mathRefs: ["intermediateValues.classicallyInvisible"],
      },
      {
        text: `No conventional aspect connects them — this bond is invisible to angular astrology.`,
        targets: ["indicator:invisible"],
        mathRefs: ["intermediateValues.classicallyInvisible"],
      },
    ];
    void b;
    return { ...timedSegments(parts) };
  }

  // faceofzero
  const { fz, a, b } = args as FaceOfZeroArgs;
  const parts = [
    {
      text: `${fz.a} and ${fz.b} lock simultaneously on lane 11 and lane 13.`,
      targets: [`body:${fz.a}`, `body:${fz.b}`, "overlay:crt"],
      mathRefs: ["intermediateValues.r11", "intermediateValues.r13"],
    },
    {
      text: `Their mod-11 residue is ${fz.shadowResidue}; their mod-13 residue is ${fz.boundaryResidue}.`,
      targets: ["value:r11", "value:r13"],
      mathRefs: ["intermediateValues.r11", "intermediateValues.r13"],
    },
    {
      text: `Joint match probability is approximately 0.7 percent — this is a Face of Zero locus.`,
      targets: ["meter:rarity"],
      mathRefs: ["finalScores.rarity"],
    },
  ];
  void a;
  void b;
  return { ...timedSegments(parts) };
}
