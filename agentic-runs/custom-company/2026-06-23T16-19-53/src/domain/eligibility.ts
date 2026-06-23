export type EnrollmentInput = { memberId: string; employerId: string; bmi?: number; a1c?: number; systolicBp?: number; ldl?: number; diagnoses?: string[] };
export type EnrollmentResult = { memberId: string; employerId: string; tracks: string[]; riskTier: "low" | "moderate" | "high"; baseline: Record<string, number | null> };

export function qualifyMember(input: EnrollmentInput): EnrollmentResult {
  const dx = new Set((input.diagnoses || []).map(d => d.toLowerCase()));
  const tracks: string[] = [];
  if ((input.bmi ?? 0) >= 30 || dx.has("obesity")) tracks.push("weight");
  if ((input.a1c ?? 0) >= 6.5 || dx.has("diabetes")) tracks.push("diabetes");
  if ((input.systolicBp ?? 0) >= 130 || dx.has("hypertension")) tracks.push("blood-pressure");
  if ((input.ldl ?? 0) >= 130 || dx.has("hyperlipidemia")) tracks.push("lipids");

  let score = 0;
  if ((input.a1c ?? 0) >= 8) score += 2;
  if ((input.systolicBp ?? 0) >= 140) score += 1;
  if ((input.bmi ?? 0) >= 35) score += 1;
  if ((input.ldl ?? 0) >= 160) score += 1;

  const riskTier = score >= 3 ? "high" : score >= 1 ? "moderate" : "low";
  return {
    memberId: input.memberId,
    employerId: input.employerId,
    tracks,
    riskTier,
    baseline: {
      bmi: input.bmi ?? null,
      a1c: input.a1c ?? null,
      systolicBp: input.systolicBp ?? null,
      ldl: input.ldl ?? null
    }
  };
}