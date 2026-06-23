import type {
  AdrData,
  BusinessCaseData,
  CodeData,
  CompetitiveData,
  DashboardData,
  DeploymentData,
  FeedbackData,
  GtmData,
  Idea,
  MarketBriefData,
  MockPrData,
  OptimizationData,
  QualityGateData,
  ScaffoldData,
  TechPlanData,
  TestReportData,
  TriageData,
  UserStoryData,
} from "@/types";

/**
 * Everything that varies per business. The {@link buildScript} generator turns
 * this content into a fully choreographed multi-agent run, so authoring a new
 * business demo only requires filling this structure in.
 */
export interface RunContent {
  businessId: string;
  ideaTheme: string;
  marketBrief: MarketBriefData;
  competitive: CompetitiveData;
  ideas: Idea[]; // exactly 5, ranked
  chosenIdeaId: string;
  triage: TriageData;
  businessCase: BusinessCaseData;
  userStory: UserStoryData;
  techPlan: TechPlanData;
  adr: AdrData;
  scaffold: ScaffoldData;
  code: CodeData;
  patch: CodeData; // applied during the Operator -> Developer backward edge
  testReport: TestReportData;
  qualityGate: QualityGateData;
  pr: MockPrData;
  deployment: DeploymentData;
  dashboard: DashboardData;
  optimization: OptimizationData;
  gtm: GtmData;
  feedback: FeedbackData;
}
