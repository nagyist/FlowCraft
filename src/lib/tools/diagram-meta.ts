export interface DiagramMeta {
  diagramType: string
  displayName: string
  displayNamePlural: string
  noun: string
  whatIs: string[]
  whoUses: string[]
  whyAi: string[]
  howSteps: string[]
  faqs: { q: string; a: string }[]
  examplePrompt: string
  keywordSeeds: string[]
}

export const DIAGRAM_META: DiagramMeta[] = [
  {
    diagramType: 'flowchart',
    displayName: 'flowchart',
    displayNamePlural: 'flowcharts',
    noun: 'flowchart',
    whatIs: [
      'A flowchart is a diagram that represents a process or algorithm as a sequence of steps connected by arrows. Rectangles stand for actions, diamonds for decisions, and ovals for start and end points — the shapes give you a visual vocabulary for describing how work flows from input to outcome.',
      'Flowcharts excel any time you need to explain branching logic, onboarding steps, approval workflows, or troubleshooting trees to a mixed audience. They compress what would be pages of prose into a single picture that engineers, PMs, and support teams can all scan in seconds.',
    ],
    whoUses: [
      'Software engineers documenting control flow and algorithms',
      'Product managers spec-ing out user journeys and decision points',
      'Operations teams mapping approval chains and escalation paths',
      'Solutions architects explaining integration flows to stakeholders',
      'Support teams building troubleshooting guides and runbooks',
      'Teachers and trainers walking learners through multi-step concepts',
      'QA engineers mapping test paths through an application',
      'Business analysts standardising processes across departments',
    ],
    whyAi: [
      'Writing Mermaid flowchart syntax by hand means remembering node shapes, arrow styles, and subgraph rules while you try to stay focused on the logic. For anything beyond a few nodes, that friction is enough to keep most teams stuck on prose descriptions that nobody actually reads.',
      'Describing the flow in plain English and letting AI produce a valid Mermaid flowchart inverts the problem: you stay in the problem domain, the tool handles the syntax. You can iterate on shape and wording in seconds, and the output is text you can version-control alongside your code.',
    ],
    howSteps: [
      'Describe your process in plain English — include the starting point, the key decisions, and the outcomes.',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the rendered flowchart; ask for specific changes like "add a retry branch after the API call" or "split the last step into three sub-steps".',
      'Export as SVG, PNG, or Mermaid source to embed in docs, slides, or a README.',
      'Save the diagram to your FlowCraft workspace so you can come back and refine it later.',
    ],
    faqs: [
      {
        q: 'What notation does the generated flowchart use?',
        a: 'Mermaid flowchart syntax by default — the same flavour GitHub, GitLab, Notion, and Obsidian render natively. You can export the source and paste it anywhere Mermaid is supported.',
      },
      {
        q: 'How complex can the flowchart be?',
        a: "There's no hard cap, but flowcharts become hard to read beyond ~25 nodes. If your process is larger, describe it in sections and generate one sub-flow per request — you'll get diagrams people actually look at.",
      },
      {
        q: 'Can I edit the diagram after generating it?',
        a: "Yes. You can tweak the Mermaid source directly, or describe the change in plain English and regenerate. Both produce the same output; use whichever feels faster.",
      },
    ],
    examplePrompt:
      'A customer submits a support ticket. The system checks if it is urgent. If urgent, it pages the on-call engineer; otherwise it routes to the queue for next-day triage. Either path ends with an acknowledgement email.',
    keywordSeeds: [
      'flowchart generator',
      'flowchart maker',
      'ai flowchart',
      'mermaid flowchart',
      'online flowchart tool',
      'flowchart from text',
    ],
  },
  {
    diagramType: 'classDiagram',
    displayName: 'class diagram',
    displayNamePlural: 'class diagrams',
    noun: 'class-diagram',
    whatIs: [
      'A class diagram is a UML diagram that shows the static structure of an object-oriented system: its classes, their fields and methods, and the relationships between them — inheritance, composition, association, and dependency. Each class is a rectangle divided into name, attributes, and operations.',
      'Class diagrams are the bridge between domain modeling and code. They let you reason about type hierarchies, spot duplicated responsibilities, and communicate architecture to teammates without making them read every file in the repo.',
    ],
    whoUses: [
      'Backend engineers designing domain models and service layers',
      'Software architects reviewing system structure and cohesion',
      'Senior engineers onboarding new hires to unfamiliar codebases',
      'Students learning object-oriented programming and UML',
      'Library authors documenting public APIs and class hierarchies',
      'Technical writers producing SDK reference material',
      'Interview candidates explaining system design on a whiteboard',
      'Tech leads auditing legacy code before a refactor',
    ],
    whyAi: [
      'UML class diagram syntax is picky — the difference between association (a line) and aggregation (a hollow diamond) and composition (a filled diamond) matters, and getting it wrong changes the meaning. Most engineers gave up on UML diagrams years ago because the tooling was the blocker, not the ideas.',
      'Describing classes and their relationships in plain English and letting AI produce the UML is the ergonomic path. You get a diagram that reflects your intent, in seconds, using the exact notation a reviewer expects to see.',
    ],
    howSteps: [
      'Describe the classes you want to model — their attributes, methods, and how they relate.',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the rendered diagram; request tweaks like "show Order as composed of LineItems" or "add a visitor interface".',
      'Export as SVG, PNG, or Mermaid source for code reviews, design docs, or slide decks.',
      'Save the diagram to your workspace so it stays in sync with the code as the design evolves.',
    ],
    faqs: [
      {
        q: 'Does the tool understand UML relationship notation?',
        a: "Yes — inheritance, association, aggregation, composition, and dependency are all expressible. Mention the relationship type in plain English (e.g. 'Order composed of LineItems') and the generator will pick the right arrow.",
      },
      {
        q: 'Can I generate a diagram from source code?',
        a: "You can paste a code snippet into the prompt and ask for a class diagram of it. Expect better results from interfaces and data-model files than from large mixed files — the cleaner the input, the cleaner the diagram.",
      },
      {
        q: 'What format is the exported diagram?',
        a: 'Mermaid classDiagram source, plus SVG and PNG renders. Mermaid source is ideal for version control and for embedding in Markdown docs.',
      },
    ],
    examplePrompt:
      'A Library has many Books and many Members. A Book has a title, author, and ISBN. A Member can borrow multiple Books at once. A Loan records which Member borrowed which Book and when it is due.',
    keywordSeeds: [
      'class diagram generator',
      'uml class diagram',
      'ai class diagram',
      'mermaid class diagram',
      'online uml tool',
      'object diagram generator',
    ],
  },
  {
    diagramType: 'sequenceDiagram',
    displayName: 'sequence diagram',
    displayNamePlural: 'sequence diagrams',
    noun: 'sequence-diagram',
    whatIs: [
      'A sequence diagram is a UML diagram that shows how objects, services, or actors interact over time. It lays out participants across the top and uses vertical lifelines with horizontal arrows to represent the messages they exchange, read top to bottom in chronological order.',
      'Sequence diagrams are especially useful for documenting API calls, authentication flows, microservice choreography, and any scenario where the order of operations matters. Instead of describing an interaction in prose, a sequence diagram shows who calls whom, what they pass, and what comes back.',
    ],
    whoUses: [
      'Backend and full-stack engineers designing APIs and service-to-service calls',
      'Software architects mapping out distributed systems and event flows',
      'Technical leads writing design docs and RFCs',
      'SREs and on-call engineers debugging cross-service incidents',
      'Security engineers reviewing authentication and authorisation flows',
      'Integration consultants explaining how two systems will talk to each other',
      'QA engineers writing end-to-end test scenarios',
      'Students and candidates studying for system design interviews',
    ],
    whyAi: [
      'Sequence diagrams have a specific notation — solid arrows for synchronous calls, dashed for returns, activation bars for when a participant is busy. Getting this right by hand while also reasoning about a 15-step flow is slow, and the mental overhead is why most teams settle for bullet points instead.',
      'Describing the flow in plain English and letting AI render the Mermaid source collapses the two tasks. You think about the interaction; the tool handles the notation. Swap a participant, reorder a call, or add an alt block by saying so — no YAML indentation wrestling required.',
    ],
    howSteps: [
      'Describe the interaction in plain English — who the actors are, what messages they send, and the order they happen in.',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the rendered diagram; ask for specific changes like "add an error path" or "show the database response explicitly".',
      'Export as SVG, PNG, or Mermaid source for your design doc, PR description, or wiki.',
      'Save it to your workspace so you can update it when the flow changes.',
    ],
    faqs: [
      {
        q: 'Does it support alt/opt/loop blocks?',
        a: "Yes. Mention them in plain English ('if the token is expired, refresh it and retry', 'loop until all pages fetched') and the generator will emit the right Mermaid alt/opt/loop syntax.",
      },
      {
        q: 'How many participants can a diagram have?',
        a: 'Mermaid handles 10+ participants, but diagrams get hard to read past 6 or 7. If you need more, consider splitting into two diagrams — one per sub-flow.',
      },
      {
        q: 'Can I export to PlantUML or other formats?',
        a: 'Native output is Mermaid. Mermaid source is easy to convert to PlantUML syntactically, and SVG/PNG export works everywhere.',
      },
    ],
    examplePrompt:
      'A user signs up, the API verifies their email with a third-party provider, then creates a session token and stores the user in the database.',
    keywordSeeds: [
      'sequence diagram generator',
      'sequence diagram maker',
      'ai sequence diagram',
      'mermaid sequence diagram',
      'uml sequence diagram',
      'online sequence diagram tool',
    ],
  },
  {
    diagramType: 'stateDiagram',
    displayName: 'state diagram',
    displayNamePlural: 'state diagrams',
    noun: 'state-diagram',
    whatIs: [
      'A state diagram (or state machine diagram) shows the states an object or system can be in and the transitions that move it between them. Each state is a rounded rectangle; each transition is a labelled arrow triggered by an event or condition.',
      'State diagrams are the right tool whenever behaviour depends on history — order lifecycles, document review workflows, connection states, UI wizards, subscription billing. They make illegal transitions visible and give you a single source of truth for what can happen next.',
    ],
    whoUses: [
      'Backend engineers modelling entity lifecycles (orders, subscriptions, tickets)',
      'Frontend engineers designing multi-step forms and wizards',
      'Embedded engineers specifying hardware and firmware behaviour',
      'Protocol designers documenting connection and handshake states',
      'QA engineers enumerating test paths through a state machine',
      'PMs communicating approval and review workflows',
      'Game developers modelling AI behaviour and combat states',
      'Educators teaching finite-state machines and formal methods',
    ],
    whyAi: [
      'State machines are easy to describe in English ("a draft can be submitted or deleted; submitted goes to approved or rejected; approved can be published") and tedious to hand-render in Mermaid. The cost of drawing keeps most teams from formalising behaviour, so edge cases get discovered in production.',
      'Generating the diagram from a plain description flips the incentive. Want to add a new terminal state or a retry transition? Say so and regenerate. The diagram stays in step with the thinking instead of slowly drifting out of date.',
    ],
    howSteps: [
      'Describe the states, the events that trigger transitions, and any initial or final states.',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the rendered diagram; request tweaks like "merge Pending and Queued into one state" or "add a Cancelled terminal state".',
      'Export as SVG, PNG, or Mermaid source for your design doc or implementation ticket.',
      'Save the diagram so the canonical state machine lives next to the code it describes.',
    ],
    faqs: [
      {
        q: 'Does it support nested or composite states?',
        a: 'Yes. Describe the nesting in plain English ("Active contains Idle and Running") and the generator will emit the composite-state Mermaid syntax.',
      },
      {
        q: 'Can I mark initial and final states?',
        a: 'Yes — mention the starting state and any terminal ones in your prompt. The output uses the standard filled-circle / double-circle notation.',
      },
      {
        q: 'What about guards and actions on transitions?',
        a: "Mention them in the prompt — 'submit [only if complete] / notify reviewer' — and the generator will include them on the transition labels.",
      },
    ],
    examplePrompt:
      'A blog post starts as Draft. It can be submitted for review, which moves it to Pending. A reviewer can approve it (Published), request changes (back to Draft), or reject it (Archived, terminal).',
    keywordSeeds: [
      'state diagram generator',
      'state machine diagram',
      'ai state diagram',
      'mermaid state diagram',
      'uml state diagram',
      'online state machine tool',
    ],
  },
  {
    diagramType: 'entityRelationshipDiagram',
    displayName: 'entity-relationship diagram',
    displayNamePlural: 'entity-relationship diagrams',
    noun: 'er-diagram',
    whatIs: [
      'An entity-relationship diagram (ERD) shows the entities in a data model, their attributes, and the relationships between them. Each entity is a box listing fields and types; each relationship is a line annotated with cardinality — one-to-one, one-to-many, many-to-many.',
      'ERDs are the standard deliverable for database design and schema reviews. They surface foreign-key mistakes, missing join tables, and denormalisation trade-offs in one picture — long before any DDL gets written.',
    ],
    whoUses: [
      'Backend engineers designing SQL schemas and migrations',
      'Data engineers modelling warehouses, lakes, and marts',
      'Database administrators reviewing schema changes',
      'Software architects planning multi-service data ownership',
      'Analytics engineers documenting dbt or Looker models',
      'Product engineers pitching a feature that needs new tables',
      'Students learning relational database design',
      'Consultants auditing a client\'s data model',
    ],
    whyAi: [
      'Hand-writing Mermaid erDiagram syntax means remembering cardinality glyphs (`||--o{` for one-to-many, `}o--o{` for many-to-many) while you also keep track of field names, types, and keys. The syntax is the distraction; the model is what matters.',
      'Generating the ERD from a plain-English description of the schema removes the friction. Describe the tables and how they relate, regenerate as the design evolves, and get an ERD that actually tracks reality instead of becoming stale documentation.',
    ],
    howSteps: [
      'Describe your tables, their important fields, and how they relate (one-to-one, one-to-many, many-to-many).',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the rendered ERD; request changes like "split User into Users and UserProfiles" or "add a join table between Posts and Tags".',
      'Export as SVG, PNG, or Mermaid source for your schema review, PR, or data dictionary.',
      'Save the diagram to keep a canonical picture of the schema as it evolves.',
    ],
    faqs: [
      {
        q: 'Does it support cardinality notation (Crow\'s Foot)?',
        a: 'Yes — Mermaid\'s erDiagram syntax renders Crow\'s Foot notation. Mention the cardinality in plain English and the generator will pick the correct glyph.',
      },
      {
        q: 'Can I generate an ERD from existing SQL DDL?',
        a: 'Paste the CREATE TABLE statements or a schema dump into the prompt. Results are best when the DDL is clean and includes foreign-key constraints.',
      },
      {
        q: 'Does it show field types?',
        a: "Yes. Mention types ('id int PK, email varchar') in the prompt and they'll appear inside each entity box.",
      },
    ],
    examplePrompt:
      'A Users table has id, email, and created_at. A Posts table has id, user_id, title, and body, and a post belongs to one user. A Tags table has id and name, and posts can have many tags through a posts_tags join table.',
    keywordSeeds: [
      'er diagram generator',
      'erd generator',
      'entity relationship diagram',
      'ai database schema',
      'mermaid er diagram',
      'sql schema diagram',
    ],
  },
  {
    diagramType: 'userJourney',
    displayName: 'user journey map',
    displayNamePlural: 'user journey maps',
    noun: 'user-journey-map',
    whatIs: [
      'A user journey map visualises the steps a person takes to accomplish a goal with your product, together with the emotions they experience along the way. Each phase lists tasks scored by satisfaction, so peaks and troughs in the experience become visible at a glance.',
      'Journey maps are the common ground between design, product, engineering, and support. They anchor conversations about where friction lives and which parts of the funnel are worth investing in, backed by something more concrete than hunches.',
    ],
    whoUses: [
      'UX designers researching and presenting user experiences',
      'Product managers prioritising improvements across a funnel',
      'Customer success teams mapping onboarding and adoption',
      'Growth engineers identifying activation drop-offs',
      'Founders communicating the customer experience to investors',
      'Support teams spotting recurring friction points',
      'Service designers modelling cross-channel experiences',
      'Consultants facilitating discovery and journey-mapping workshops',
    ],
    whyAi: [
      'Journey maps sit in a tool graveyard: whiteboards get erased, Miro boards go stale, Figma files live in someone\'s personal workspace. Getting a journey map into a format everyone can find and update is usually the part that kills it.',
      'Generating a Mermaid journey map from a plain description gives you a version-controllable artefact that lives next to the code, the docs, or the PRD. Revisit it every quarter, regenerate with updated scores, keep it honest — no workshop required.',
    ],
    howSteps: [
      'Describe the phases of the journey, the tasks in each phase, and how happy the user is at each step (on a scale of 1-5 or similar).',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the journey map; request tweaks like "add a Churn phase" or "drop the satisfaction on step 3 to 1".',
      'Export as SVG, PNG, or Mermaid source to drop into your PRD, research readout, or all-hands.',
      'Save it to your workspace so you can revisit and update it as the product changes.',
    ],
    faqs: [
      {
        q: 'Can I include multiple personas on the same map?',
        a: "Mermaid journey diagrams support one actor per task. For multiple personas, either generate one map per persona or mention the persona in the task name.",
      },
      {
        q: 'What scale does the satisfaction score use?',
        a: "Mermaid uses a 1-5 or 1-7 integer score by default. Pick one scale and stick with it across phases for the chart to read cleanly.",
      },
      {
        q: 'Is this the same as a service blueprint?',
        a: "No — journey maps focus on the user\'s experience; service blueprints also include backstage processes and staff touchpoints. If you need a blueprint, describe both layers in the prompt and the generator will render what Mermaid supports natively.",
      },
    ],
    examplePrompt:
      'A new user discovers the product via a blog post (score 4), signs up (score 3), gets confused during onboarding (score 2), completes their first action (score 5), and shares with a teammate (score 5).',
    keywordSeeds: [
      'user journey map generator',
      'user journey tool',
      'ai journey map',
      'mermaid journey diagram',
      'customer journey map',
      'experience map maker',
    ],
  },
  {
    diagramType: 'gantt',
    displayName: 'Gantt chart',
    displayNamePlural: 'Gantt charts',
    noun: 'gantt-chart',
    whatIs: [
      'A Gantt chart shows a project timeline as horizontal bars across a calendar. Each bar is a task positioned at its start date and stretched to its end date; dependencies connect predecessors to successors, and milestones mark fixed dates.',
      'Gantt charts are the workhorse of project planning because they answer the three questions that come up in every status meeting: what are we working on, when does it finish, and what blocks what. They work equally well for a two-week sprint and a twelve-month program.',
    ],
    whoUses: [
      'Project managers running software delivery timelines',
      'Engineering managers scheduling feature rollouts and launches',
      'Founders planning fundraising, hiring, and product milestones',
      'Consultants presenting engagement timelines to clients',
      'Construction and operations teams tracking phased work',
      'Marketing leads scheduling campaigns around product launches',
      'Research leads planning experiments and write-up windows',
      'Students and educators planning coursework and thesis timelines',
    ],
    whyAi: [
      'Project planning tools are either too heavy (Jira, MS Project) or too fiddly (hand-edited spreadsheets) when all you need is a communicable view of the plan. Generating a Mermaid Gantt chart from a bullet list of tasks and durations lands on the right fidelity for status updates, board decks, and README roadmaps.',
      'Describe the tasks, when they start, how long they take, and what depends on what. The generator handles the date math, bar positioning, and dependency arrows. Replan by re-describing — no drag-and-drop required.',
    ],
    howSteps: [
      'List your tasks with start dates (or relative offsets), durations, and any dependencies.',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the rendered Gantt chart; request tweaks like "push launch back two weeks" or "mark beta as a milestone".',
      'Export as SVG, PNG, or Mermaid source for your status doc, board deck, or project README.',
      'Save the chart to your workspace so replanning is a five-second regeneration instead of an afternoon in spreadsheet purgatory.',
    ],
    faqs: [
      {
        q: 'Can it handle dependencies?',
        a: 'Yes — Mermaid Gantt supports "after task1" dependency syntax. Mention dependencies in plain English and the generator emits the right references.',
      },
      {
        q: 'Does it support milestones?',
        a: "Yes. Mark a task as a milestone in the prompt (e.g. 'Beta launch — milestone, 2026-05-01') and it renders as a diamond.",
      },
      {
        q: 'Can I use relative dates?',
        a: "Yes. Mermaid supports 'after X, duration Yd' style, so you can plan without fixing absolute dates up front. Regenerate once real dates land.",
      },
    ],
    examplePrompt:
      'A three-month product launch plan. Research runs for 3 weeks starting now. Design starts after research and takes 4 weeks. Engineering builds in parallel with design from week 4 and takes 8 weeks. Launch is a milestone at week 12.',
    keywordSeeds: [
      'gantt chart generator',
      'gantt chart maker',
      'ai gantt chart',
      'mermaid gantt',
      'project timeline tool',
      'online gantt chart',
    ],
  },
  {
    diagramType: 'pieChart',
    displayName: 'pie chart',
    displayNamePlural: 'pie charts',
    noun: 'pie-chart',
    whatIs: [
      'A pie chart shows how a whole breaks down into parts, with each slice sized proportionally to its share. It is the fastest way to communicate a composition — market share, budget allocation, traffic source mix — when there are only a handful of categories.',
      'Pie charts work best when there are 2 to 6 slices and one or two of them dominate. Past that, a bar chart or donut chart is usually easier to read; for a small number of categories with clear proportions, a pie chart still wins.',
    ],
    whoUses: [
      'Analysts and data teams reporting composition and share',
      'Founders presenting revenue mix or customer-segment breakdowns',
      'Marketing teams showing channel attribution in dashboards',
      'Engineering leads reporting error-category breakdowns',
      'Finance teams explaining budget allocation',
      'Sales leaders visualising pipeline by stage or region',
      'Operations leads tracking ticket categories in QBRs',
      'Students and educators introducing categorical data',
    ],
    whyAi: [
      'For a quick pie chart in a doc or slide, spinning up Excel, Google Sheets, or Chart.js is overkill. Mermaid renders pie charts from four lines of text, which is perfect for README sprinkles, internal tickets, and hand-authored reports.',
      'Generating the Mermaid source from a natural-language description ("40 percent from organic search, 30 percent from referrals...") means you never touch the syntax. You describe the breakdown; the tool produces the chart.',
    ],
    howSteps: [
      'Describe the categories and their values (percentages or raw numbers both work).',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the chart; request tweaks like "merge Other and Unknown" or "express values as percentages".',
      'Export as SVG, PNG, or Mermaid source for your report, slide deck, or README.',
      'Save it to your workspace so you can update the slices when the numbers change.',
    ],
    faqs: [
      {
        q: 'What\'s the maximum number of slices?',
        a: 'Mermaid has no hard cap, but pie charts get unreadable past 6-7 slices. If you have more categories, consider grouping small values into an "Other" slice or switching to a bar chart.',
      },
      {
        q: 'Do values have to sum to 100?',
        a: 'No — Mermaid normalises values into percentages automatically. Raw counts work as well as percentages.',
      },
      {
        q: 'Can I customise colours?',
        a: 'Mermaid pie charts use the theme\'s palette. You can change the overall theme (default, dark, forest, neutral) in the export options; per-slice colours need a post-export edit in SVG.',
      },
    ],
    examplePrompt:
      'A traffic-source breakdown for last month: 40 percent organic search, 30 percent direct, 15 percent referrals, 10 percent social, and 5 percent paid.',
    keywordSeeds: [
      'pie chart generator',
      'pie chart maker',
      'ai pie chart',
      'mermaid pie chart',
      'online pie chart tool',
      'data chart generator',
    ],
  },
  {
    diagramType: 'quadrantChart',
    displayName: 'quadrant chart',
    displayNamePlural: 'quadrant charts',
    noun: 'quadrant-chart',
    whatIs: [
      'A quadrant chart (2x2 matrix) plots items across two axes — typically impact vs effort, value vs cost, reach vs frequency — so that a single picture tells you where to focus. The four quadrants become shorthand: do-first, schedule, delegate, drop.',
      'Quadrant charts are the fastest way to align a team on priorities. You take twenty ideas, plot them, and the next move is obvious. They work in prioritisation, strategy, competitive analysis, and risk assessment.',
    ],
    whoUses: [
      'Product managers prioritising feature backlogs',
      'Engineering leads triaging tech-debt and bug lists',
      'Founders stack-ranking opportunities against constraints',
      'Strategy consultants presenting competitive landscapes',
      'Risk and compliance teams assessing likelihood vs impact',
      'Marketing teams mapping campaign cost vs reach',
      'Hiring managers evaluating candidate strengths',
      'Educators teaching prioritisation and decision frameworks',
    ],
    whyAi: [
      'Quadrant charts are trivial to sketch on a whiteboard and tedious to produce in tools. Drawing four axes, positioning twenty items, and labelling them in Figma takes half an hour; doing it in Mermaid with a natural-language prompt takes seconds.',
      'Describe the axes and the items with their coordinates. Regenerate when priorities shift. The chart stays current without anyone having to become a Mermaid expert.',
    ],
    howSteps: [
      'Name the two axes (e.g. "impact" and "effort") and list the items you want to plot, with approximate positions.',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the chart; request tweaks like "move feature X up and to the left" or "rename the top-right quadrant".',
      'Export as SVG, PNG, or Mermaid source for your planning doc, all-hands, or strategy memo.',
      'Save it to your workspace to make regenerating after each planning cycle painless.',
    ],
    faqs: [
      {
        q: 'Can I label the four quadrants?',
        a: 'Yes — Mermaid quadrantChart supports per-quadrant labels. Mention them in your prompt ("top-right is Do First, bottom-left is Drop") and they render in place.',
      },
      {
        q: 'How precise are the point positions?',
        a: 'Positions are on a 0-1 scale per axis. Give rough coordinates or describe items by quadrant — the generator places them accordingly. Precision beyond that rarely changes the decision the chart supports.',
      },
      {
        q: 'Can the axes be categorical?',
        a: "Quadrant charts assume continuous axes. For categorical comparisons, consider a matrix or scorecard table instead.",
      },
    ],
    examplePrompt:
      'A feature-prioritisation quadrant with effort on the x-axis and impact on the y-axis. Plot: search rewrite (high effort, high impact), dark mode (low effort, low impact), new pricing page (low effort, high impact), migration to new DB (high effort, low impact).',
    keywordSeeds: [
      'quadrant chart generator',
      '2x2 matrix maker',
      'ai quadrant chart',
      'mermaid quadrant chart',
      'prioritisation matrix',
      'impact effort chart',
    ],
  },
  {
    diagramType: 'requirementDiagram',
    displayName: 'requirement diagram',
    displayNamePlural: 'requirement diagrams',
    noun: 'requirement-diagram',
    whatIs: [
      'A requirement diagram models system requirements and the elements that satisfy, derive from, or refine them. It connects business or functional requirements to the design elements, tests, and risks associated with each — a traceability map in diagram form.',
      'Requirement diagrams are most common in regulated domains (medical, aerospace, automotive) and in large systems where "why does this component exist" needs a defensible answer. They pair naturally with verification workflows and audit trails.',
    ],
    whoUses: [
      'Systems engineers modelling requirements traceability',
      'Regulatory and compliance leads preparing for audits',
      'QA leads linking requirements to test coverage',
      'Product owners in safety-critical software teams',
      'Architects capturing non-functional requirements and constraints',
      'Technical writers producing spec documents',
      'Defence and aerospace teams following SysML-adjacent practices',
      'Students learning SysML and formal requirements engineering',
    ],
    whyAi: [
      'Requirement diagrams are valuable precisely where the cost of getting requirements wrong is high, but the tooling (Enterprise Architect, IBM Rhapsody) is heavy enough that teams often skip the diagram and hope the spec covers it.',
      'Generating a Mermaid requirementDiagram from a plain description — "requirement X is satisfied by component Y and verified by test Z" — makes traceability cheap enough to maintain. The diagram lives in git next to the spec; it stays in sync with real life.',
    ],
    howSteps: [
      'List your requirements, the design elements that satisfy them, and the verification methods that confirm them.',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the diagram; request tweaks like "derive REQ-02 from REQ-01" or "add a risk link to the payment module".',
      'Export as SVG, PNG, or Mermaid source to include in spec documents, audit packages, or design reviews.',
      'Save the diagram to your workspace to maintain traceability as requirements evolve.',
    ],
    faqs: [
      {
        q: 'What relationships are supported?',
        a: 'Mermaid requirementDiagram supports contains, copies, derives, satisfies, verifies, refines, and traces. Mention the relationship in plain English and the generator picks the right arrow.',
      },
      {
        q: 'Is this SysML-compliant?',
        a: "Mermaid requirementDiagram is SysML-inspired, not fully compliant. For a SysML-conformant diagram, use a dedicated SysML tool; for a readable traceability view in Markdown docs, Mermaid is the right level.",
      },
      {
        q: 'Can I categorise requirements (functional, performance, etc.)?',
        a: 'Yes — requirement elements accept a type field. Mention the type in the prompt ("a functional requirement for login...") and it appears in the rendered box.',
      },
    ],
    examplePrompt:
      'A functional requirement REQ-01 says the system must authenticate users. It is satisfied by the AuthService component and verified by the E2E login test. REQ-02 derives from REQ-01 and requires password reset, satisfied by the PasswordResetFlow module.',
    keywordSeeds: [
      'requirement diagram generator',
      'requirements traceability tool',
      'ai requirement diagram',
      'mermaid requirement diagram',
      'sysml requirement diagram',
      'system requirements diagram',
    ],
  },
  {
    diagramType: 'gitgraph',
    displayName: 'Git graph',
    displayNamePlural: 'Git graphs',
    noun: 'git-graph',
    whatIs: [
      'A Git graph visualises a repository\'s commit history — branches, merges, tags, cherry-picks — as a graph of commits connected by parent links. Each lane is a branch; each node is a commit. It\'s the mental model you build when running `git log --graph`, rendered properly.',
      'Git graphs are invaluable when explaining branching strategies, onboarding a new engineer to a repo\'s conventions, or showing a tricky merge/rebase scenario in a design doc or blog post. They turn "let me walk you through this" into "here, see for yourself".',
    ],
    whoUses: [
      'Tech leads documenting branching strategies (Gitflow, trunk-based, release branches)',
      'Engineering managers onboarding new hires to repo conventions',
      'Technical bloggers explaining Git concepts to a general audience',
      'Open-source maintainers documenting contribution workflows',
      'Trainers teaching version control in bootcamps and courses',
      'DevOps engineers illustrating release and hotfix processes',
      'Students learning Git for the first time',
      'Authors writing Git documentation and style guides',
    ],
    whyAi: [
      'Mermaid gitGraph syntax is compact but unintuitive — commits, branches, checkouts, and merges each have their own keywords. Writing a realistic-looking branch-and-merge scenario by hand is a fiddly exercise that distracts from what you\'re actually explaining.',
      'Describing the scenario in plain English ("main has three commits, then we branch off feature, add two commits, and merge back") and letting AI emit the gitGraph source puts the focus back on the concept. Perfect for blog posts, onboarding docs, and internal training.',
    ],
    howSteps: [
      'Describe the scenario — which branches exist, when they diverged, and how they merged back.',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the graph; request changes like "add a hotfix branch after the release tag" or "show a cherry-pick from feature to main".',
      'Export as SVG, PNG, or Mermaid source to drop into your blog post, onboarding doc, or design review.',
      'Save it so you have a library of common scenarios to pull from for future training or docs.',
    ],
    faqs: [
      {
        q: 'Does it support tags and cherry-picks?',
        a: 'Yes — both are expressible in Mermaid gitGraph. Mention them in the prompt (e.g. "tag v1.0 on main", "cherry-pick fix-abc into release") and the generator emits them.',
      },
      {
        q: 'Can I show a complex Gitflow scenario?',
        a: 'Yes. Describe the scenario in order — develop, feature branches, release branches, hotfixes — and the generator produces a faithful Mermaid rendering.',
      },
      {
        q: 'Is this the same as `git log --graph`?',
        a: "Similar idea, different rendering. `git log --graph` shows the real history of a repo; this tool produces a styled, shareable version of a hypothetical or actual history for teaching and documentation.",
      },
    ],
    examplePrompt:
      'Main branch has 3 commits. A feature branch is created after the second commit with 2 commits on it, then merged back into main. A v1.0 tag is added on main after the merge. A hotfix branch is created from the tag with one commit, merged back to main.',
    keywordSeeds: [
      'git graph generator',
      'git branch diagram',
      'ai git diagram',
      'mermaid gitgraph',
      'git history visualizer',
      'gitflow diagram',
    ],
  },
  {
    diagramType: 'mindmaps',
    displayName: 'mind map',
    displayNamePlural: 'mind maps',
    noun: 'mind-map',
    whatIs: [
      'A mind map branches outward from a central idea into progressively more specific sub-ideas, letting you capture associations the way you actually think about them. Each branch is a freeform node of text; depth reflects detail.',
      'Mind maps earn their keep during brainstorming, research note-taking, and study. They deliberately trade structure for flexibility — the point is to see the shape of an idea space quickly, then re-shape it as your understanding evolves.',
    ],
    whoUses: [
      'Founders and product teams brainstorming feature ideas',
      'Researchers mapping a literature review or problem space',
      'Writers outlining essays, talks, and long-form articles',
      'Students studying and revising complex topics',
      'Strategy consultants structuring discovery interviews',
      'UX designers synthesising user research findings',
      'Teachers and trainers organising lesson plans',
      'Anyone doing a personal retrospective or decision journal',
    ],
    whyAi: [
      'Mind maps start fast on paper and slow down as they get unwieldy — rearranging branches in a drawing tool is annoying, and once it\'s in a PDF it\'s effectively frozen.',
      'Generating a Mermaid mindmap from a plain description keeps the map fluid and version-controllable. Regenerate when the structure clicks better, export when it\'s time to share, and keep the source in git alongside notes so the map doesn\'t die on a dry-erase board.',
    ],
    howSteps: [
      'Describe the central topic and the main branches, with sub-branches for supporting ideas.',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the mind map; request changes like "promote X to a top-level branch" or "merge Y and Z".',
      'Export as SVG, PNG, or Mermaid source for your research notes, all-hands deck, or planning doc.',
      'Save it so you can iterate on structure in subsequent sessions.',
    ],
    faqs: [
      {
        q: 'How deep can a mind map go?',
        a: "There\'s no hard limit, but 3-4 levels deep is usually the sweet spot for readability. Past that, consider splitting into two linked mind maps.",
      },
      {
        q: 'Can I add icons or shapes to nodes?',
        a: "Mermaid mind maps support several node shapes (cloud, hexagon, circle, etc.). Mention the shape in the prompt (e.g. 'represent risks as clouds') and the generator picks the right syntax.",
      },
      {
        q: 'Does the order of branches matter?',
        a: "Mermaid lays out branches based on description order. If you care about clockwise ordering, list branches in the sequence you want them rendered.",
      },
    ],
    examplePrompt:
      'A mind map for launching a new SaaS product with a central node "Launch". Main branches: Product (feature set, pricing, onboarding), Marketing (content, ads, community), GTM (sales process, partnerships), Ops (support, monitoring, billing).',
    keywordSeeds: [
      'mind map generator',
      'ai mind map',
      'mermaid mindmap',
      'online mind map tool',
      'brainstorming diagram',
      'mind mapping software',
    ],
  },
  {
    diagramType: 'timeline',
    displayName: 'timeline',
    displayNamePlural: 'timelines',
    noun: 'timeline',
    whatIs: [
      'A timeline arranges events in chronological order along a single axis, grouping them by period so you can see how a story, project, or history unfolded. Each event gets a date or period and a short description.',
      'Timelines are the ideal visual when sequence matters more than duration. Product roadmaps, company histories, incident retrospectives, project post-mortems, and historical overviews all gain a lot from a clean timeline.',
    ],
    whoUses: [
      'Product teams publishing release histories and roadmaps',
      'Founders pitching company milestones and progress',
      'SRE teams walking through incident post-mortems',
      'Historians and educators teaching chronological narratives',
      'Marketing teams presenting campaign or launch histories',
      'Project managers reporting phase-by-phase progress',
      'Researchers documenting timelines of events or experiments',
      'Students preparing study material for history and science',
    ],
    whyAi: [
      'Timelines are deceptively simple: a horizontal axis and some events. But formatting one cleanly in presentation tools eats a surprising amount of time, and the output is hard to update.',
      'Generating a Mermaid timeline from a plain bullet list of dates and events means you can replan or append new events with one re-run. The timeline lives in Markdown, renders on GitHub, and updates as the story does.',
    ],
    howSteps: [
      'List your events with their dates or periods, grouped into sections if useful (e.g. "Q1", "Q2", "Q3").',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the timeline; request changes like "add a launch event in Q3" or "group the first three events into a Founding section".',
      'Export as SVG, PNG, or Mermaid source to drop into your roadmap, retrospective, or all-hands.',
      'Save it to your workspace so you can extend it as new milestones happen.',
    ],
    faqs: [
      {
        q: 'Can I group events into phases or periods?',
        a: 'Yes — Mermaid timeline supports section headers. Mention the grouping in your prompt ("phase 1: research, phase 2: build") and sections render with their own labels.',
      },
      {
        q: 'Can a single date have multiple events?',
        a: 'Yes. List them on the same date in your description and the generator stacks them on that point.',
      },
      {
        q: 'Can I include descriptions or links with events?',
        a: "Short descriptions yes. Mermaid doesn\'t render hyperlinks in timelines, but the source is portable Markdown and you can add links around the embedded diagram.",
      },
    ],
    examplePrompt:
      'A company milestones timeline. 2022: founded, raised seed. 2023: first ten customers, product v1 launched. 2024: Series A, team grew to 20. 2025: international expansion, product v2.',
    keywordSeeds: [
      'timeline generator',
      'timeline maker',
      'ai timeline',
      'mermaid timeline',
      'online timeline tool',
      'chronology diagram',
    ],
  },
  {
    diagramType: 'zenuml',
    displayName: 'ZenUML diagram',
    displayNamePlural: 'ZenUML diagrams',
    noun: 'zenuml-diagram',
    whatIs: [
      'ZenUML is a code-first sequence-diagram syntax designed to read like the code it describes. Instead of arrows-first notation, you write method calls the way a developer would write them, and the diagram falls out.',
      'ZenUML shines when you want a sequence diagram that mirrors real call stacks — async patterns, nested calls, returns with values. It\'s the notation of choice when UML-style sequence diagrams feel too disconnected from implementation.',
    ],
    whoUses: [
      'Backend engineers documenting async and concurrent call patterns',
      'Architects explaining service-to-service interactions in code-like notation',
      'Developer advocates writing technical blog posts',
      'Tech leads reviewing and critiquing proposed designs',
      'SREs walking through incident call paths',
      'Open-source maintainers documenting internal APIs',
      'Engineering educators teaching distributed systems',
      'Consultants producing technical design deliverables',
    ],
    whyAi: [
      'ZenUML\'s syntax is readable but opinionated — once you know it, writing diagrams is fast; before that, there\'s a learning curve. Most teams give up and fall back to prose.',
      'Describing the call flow in plain English and generating ZenUML source lets you benefit from the notation\'s readability without investing time in the syntax. The output is clean code-style sequence diagrams, generated on demand.',
    ],
    howSteps: [
      'Describe the interaction — the caller, the callees, what methods they invoke, and any return values.',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the diagram; request tweaks like "make the payment call async" or "add an error return on line 3".',
      'Export as SVG, PNG, or ZenUML source for your design doc, PR, or internal wiki.',
      'Save the diagram so your system\'s call patterns are documented where future engineers will actually find them.',
    ],
    faqs: [
      {
        q: 'How is ZenUML different from Mermaid sequence diagrams?',
        a: 'ZenUML reads like code; Mermaid sequence diagrams read like traditional UML. ZenUML is better for developer-audience docs; Mermaid is better for mixed-audience or UML-convention contexts.',
      },
      {
        q: 'Does it support async and parallel calls?',
        a: 'Yes — ZenUML has first-class syntax for async, parallel, and alt/opt blocks. Mention them in plain English and the generator emits the right constructs.',
      },
      {
        q: 'Can I use it inside Markdown?',
        a: "Yes. Mermaid supports ZenUML-style diagrams via the `zenuml` code-block language; the output from this tool drops into GitHub, GitLab, and Notion Markdown without further processing.",
      },
    ],
    examplePrompt:
      'A checkout handler calls the inventory service to reserve items, then calls the payment service asynchronously to charge the card. On payment success it calls the order service to persist the order; on failure it calls inventory to release the reservation.',
    keywordSeeds: [
      'zenuml generator',
      'zenuml diagram maker',
      'ai zenuml diagram',
      'code-style sequence diagram',
      'zenuml online',
      'mermaid zenuml',
    ],
  },
  {
    diagramType: 'sankey',
    displayName: 'Sankey diagram',
    displayNamePlural: 'Sankey diagrams',
    noun: 'sankey-diagram',
    whatIs: [
      'A Sankey diagram visualises flows of quantity between nodes. Flow width is proportional to the amount moved, so you can see at a glance where the big pipes are and which paths account for most of a total.',
      'Sankey diagrams are the right tool for energy flows, budget allocations, funnel analyses, traffic-source attributions, and any scenario where you want to follow "where did all the X go?" across multiple stages.',
    ],
    whoUses: [
      'Analysts visualising conversion funnels and attribution',
      'Growth engineers tracing user flow across activation stages',
      'Finance teams showing budget allocation across departments',
      'Energy and sustainability analysts modelling energy flows',
      'Product managers visualising feature-usage and churn paths',
      'Operations teams tracing materials and process flow',
      'Consultants presenting value-chain or supply-chain analyses',
      'Researchers reporting multi-stage data aggregations',
    ],
    whyAi: [
      'Sankey diagrams are powerful and a pain to author. The nodes, the links, the exact flow values — producing one in D3.js or Plotly takes non-trivial code, and spreadsheet tools rarely support them well.',
      'Generating a Mermaid Sankey from a plain description ("500 visits total, 300 to home, 150 to pricing...") collapses the overhead to one paragraph of prose. Great for monthly reports, blog posts, and dashboards that need a one-off visual.',
    ],
    howSteps: [
      'Describe the flows — source node, target node, and the quantity flowing between them — for each link.',
      'Paste the description into the {toolName} prompt box and click Generate.',
      'Review the rendered diagram; request tweaks like "split Checkout into Success and Failure" or "roll up the small flows into Other".',
      'Export as SVG, PNG, or Mermaid source for your funnel report, attribution deck, or budget memo.',
      'Save it so updating with next month\'s numbers is a five-second regenerate.',
    ],
    faqs: [
      {
        q: 'How many nodes can a Sankey handle?',
        a: 'Mermaid handles a few dozen nodes gracefully. Past that, consider aggregating long-tail nodes into an "Other" bucket — readability drops fast beyond ~20 distinct nodes.',
      },
      {
        q: 'Do the flows need to balance?',
        a: 'Not strictly — you can show loss, drop-off, or unallocated flow by having outflows smaller than inflows at a node. Mermaid renders the imbalance visibly, which is usually what you want.',
      },
      {
        q: 'Can I colour flows by category?',
        a: 'Mermaid Sankey uses the theme palette; per-flow colour customisation requires post-export SVG editing. For rich per-flow styling, consider a D3.js implementation.',
      },
    ],
    examplePrompt:
      'A conversion funnel for last month. 10,000 visits: 6,000 bounce, 4,000 continue. Of those 4,000: 2,500 view pricing, 1,500 skip. Of the 2,500 pricing viewers: 400 start checkout, 2,100 drop. Of 400 checkouts: 300 complete, 100 abandon.',
    keywordSeeds: [
      'sankey diagram generator',
      'sankey diagram maker',
      'ai sankey diagram',
      'mermaid sankey',
      'flow diagram tool',
      'funnel visualization',
    ],
  },
]

const metaBySlug = new Map<string, DiagramMeta>(
  DIAGRAM_META.map((m) => [m.diagramType as string, m]),
)

export function getDiagramMeta(diagramType: string): DiagramMeta | undefined {
  return metaBySlug.get(diagramType)
}
