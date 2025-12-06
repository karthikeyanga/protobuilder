## ProtoBuilder v1 Requirements Specification

### Overview
ProtoBuilder is a service that enables product and business users to model entities, design UIs, define and operate workflows, and assemble complete applications with AI assistance. The service hosts both the builder and the resulting applications, supports export for independent enhancement, and integrates with an external Workbench for task operations.

### Personas
- **End User**: Uses the deployed/exported application.
- **Internal Ops (Handlers, Underwriters, CRM, etc.)**: Operate via the external Workbench (auto-claims-ops-tool); our apps deep-link and render user task UIs, but assignment/queues live in Workbench.
- **Builder/Product**: Creates entities, UIs, connectors, workflows; leverages AI to scaffold and edit.
- **Developer**: Fine-tunes code, builds custom components/plugins; extends SDK.
- **Reviewer/Approver**: Reviews changes and approves releases/deployments.
- **Operator**: Manages environments, secrets, and deployments.

### Top-level Outcomes
- Build full applications inside the service and host them with environment management.
- Optionally export applications for independent enhancement while remaining compatible with the shared backend runtime library.
- Model domain entities (deeply nested, constrained) to drive UI and validation.
- Define workflows, deploy to an external engine, test, debug, and monitor.
- Provide an AI agent surface in both the builder and runtime (chat/doc parsing).

### Access & Exposure
- Each application/page/route can be exposed as:
  - **Public** (no auth) or **Protected** (SSO/JWT/API key/session).
  - Configurable per environment (dev/stage/prod).
- Options: rate limits, CORS, IP allowlist/denylist, signed links.

### Approvals & Governance
- Change types subject to review: Entities, UI, workflows, connectors, theme, permissions, releases.
- Lifecycle: **Draft → In Review → Approved → Released → Deployed**.
- Roles and rules:
  - Reviewer conducts spec/code/config review, can request changes.
  - Approver performs final sign-off; support for two-person rule per environment.
- Controls:
  - Required approvers per app/environment.
  - Diff view with impact analysis (affected pages, data contracts, workflows).
  - Policy checks (PII rules, connector policy, validation coverage) gate approvals.
  - Immutable releases; rollback supported with audit trail.

### Domain Modeling (Entities)
- Types: primitives (string, number, boolean, date/time), objects, arrays, maps; nested structures.
- Constraints: required, min/max (length/value), enums/allowedValues, regex, unique, defaults.
- Derived fields (expressions); validation rules (sync/async); display hints (labels, masks, help text).
- Versioning, migration notes, and reuse across apps.

### UI Builder
- Composition: pages, tabs, sections; responsive layout.
- Controls: text, textarea, select/combo, radio, checkbox, button, table, date/time, file upload, etc.
- Data binding: control value ↔ state/entity fields/connectors; validation with inline feedback.
- Events → actions mapping (onChange/onClick/onMount, etc.): call connector, set state, navigate, show modal, emit signal, start/advance workflow, run validator/transformer.
- Custom widgets: compose controls + logic; define inputs/outputs/events; versioned and reusable.
- Built-in widgets: autocomplete, multi-select, data table with server pagination/sorting.

### Connectors & Data
- REST/GraphQL first; storage (file upload/download with signed URLs); DB via backend proxy.
- Auth profiles: API key, OAuth2, JWT; secrets referenced by scope (org/app/environment).
- Request/response transforms, retries, caching, and mock responses; contract tests.

### Workflow
- Workflow design with BPMN/DMN import/edit; AI-assisted flow drafting from natural language.
- Deploy to external workflow engine (e.g., Kogito); manage versions; sandboxed testing and token tracing.
- Runtime visibility: instance list, current stage, history, variables, timers, errors; correlation with app events.
- User tasks:
  - Our service renders task UIs and executes state transitions.
  - Assignment/queues/ownership are handled by the external Workbench (`/Users/karthikeyan.g/Workspace/Auto/claims/auto-claims-ops-tool`); integrate via APIs.

### AI (Builder & Runtime)
- Builder AI agent:
  - Create/edit entities, UIs, connectors, workflows, and themes through chat.
  - Always show preview diff, explanation, and allow undo/redo.
- Runtime AI widgets:
  - Chat with configurable LLM providers.
  - Document parsing: ingest files/URLs, extract text, chunk, embed, retrieve with citations.
  - Actions: summarize, classify, extract entities into forms, validate data against schemas.
  - Data isolation per org/app; configurable tools (RAG, search, connectors).

### Theme System
- Tokens-first: colors, typography, spacing, radius, shadows, motion, density; dark mode and high-contrast.
- Scopes & overrides: Org → App → Environment → Page → Widget cascading.
- Builder experience: live preview (dark/light/contrast), breakpoint previews, token editor; accessibility guardrails (contrast checks).
- Runtime: CSS variables; theme switching without rebuild.
- Developer extensibility: exported React pages consume tokens; custom components adhere to token context; “fork-to-code” keeps base token hooks.

### Developer Extensibility
- Visual ↔ Code:
  - Round-trip mode: safe code edits keep visual editing intact.
  - Fork-to-code mode: advanced edits disable visual editing for that unit.
- Custom components/actions/validators:
  - Packaged with metadata (props, events, slots); versioned; sharable per org/global registry.
- SDK:
  - Typed APIs for state, events, connectors, workflows, AI tools.
  - Local dev with hot reload; publishing to org registry/marketplace.

### Hosting & Export (Backend Library, Config-Driven)
- Backend runtime is a shared library (part of the service) that powers all apps.
- Apps are defined by configuration only (no per-app backend generation).
- Hosted mode: the service loads app configs from the metastore and serves them.
- Export options:
  - Frontend: React pages matching the built UI.
  - Backend: thin Java bootstrap (or official runtime container image) that depends on the shared runtime library and loads the provided config bundle.
  - Optional plugin JARs for custom actions/validators/connectors (whitelisted per app).
- Config covers: entities, routes/endpoints exposure, connectors/auth, workflows/signals, permissions, AI tools, secrets references, environment overlays, themes.
- Acceptance for backend library:
  - Multiple apps run by the same runtime with only config swaps.
  - Exported apps run with the same library + config; no generated controllers needed.
  - Custom action via plugin JAR is isolated to the app that declares it.
  - Endpoint exposure (public/protected) enforced by config at runtime.

### Workbench Integration (Ops Users)
- Our app renders task UIs and transitions; assignment/queues remain in Workbench.
- Deep links between workflow instances and tasks.
- APIs/webhooks for task state synchronization; SSO preferred.

### Observability & Ops
- App/runtime logs with correlation IDs; action/connector timelines; OpenTelemetry-compatible tracing.
- Workflow instance timelines, transitions, and errors; per-environment dashboards.
- Audit of schema changes, releases, approvals, and deployments.

### Security & Governance
- Multi-tenant isolation; org/app/environment-scoped secrets.
- RBAC: builder, developer, reviewer, approver, operator, viewer.
- PII safeguards, encryption at rest, egress controls for AI/connector calls.
- Policy checks and approval gates on changes and deployments.

### Application Lifecycle
- **Draft → Preview → Test (mocks) → In Review → Approved → Released (immutable) → Deployed**.
- Rollback and compare releases; environment promotions; optional feature flags.

### Acceptance Scenarios (Representative)
- Vehicle Search: public page; enter registration → call connector → show details; optional workflow start.
- Vehicle Info Autocomplete: type → search API → pick option → populate entity fields.
- AI Doc Parser Chat: upload PDFs/URLs → parse/chunk/embed → chat with citations → extract to form fields.
- Workflow with Human Task: start flow in app → human task appears in Workbench → user completes in our app → flow continues → monitor instance state.
- Approvals: Builder edits autocomplete widget → Reviewer approves → Approver approves deploy → change goes live.

### Non-Functional Requirements (Initial Targets)
- Availability: 99.9% for hosted runtime (builder can be slightly lower initially).
- Performance: sub-200ms p95 for non-network UI actions; sub-1s p95 for connector calls (excluding upstream latency).
- Scale: 100 active apps/org; 1k concurrent users; 10k workflow instances/day.
- Compliance-ready: logs, audit, data isolation; configurable data retention.

### Out of Scope (Initial)
- Complex real-time collaborative editing (basic locking or last-writer-wins only).
- Full IAM/SSO provider built-in (can integrate with external IdP later).
- Non-web client generation (native/mobile).

### Open Points (For Later Decision)
- Preferred Java stack for the backend runtime library (e.g., Spring Boot vs Quarkus).
- Config format and layering (YAML/JSON + environment overlays).
- Plugin policy and sandboxing requirements.
- Vector store/provider options and AI gateways/data residency constraints.
- Re-import fidelity for exported projects (desirable, not mandatory in v1).


