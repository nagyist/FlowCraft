// Template diagram types for the gallery.
// Curated subset of supported diagrams that make good templates.
export type TemplateRenderer = 'mermaid' | 'reactflow' | 'chartjs'

export interface TemplateType {
  id: string
  title: string
  slug: string // URL slug
  renderer: TemplateRenderer
  blurb: string // 1-line description for hub cards
  whenToUse: string // 200-word body for the type hub page
}

export const TEMPLATE_TYPES: readonly TemplateType[] = [
  {
    id: 'flowchart',
    title: 'Flowchart',
    slug: 'flowchart',
    renderer: 'mermaid',
    blurb: 'Visualize processes, workflows, and decisions step by step.',
    whenToUse:
      'Flowcharts are the most universal diagram type — use them whenever you need to show a process from start to finish, with branches for decisions. They work for engineering pipelines, business approvals, customer journeys, and algorithm logic. Pick a flowchart when sequence and branching matter more than precise timing or roles.',
  },
  {
    id: 'sequenceDiagram',
    title: 'Sequence Diagram',
    slug: 'sequence-diagram',
    renderer: 'mermaid',
    blurb: 'Show how systems or actors interact over time.',
    whenToUse:
      'Sequence diagrams excel when the conversation between participants is what matters: a client calling an API, services exchanging events, or two people negotiating a hand-off. The vertical axis is time, the horizontal axis is participants. Reach for one when reviewers ask "who calls who, in what order?"',
  },
  {
    id: 'classDiagram',
    title: 'Class Diagram',
    slug: 'class-diagram',
    renderer: 'mermaid',
    blurb: 'Model the static structure of an object-oriented system.',
    whenToUse:
      'Class diagrams describe the types in your system and how they relate — inheritance, composition, associations. Use them during design to communicate domain models, or after the fact to onboard new engineers to an unfamiliar codebase. Best for OO systems; less useful for purely functional code.',
  },
  {
    id: 'stateDiagram',
    title: 'State Diagram',
    slug: 'state-diagram',
    renderer: 'mermaid',
    blurb:
      'Capture the lifecycle of an entity through its states and transitions.',
    whenToUse:
      'State diagrams shine when an object has a small, well-defined set of modes and the rules for moving between them matter — order status, ticket lifecycle, connection state. They make impossible transitions visible and force you to think about edge cases like timeouts and cancellation.',
  },
  {
    id: 'entityRelationshipDiagram',
    title: 'ER Diagram',
    slug: 'er-diagram',
    renderer: 'mermaid',
    blurb: 'Model database tables, columns, and relationships.',
    whenToUse:
      'Entity-relationship diagrams describe the shape of your data: tables, columns, primary and foreign keys, cardinalities. Use them when planning a new schema, documenting an existing one, or arguing about whether a relationship should be one-to-many or many-to-many.',
  },
  {
    id: 'userJourney',
    title: 'User Journey',
    slug: 'user-journey',
    renderer: 'mermaid',
    blurb: 'Map the steps and emotions a user experiences.',
    whenToUse:
      'User journey diagrams capture each step a person takes to accomplish a goal, alongside their satisfaction at that step. Use them in product discovery to find friction points, or in onboarding to make sure every touchpoint is intentional. Pair with real user research for sharpest insight.',
  },
  {
    id: 'gantt',
    title: 'Gantt Chart',
    slug: 'gantt-chart',
    renderer: 'mermaid',
    blurb: 'Visualize project timelines, dependencies, and milestones.',
    whenToUse:
      'Gantt charts are the standard way to show what work happens when, who is responsible, and what depends on what. Use them for cross-team launches, sprint planning, or any project where timeline coordination is more important than the work itself being interesting.',
  },
  {
    id: 'mindmaps',
    title: 'Mind Map',
    slug: 'mind-map',
    renderer: 'mermaid',
    blurb: 'Branch ideas radially from a central concept.',
    whenToUse:
      'Mind maps are for divergent thinking — brainstorming, exploring a problem space, organizing notes from a research session. Pick a mind map when the structure is hierarchical but order does not matter, and you want everyone to see the whole shape at once.',
  },
  {
    id: 'timeline',
    title: 'Timeline',
    slug: 'timeline',
    renderer: 'mermaid',
    blurb: 'Show events along a chronological axis.',
    whenToUse:
      'Timelines are perfect for histories: company milestones, incident post-mortems, product release cadence. They strip out everything except "what happened, when". Use a Gantt instead when you also need to convey duration and dependency.',
  },
  {
    id: 'gitgraph',
    title: 'Git Graph',
    slug: 'git-graph',
    renderer: 'mermaid',
    blurb: 'Diagram branches, merges, and tags in a Git workflow.',
    whenToUse:
      'Git graphs visualize branching strategies — trunk-based, GitFlow, release branches — without needing the actual repository. Use them in onboarding docs, contributing guides, or when proposing a workflow change so the team can compare options visually.',
  },
  {
    id: 'pieChart',
    title: 'Pie Chart',
    slug: 'pie-chart',
    renderer: 'mermaid',
    blurb: 'Show parts of a whole as proportional slices.',
    whenToUse:
      'Pie charts are best when you have a small number of categories (3–6) and want to show share-of-total at a glance. Avoid them for time series, comparisons across many categories, or when precise values matter more than relative size.',
  },
  {
    id: 'requirementDiagram',
    title: 'Requirement Diagram',
    slug: 'requirement-diagram',
    renderer: 'mermaid',
    blurb: 'Trace requirements to the components that satisfy them.',
    whenToUse:
      'Requirement diagrams come from systems engineering — they let you write down what the system must do and connect each requirement to the part of the design responsible for it. Use them in regulated environments or any project where traceability between spec and implementation is needed for audit or review.',
  },
  {
    id: 'flowDiagram',
    title: 'Node-based Flow',
    slug: 'node-flow',
    renderer: 'reactflow',
    blurb: 'A draggable, customizable flow diagram for richer layouts.',
    whenToUse:
      'Use a node-based flow when a Mermaid flowchart is not flexible enough — when you need custom node shapes, free-form layout, color coding by category, or interactive editing. The result is closer to what a designer would draw than a code-generated flowchart.',
  },
  {
    id: 'chart',
    title: 'Data Chart',
    slug: 'data-chart',
    renderer: 'chartjs',
    blurb: 'Render quantitative data as bar, line, or area charts.',
    whenToUse:
      'Pick a data chart when the story is in the numbers — comparing values, showing trends over time, highlighting outliers. Bar charts for comparison, line charts for time series, area charts for cumulative totals. Use a pie chart only for parts-of-a-whole.',
  },
] as const

export const TEMPLATE_TYPE_BY_ID: Record<string, TemplateType> =
  Object.fromEntries(TEMPLATE_TYPES.map((t) => [t.id, t]))

export const TEMPLATE_TYPE_BY_SLUG: Record<string, TemplateType> =
  Object.fromEntries(TEMPLATE_TYPES.map((t) => [t.slug, t]))
