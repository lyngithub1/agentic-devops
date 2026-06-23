import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { qualifyMember, EnrollmentInput } from "../domain/eligibility";

export async function enroll(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const body = await request.json() as Partial<EnrollmentInput>;
  if (!body.memberId || !body.employerId) {
    return { status: 400, jsonBody: { error: "memberId and employerId are required" } };
  }

  const result = qualifyMember({
    memberId: body.memberId,
    employerId: body.employerId,
    bmi: body.bmi,
    a1c: body.a1c,
    systolicBp: body.systolicBp,
    ldl: body.ldl,
    diagnoses: body.diagnoses || []
  });

  context.log("cardiometabolic enrollment accepted", { memberId: result.memberId, tracks: result.tracks.length, riskTier: result.riskTier });
  return { status: 200, jsonBody: result };
}

app.http("enroll", {
  methods: ["POST"],
  authLevel: "function",
  route: "cardiometabolic/enroll",
  handler: enroll
});