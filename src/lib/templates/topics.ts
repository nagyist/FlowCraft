// 30 topics balanced across categories. Combined with 14 types in
// TEMPLATE_TYPES this drives the 420-cell template matrix.
export type TopicCategory =
  | 'engineering'
  | 'product'
  | 'ops'
  | 'business'
  | 'data'

export interface TemplateTopic {
  slug: string
  title: string
  category: TopicCategory
  blurb: string
}

export const TEMPLATE_TOPICS: readonly TemplateTopic[] = [
  // engineering (10)
  { slug: 'user-authentication-flow',   title: 'User Authentication Flow',     category: 'engineering', blurb: 'Login, session, and logout sequence.' },
  { slug: 'oauth-2-authorization',      title: 'OAuth 2.0 Authorization',      category: 'engineering', blurb: 'Authorization code grant flow.' },
  { slug: 'ci-cd-pipeline',             title: 'CI/CD Pipeline',               category: 'engineering', blurb: 'From commit to production deploy.' },
  { slug: 'microservices-architecture', title: 'Microservices Architecture',   category: 'engineering', blurb: 'Service boundaries and communication.' },
  { slug: 'kubernetes-deployment',      title: 'Kubernetes Deployment',        category: 'engineering', blurb: 'Pods, services, ingress, and rollout.' },
  { slug: 'database-migration',         title: 'Database Migration',           category: 'engineering', blurb: 'Schema change with zero downtime.' },
  { slug: 'rest-api-request-lifecycle', title: 'REST API Request Lifecycle',   category: 'engineering', blurb: 'From client call to database and back.' },
  { slug: 'event-driven-architecture',  title: 'Event-Driven Architecture',    category: 'engineering', blurb: 'Producers, brokers, consumers.' },
  { slug: 'git-branching-strategy',     title: 'Git Branching Strategy',       category: 'engineering', blurb: 'Trunk-based or GitFlow workflow.' },
  { slug: 'incident-response-runbook',  title: 'Incident Response Runbook',    category: 'engineering', blurb: 'Detect, triage, mitigate, post-mortem.' },
  // product (6)
  { slug: 'user-onboarding-flow',       title: 'User Onboarding Flow',         category: 'product',     blurb: 'First-run experience for new users.' },
  { slug: 'checkout-funnel',            title: 'E-commerce Checkout Funnel',   category: 'product',     blurb: 'Cart through payment to confirmation.' },
  { slug: 'product-launch-plan',        title: 'Product Launch Plan',          category: 'product',     blurb: 'Beta, marketing, GA, and post-launch.' },
  { slug: 'feature-rollout',            title: 'Feature Rollout',              category: 'product',     blurb: 'Internal, beta, percent rollout, GA.' },
  { slug: 'customer-feedback-loop',     title: 'Customer Feedback Loop',       category: 'product',     blurb: 'Collect, analyze, act, communicate.' },
  { slug: 'a-b-testing-workflow',       title: 'A/B Testing Workflow',         category: 'product',     blurb: 'Hypothesis, design, ship, decide.' },
  // ops (6)
  { slug: 'agile-sprint-cycle',         title: 'Agile Sprint Cycle',           category: 'ops',         blurb: 'Plan, build, review, retro.' },
  { slug: 'code-review-process',        title: 'Code Review Process',          category: 'ops',         blurb: 'PR open through merge.' },
  { slug: 'hiring-pipeline',            title: 'Hiring Pipeline',              category: 'ops',         blurb: 'Sourcing through offer.' },
  { slug: 'employee-onboarding',        title: 'Employee Onboarding',          category: 'ops',         blurb: 'Day one through 90-day milestones.' },
  { slug: 'customer-support-triage',    title: 'Customer Support Triage',      category: 'ops',         blurb: 'Ticket intake to resolution.' },
  { slug: 'change-management',          title: 'Change Management',            category: 'ops',         blurb: 'Propose, review, schedule, deploy, verify.' },
  // business (4)
  { slug: 'sales-pipeline',             title: 'Sales Pipeline',               category: 'business',    blurb: 'Lead through closed-won.' },
  { slug: 'lead-qualification',         title: 'Lead Qualification (BANT)',    category: 'business',    blurb: 'Budget, authority, need, timing.' },
  { slug: 'invoice-approval-workflow',  title: 'Invoice Approval Workflow',    category: 'business',    blurb: 'Receive, validate, approve, pay.' },
  { slug: 'project-kickoff',            title: 'Project Kickoff',              category: 'business',    blurb: 'Charter, stakeholders, plan, comms.' },
  // data (4)
  { slug: 'etl-data-pipeline',          title: 'ETL Data Pipeline',            category: 'data',        blurb: 'Extract, transform, load.' },
  { slug: 'machine-learning-workflow',  title: 'Machine Learning Workflow',    category: 'data',        blurb: 'Data prep, train, evaluate, deploy.' },
  { slug: 'data-warehouse-schema',      title: 'Data Warehouse Schema',        category: 'data',        blurb: 'Star schema with facts and dimensions.' },
  { slug: 'analytics-event-tracking',   title: 'Analytics Event Tracking',     category: 'data',        blurb: 'From client emit to dashboard.' },
] as const

export const TEMPLATE_TOPIC_BY_SLUG: Record<string, TemplateTopic> =
  Object.fromEntries(TEMPLATE_TOPICS.map((t) => [t.slug, t]))
