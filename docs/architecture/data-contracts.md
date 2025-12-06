## Data Contracts (DTOs) for Core Ports

Concise type outlines; field names align with schemas. Exact validation and enums will be finalized during implementation.

See also:
- Ports: [ports.md](ports.md)
- Config schemas: [../schemas/](../schemas/)
- Product requirements: [../product/requirements.md](../product/requirements.md)

### Common
- Ids & Scope
  - `OrgId`, `AppId`, `Env`, `Scope = { orgId, appId, env }`
- Paging
  - `PageRequest { page: int, size: int }`
  - `Page<T> { items: T[], total: long }`

### Metastore
- App
  - `AppConfig { appId: string, version: string, entities: string[], connectors: string[], pages: string[], widgets: string[], workflows: string[], themeRef?: string, permissionsRef?: string, exposure?: { routes: { path: string, auth: 'public' | 'protected' }[] }, environmentOverrides?: Record<string, any> }`
  - `AppSummary { appId: string, latestVersion: string, updatedAt: Instant }`
  - `AppQuery { text?: string, tags?: string[], updatedAfter?: Instant }`
- Entity
  - `EntityConfig { name: string, version: string, fields: EntityField[] }`
  - `EntityField { name: string, kind: 'primitive' | 'object' | 'array' | 'reference', type?: 'string' | 'number' | 'boolean' | 'date' | 'datetime', ref?: string, cardinality?: 'one' | 'list', constraints?: Constraints, fields?: EntityField[], items?: EntityField, display?: Display, derived?: { expression: string } }`
  - `Constraints { required?: boolean, min?: number, max?: number, minLength?: int, maxLength?: int, pattern?: string, enum?: string[], unique?: boolean, default?: any }`
  - `Display { label?: string, help?: string, mask?: string }`
- Page
  - `PageConfig { name: string, route: string, layout: string, components: PageComponent[] }`
  - `PageComponent { id: string, widgetRef: string, props?: Record<string, any>, bindings?: Record<string, string>, events?: Record<string, ActionSpec[]>, access?: { roles?: string[] } }`
  - `ActionSpec { type: string, params?: Record<string, any> }`
- Widget
  - `WidgetConfig { name: string, version: string, inputs?: Record<string, string>, outputs?: Record<string, string>, state?: Record<string, any>, composition?: { control: string, props?: Record<string, any> }[], actions?: string[] }`
- Connector
  - `ConnectorConfig { id: string, kind: 'REST' | 'GraphQL' | 'DB' | 'Storage', authProfileRef?: string, request?: { method?: string, url?: string, headers?: Record<string,string>, query?: Record<string, any>, body?: any }, response?: { transform?: string, map?: Record<string, any> }, retry?: { maxAttempts?: int, backoffMs?: int }, cache?: { ttlMs?: int, key?: string }, mock?: Record<string, any>, policy?: Record<string, any> }`
- Workflow
  - `WorkflowConfig { id: string, version: string, bpmnRef: string, signals?: string[], variables?: Record<string, any>, userTasks?: { taskId: string, pageRef: string, payloadSchema?: Record<string, any> }[] }`
- Theme & Permissions
  - `ThemeConfig { name: string, version: string, tokens: Tokens, modes?: Record<string, Tokens> }`
  - `Tokens { color?: Record<string, string>, typography?: Record<string, any>, spacing?: Record<string, any>, radius?: Record<string, any>, shadows?: Record<string, any>, motion?: Record<string, any> }`
  - `PermissionsConfig { roles: string[], grants: { role: string, resource: string, action: string, condition?: string }[] }`

### Releases & Diffs
- `ReleaseRequest { notes?: string, labels?: string[] }`
- `Release { releaseId: string, appId: string, createdAt: Instant, createdBy: string, labels?: string[], immutableConfigDigest: string }`
- `ConfigRef { kind: 'app' | 'entity' | 'page' | 'widget' | 'connector' | 'workflow' | 'theme' | 'permissions', id: string, version: string }`
- `DiffResult { changes: DiffChange[] }`
- `DiffChange { path: string, op: 'add' | 'remove' | 'replace' | 'move', from?: string, value?: any }`
- `OutboxEvent { id: string, type: string, payload: any, createdAt: Instant, lockedUntil?: Instant }`

### Vector (RAG)
- `VectorSpec { dim: int, metric: 'cosine' | 'ip' | 'l2', index?: { type: 'ivfflat' | 'hnsw', params?: Record<string, any> } }`
- `VectorItem { id: string, vector: float[], text?: string, metadata?: Record<string, any> }`
- `QueryResult { items: { id: string, score: double, text?: string, metadata?: Record<string, any> }[] }`

### Assets
- `StoredObjectId { value: string }`
- `AssetStream { stream: InputStream, length: long, contentType: string, etag?: string }`
- `SignedUrl { url: string, expiresAt: Instant }`

### Secrets
- `SecretRef { orgId: string, appId: string, env: string, name: string }`
- `SecretValue { bytes: byte[], createdAt: Instant }`
- `SecretHandle { ref: SecretRef, // opaque; used only server-side }`

### Audit
- `AuditEvent { id: string, actor: string, appId?: string, type: string, at: Instant, data: any }`
- `AuditQuery { appId?: string, actor?: string, types?: string[], from?: Instant, to?: Instant }`

### Workflow Engine
- `DeploymentId { value: string }`
- `InstanceId { value: string }`
- `WorkflowInstance { id: InstanceId, processId: string, state: 'active' | 'completed' | 'error' | 'aborted', startedAt: Instant, updatedAt: Instant, variables?: Record<string, any> }`
- `UserTask { id: string, name: string, processId: string, instanceId: InstanceId, state: 'ready' | 'claimed' | 'completed', assignee?: string, inputs?: Record<string, any> }`
- `InstancesQuery { processId?: string, state?: string[], from?: Instant, to?: Instant }`
- `TasksQuery { assignee?: string, processId?: string, state?: string[], from?: Instant, to?: Instant }`

### Workbench Tasks
- `ExternalTask { id: string, title: string, state: string, assignee?: string, metadata?: Record<string, any> }`
- `TaskFilter { assignee?: string, queues?: string[], states?: string[] }`
- `TaskTransition { name: string } // e.g., 'complete', 'claim', 'release'`

### Connector Execution
- `ExecutionContext { scope: Scope, user?: { id: string, roles: string[] }, traceId?: string }`
- `ConnectorResponse { ok: boolean, status: int, headers?: Record<string, string>, body?: any, error?: { code: string, message: string } }`
- `TestResult { ok: boolean, diagnostics?: any }`


