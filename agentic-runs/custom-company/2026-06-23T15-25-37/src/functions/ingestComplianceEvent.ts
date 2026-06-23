import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { evaluateCompliance, ProcurementEvent } from '../lib/compliance';

export async function ingestComplianceEvent(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const body = await request.json() as ProcurementEvent;
  if (!body.memberId || !body.poNumber || !body.itemId) {
    return { status: 400, jsonBody: { error: 'memberId, poNumber, and itemId are required' } };
  }

  const finding = evaluateCompliance(body);
  context.log('compliance_evaluated', { memberId: body.memberId, poNumber: body.poNumber, status: finding.status });

  return {
    status: 200,
    jsonBody: {
      memberId: body.memberId,
      poNumber: body.poNumber,
      itemId: body.itemId,
      finding
    }
  };
}

app.http('ingestComplianceEvent', {
  methods: ['POST'],
  authLevel: 'function',
  route: 'compliance/evaluate',
  handler: ingestComplianceEvent
});