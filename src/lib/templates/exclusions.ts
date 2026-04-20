// (type id, topic slug) pairs that don't make sense and should be skipped
// during seeding (and at the route layer).
export const TEMPLATE_EXCLUSIONS: ReadonlyArray<readonly [string, string]> = [
  // pieChart only fits topics with clear part-of-whole semantics
  ['pieChart', 'user-authentication-flow'],
  ['pieChart', 'oauth-2-authorization'],
  ['pieChart', 'ci-cd-pipeline'],
  ['pieChart', 'database-migration'],
  ['pieChart', 'rest-api-request-lifecycle'],
  ['pieChart', 'event-driven-architecture'],
  ['pieChart', 'git-branching-strategy'],
  ['pieChart', 'incident-response-runbook'],
  ['pieChart', 'kubernetes-deployment'],
  ['pieChart', 'change-management'],
  ['pieChart', 'code-review-process'],
  ['pieChart', 'invoice-approval-workflow'],
  ['pieChart', 'project-kickoff'],
  // gantt only fits topics with multi-step durations / projects
  ['gantt', 'oauth-2-authorization'],
  ['gantt', 'rest-api-request-lifecycle'],
  // gitgraph only fits engineering branching topics
  ['gitgraph', 'checkout-funnel'],
  ['gitgraph', 'sales-pipeline'],
  ['gitgraph', 'lead-qualification'],
  ['gitgraph', 'invoice-approval-workflow'],
  ['gitgraph', 'customer-feedback-loop'],
  ['gitgraph', 'project-kickoff'],
  ['gitgraph', 'employee-onboarding'],
  ['gitgraph', 'hiring-pipeline'],
  ['gitgraph', 'customer-support-triage'],
  ['gitgraph', 'data-warehouse-schema'],
  ['gitgraph', 'analytics-event-tracking'],
  ['gitgraph', 'agile-sprint-cycle'],
  ['gitgraph', 'change-management'],
  // requirementDiagram fits formal/spec topics
  ['requirementDiagram', 'sales-pipeline'],
  ['requirementDiagram', 'invoice-approval-workflow'],
  ['requirementDiagram', 'project-kickoff'],
  ['requirementDiagram', 'employee-onboarding'],
  ['requirementDiagram', 'hiring-pipeline'],
  ['requirementDiagram', 'agile-sprint-cycle'],
  ['requirementDiagram', 'customer-support-triage'],
  ['requirementDiagram', 'lead-qualification'],
  // entityRelationshipDiagram fits data-shaped topics
  ['entityRelationshipDiagram', 'agile-sprint-cycle'],
  ['entityRelationshipDiagram', 'incident-response-runbook'],
  ['entityRelationshipDiagram', 'change-management'],
]

export const EXCLUSION_SET = new Set(
  TEMPLATE_EXCLUSIONS.map(([t, s]) => `${t}::${s}`),
)

export function isExcluded(typeId: string, topicSlug: string): boolean {
  return EXCLUSION_SET.has(`${typeId}::${topicSlug}`)
}
