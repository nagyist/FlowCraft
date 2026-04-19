/**
 * Mermaid source for the 3 example SVGs shown in ToolExampleGallery.
 *
 * Keyed by the FlowCraft internal diagram_type value (matches
 * DIAGRAM_META.diagramType). All variants of the same diagram_type share
 * these 3 example diagrams — they're visual illustrations of what the
 * diagram looks like, not variant-specific content.
 *
 * Rendered to SVG by scripts/generate-tool-svgs.ts via @mermaid-js/mermaid-cli.
 */

export const DIAGRAM_EXAMPLES: Record<string, [string, string, string]> = {
  flowchart: [
    `flowchart TD
  A([User submits form]) --> B{Valid?}
  B -->|No| C[Show errors]
  C --> A
  B -->|Yes| D[Save to DB]
  D --> E[Send confirmation email]
  E --> F([Done])`,
    `flowchart LR
  Start([Ticket created]) --> Triage{Priority}
  Triage -->|P0| Page[Page on-call]
  Triage -->|P1| Queue[Add to sprint]
  Triage -->|P2| Back[Backlog]
  Page --> Resolve[Resolve]
  Queue --> Resolve
  Back --> Resolve
  Resolve --> Close([Close ticket])`,
    `flowchart TD
  A[Read input] --> B[Parse]
  B --> C{Cache hit?}
  C -->|Yes| D[Return cached]
  C -->|No| E[Compute result]
  E --> F[Store in cache]
  F --> G[Return result]
  D --> H([End])
  G --> H`,
  ],

  classDiagram: [
    `classDiagram
  class Animal {
    +String name
    +int age
    +speak()
  }
  class Dog {
    +String breed
    +fetch()
  }
  class Cat {
    +boolean indoor
    +purr()
  }
  Animal <|-- Dog
  Animal <|-- Cat`,
    `classDiagram
  class Order {
    +String id
    +Date placedAt
    +total() double
  }
  class LineItem {
    +String sku
    +int qty
    +double price
  }
  class Customer {
    +String email
    +String name
  }
  Order "1" *-- "many" LineItem
  Customer "1" --> "many" Order`,
    `classDiagram
  class Shape {
    <<interface>>
    +area() double
  }
  class Circle {
    +double radius
    +area() double
  }
  class Rectangle {
    +double width
    +double height
    +area() double
  }
  Shape <|.. Circle
  Shape <|.. Rectangle`,
  ],

  sequenceDiagram: [
    `sequenceDiagram
  participant U as User
  participant A as API
  participant DB as Database
  U->>A: POST /login
  A->>DB: find user by email
  DB-->>A: user record
  A->>A: verify password
  A-->>U: 200 OK + token`,
    `sequenceDiagram
  participant C as Client
  participant G as Gateway
  participant S as Service
  participant Q as Queue
  C->>G: POST /order
  G->>S: create order
  S->>Q: publish OrderCreated
  S-->>G: 201 Created
  G-->>C: order id`,
    `sequenceDiagram
  participant U as User
  participant A as App
  participant P as PaymentProvider
  U->>A: Click pay
  A->>P: charge card
  alt success
    P-->>A: payment_id
    A-->>U: receipt
  else failure
    P-->>A: error
    A-->>U: please retry
  end`,
  ],

  stateDiagram: [
    `stateDiagram-v2
  [*] --> Draft
  Draft --> Pending: submit
  Pending --> Approved: approve
  Pending --> Draft: request changes
  Approved --> Published: publish
  Published --> [*]`,
    `stateDiagram-v2
  [*] --> Idle
  Idle --> Heating: start
  Heating --> Idle: target reached
  Heating --> Error: sensor fail
  Error --> Idle: reset
  Error --> [*]: shutdown`,
    `stateDiagram-v2
  [*] --> Pending
  Pending --> Paid: payment_received
  Pending --> Cancelled: user_cancels
  Paid --> Shipped: ship
  Shipped --> Delivered: deliver
  Delivered --> [*]
  Cancelled --> [*]`,
  ],

  entityRelationshipDiagram: [
    `erDiagram
  USER ||--o{ POST : writes
  USER {
    int id PK
    string email
    datetime created_at
  }
  POST ||--o{ COMMENT : has
  POST {
    int id PK
    int user_id FK
    string title
    text body
  }
  COMMENT {
    int id PK
    int post_id FK
    int user_id FK
    text body
  }`,
    `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : "ordered as"
  CUSTOMER {
    int id PK
    string name
    string email
  }
  ORDER {
    int id PK
    int customer_id FK
    datetime placed_at
    decimal total
  }
  PRODUCT {
    int id PK
    string name
    decimal price
  }
  LINE_ITEM {
    int id PK
    int order_id FK
    int product_id FK
    int quantity
  }`,
    `erDiagram
  AUTHOR ||--o{ BOOK : writes
  BOOK }o--o{ TAG : "tagged as"
  BOOK {
    int id PK
    int author_id FK
    string title
    int year
  }
  AUTHOR {
    int id PK
    string name
  }
  TAG {
    int id PK
    string name
  }`,
  ],

  userJourney: [
    `journey
  title New user onboarding
  section Discover
    Sees blog post: 4: User
    Clicks CTA: 3: User
  section Sign up
    Creates account: 3: User
    Verifies email: 2: User
  section First use
    Completes tutorial: 4: User
    Creates first diagram: 5: User
  section Share
    Invites teammate: 5: User, Teammate`,
    `journey
  title Support ticket journey
  section Report
    Hits bug: 1: User
    Opens ticket: 2: User
  section Wait
    Waits for reply: 2: User
  section Resolve
    Gets fix: 4: User
    Confirms resolution: 5: User, Support`,
    `journey
  title Checkout flow
  section Browse
    Lands on homepage: 4: Shopper
    Searches products: 4: Shopper
  section Add
    Adds to cart: 5: Shopper
  section Pay
    Enters card: 3: Shopper
    Pays: 4: Shopper
  section Receive
    Gets confirmation: 5: Shopper`,
  ],

  gantt: [
    `gantt
  title Product launch plan
  dateFormat  YYYY-MM-DD
  section Research
    Interviews        :a1, 2026-05-01, 14d
    Synthesis         :after a1, 7d
  section Design
    Wireframes        :b1, 2026-05-15, 10d
    Visual design     :after b1, 14d
  section Build
    Frontend          :c1, 2026-06-01, 21d
    Backend           :c2, 2026-06-01, 21d
  section Launch
    Beta              :milestone, 2026-07-01, 0d
    GA                :milestone, 2026-07-15, 0d`,
    `gantt
  title Q2 Engineering Roadmap
  dateFormat  YYYY-MM-DD
  section Platform
    Migrate auth       :a1, 2026-04-01, 21d
    New billing        :a2, after a1, 30d
  section Product
    Dashboard v2       :b1, 2026-04-15, 35d
    Mobile polish      :b2, after b1, 14d
  section Ops
    CI overhaul        :c1, 2026-05-01, 10d`,
    `gantt
  title Thesis writing plan
  dateFormat  YYYY-MM-DD
  section Research
    Literature review    :a1, 2026-01-10, 30d
    Data collection      :a2, after a1, 45d
  section Writing
    Chapters 1-3         :b1, after a2, 30d
    Chapters 4-5         :b2, after b1, 25d
  section Review
    Advisor review       :c1, after b2, 14d
    Revisions            :c2, after c1, 21d
    Defence              :milestone, after c2, 0d`,
  ],

  pieChart: [
    `pie showData
  title Traffic sources
  "Organic search" : 40
  "Direct" : 25
  "Referral" : 15
  "Social" : 12
  "Paid" : 8`,
    `pie showData
  title Q1 revenue mix
  "Enterprise" : 55
  "Mid-market" : 28
  "SMB" : 12
  "Self-serve" : 5`,
    `pie
  title Language breakdown in repo
  "TypeScript" : 62
  "Python" : 18
  "Shell" : 8
  "CSS" : 7
  "HTML" : 5`,
  ],

  quadrantChart: [
    `quadrantChart
  title Feature prioritisation
  x-axis Low effort --> High effort
  y-axis Low impact --> High impact
  quadrant-1 Do first
  quadrant-2 Plan
  quadrant-3 Reconsider
  quadrant-4 Delegate
  Search rewrite: [0.85, 0.9]
  Dark mode: [0.3, 0.4]
  New pricing page: [0.3, 0.85]
  DB migration: [0.9, 0.3]
  Docs overhaul: [0.5, 0.6]`,
    `quadrantChart
  title Competitive landscape
  x-axis Low price --> High price
  y-axis Basic features --> Advanced features
  quadrant-1 Premium
  quadrant-2 Luxury
  quadrant-3 Budget
  quadrant-4 Value
  Acme: [0.2, 0.25]
  Globex: [0.7, 0.8]
  Initech: [0.5, 0.5]
  Soylent: [0.9, 0.4]
  Umbrella: [0.35, 0.75]`,
    `quadrantChart
  title Risk assessment
  x-axis Low likelihood --> High likelihood
  y-axis Low impact --> High impact
  quadrant-1 Critical
  quadrant-2 Monitor
  quadrant-3 Accept
  quadrant-4 Mitigate
  Data breach: [0.2, 0.95]
  Outage: [0.6, 0.8]
  Vendor lock-in: [0.5, 0.55]
  Churn spike: [0.75, 0.7]
  Typo in docs: [0.8, 0.1]`,
  ],

  requirementDiagram: [
    `requirementDiagram
  requirement auth_req {
    id: 1
    text: The system must authenticate users.
    risk: high
    verifymethod: test
  }
  requirement reset_req {
    id: 2
    text: Users must be able to reset their password.
    risk: medium
    verifymethod: test
  }
  element auth_service {
    type: component
  }
  element login_test {
    type: test_case
  }
  auth_service - satisfies -> auth_req
  login_test - verifies -> auth_req
  reset_req - derives -> auth_req`,
    `requirementDiagram
  functionalRequirement upload {
    id: 1
    text: The app must support file upload up to 100 MB.
    risk: low
    verifymethod: test
  }
  performanceRequirement speed {
    id: 2
    text: Uploads must complete in under 30 seconds on average.
    risk: medium
    verifymethod: analysis
  }
  element uploader {
    type: component
  }
  element load_test {
    type: test_case
  }
  uploader - satisfies -> upload
  load_test - verifies -> speed
  speed - refines -> upload`,
    `requirementDiagram
  requirement avail_req {
    id: 1
    text: Service must be available 99.9% of the time.
    risk: high
    verifymethod: analysis
  }
  requirement backup_req {
    id: 2
    text: Backups must complete daily.
    risk: medium
    verifymethod: inspection
  }
  element monitoring {
    type: subsystem
  }
  element backup_job {
    type: cron
  }
  monitoring - verifies -> avail_req
  backup_job - satisfies -> backup_req
  backup_req - derives -> avail_req`,
  ],

  gitgraph: [
    `gitGraph
  commit id: "init"
  commit id: "add docs"
  branch feature/search
  checkout feature/search
  commit id: "scaffold"
  commit id: "wire up api"
  checkout main
  merge feature/search
  commit id: "release v1.0" tag: "v1.0"`,
    `gitGraph
  commit
  commit
  branch develop
  checkout develop
  commit
  branch feature/billing
  checkout feature/billing
  commit
  commit
  checkout develop
  merge feature/billing
  checkout main
  merge develop tag: "v2.0"`,
    `gitGraph
  commit
  commit tag: "v1.0"
  branch hotfix/security
  checkout hotfix/security
  commit id: "patch CVE"
  checkout main
  merge hotfix/security tag: "v1.0.1"
  branch feature/onboarding
  checkout feature/onboarding
  commit
  commit
  checkout main
  merge feature/onboarding`,
  ],

  mindmaps: [
    `mindmap
  root((Launch plan))
    Product
      Feature set
      Pricing
      Onboarding
    Marketing
      Content
      Ads
      Community
    GTM
      Sales process
      Partnerships
    Ops
      Support
      Monitoring
      Billing`,
    `mindmap
  root((Research))
    Read
      Papers
      Books
      Blogs
    Talk
      Users
      Experts
    Build
      Prototype
      Measure
    Write
      Outline
      Draft
      Edit`,
    `mindmap
  root((Debugging))
    Reproduce
      Local
      Staging
      Prod logs
    Isolate
      Bisect
      Minimal case
    Fix
      Root cause
      Regression test
    Share
      Post-mortem
      PR`,
  ],

  timeline: [
    `timeline
  title Company milestones
  section 2022
    Q1 : Founded : First hire
    Q3 : Seed round
  section 2023
    Q1 : First 10 customers
    Q3 : Product v1 launched
  section 2024
    Q2 : Series A
    Q4 : Team of 20
  section 2025
    Q1 : International expansion
    Q3 : Product v2`,
    `timeline
  title Web history
  1989 : Tim Berners-Lee proposes WWW
  1993 : Mosaic browser
  1995 : JavaScript : HTTP 1.0
  2004 : Firefox 1.0
  2008 : Chrome launches
  2015 : HTTP/2
  2022 : HTTP/3`,
    `timeline
  title Course schedule
  section Week 1-2
    Intro : Setup
    Basics : First exercise
  section Week 3-5
    Core concepts : Lab 1
    Deep dive : Lab 2
  section Week 6-8
    Project : Build
    Review : Feedback
  section Week 9
    Present : Final demo`,
  ],

  zenuml: [
    `sequenceDiagram
  participant C as Checkout
  participant I as Inventory
  participant P as Payment
  participant O as Order
  C->>I: reserve(items)
  I-->>C: reservationId
  C->>P: charge(amount)
  P-->>C: paymentId
  C->>O: create(reservationId, paymentId)
  O-->>C: orderId`,
    `sequenceDiagram
  participant API
  participant Cache
  participant DB
  API->>Cache: get(key)
  alt cache hit
    Cache-->>API: value
  else miss
    Cache-->>API: nil
    API->>DB: select
    DB-->>API: row
    API->>Cache: set(key, row)
  end`,
    `sequenceDiagram
  participant Client
  participant Auth
  participant Resource
  Client->>Auth: token = login(creds)
  Auth-->>Client: token
  Client->>Resource: GET /data (token)
  Resource->>Auth: verify(token)
  Auth-->>Resource: ok
  Resource-->>Client: data`,
  ],

  sankey: [
    `sankey-beta

Visits,Home,6000
Visits,Bounce,4000
Home,Pricing,2500
Home,Exit,3500
Pricing,Checkout,400
Pricing,Exit,2100
Checkout,Complete,300
Checkout,Abandon,100`,
    `sankey-beta

Revenue,Enterprise,550
Revenue,Mid-market,300
Revenue,SMB,150
Enterprise,Product,330
Enterprise,Support,220
Mid-market,Product,210
Mid-market,Support,90
SMB,Product,120
SMB,Support,30`,
    `sankey-beta

Inbox,Triage,1000
Triage,P0,50
Triage,P1,250
Triage,P2,500
Triage,Spam,200
P0,Resolved,50
P1,Resolved,220
P1,Backlog,30
P2,Backlog,500`,
  ],
}
