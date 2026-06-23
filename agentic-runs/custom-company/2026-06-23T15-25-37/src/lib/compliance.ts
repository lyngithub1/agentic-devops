export type ProcurementEvent = { memberId: string; poNumber: string; itemId: string; supplierId: string; pricePaid: number; contractPrice: number; preferredItemId?: string; preferredItemPrice?: number; currentTierMet?: boolean };
export type Finding = { status: string; reason: string; estimatedSavings: number; recommendedAction: string };

export function evaluateCompliance(e: ProcurementEvent): Finding {
  if (e.pricePaid > e.contractPrice) {
    return {
      status: 'noncompliant',
      reason: 'off_contract_or_missed_tier',
      estimatedSavings: round2(e.pricePaid - e.contractPrice),
      recommendedAction: `Convert PO ${e.poNumber} to contracted price and notify buyer.`
    };
  }
  if (e.currentTierMet === false) {
    return {
      status: 'opportunity',
      reason: 'missed_tier_pricing',
      estimatedSavings: round2(e.contractPrice * 0.03),
      recommendedAction: `Aggregate additional volume for item ${e.itemId} to reach next contract tier.`
    };
  }
  if (e.preferredItemId && e.preferredItemPrice !== undefined && e.preferredItemPrice < e.pricePaid) {
    return {
      status: 'opportunity',
      reason: 'substitution_available',
      estimatedSavings: round2(e.pricePaid - e.preferredItemPrice),
      recommendedAction: `Recommend substitution to preferred item ${e.preferredItemId}.`
    };
  }
  return {
    status: 'compliant',
    reason: 'within_contract',
    estimatedSavings: 0,
    recommendedAction: 'No action required.'
  };
}

const round2 = (n: number) => Math.round(n * 100) / 100;