## Core Runtime Ports (v1)

Interfaces are framework-agnostic; adapters implement them for Spring/Quarkus and chosen stores.

See also:
- Data contracts (DTOs): [data-contracts.md](data-contracts.md)
- Config schemas: [../schemas/](../schemas/)
- Product requirements: [../product/requirements.md](../product/requirements.md)

### MetastorePort
Backs Apps, Entities, Pages, Widgets, Connectors, Workflows, Themes, Permissions; versions, releases, diffs.

```java
public interface MetastorePort {
  // Apps
  Optional<AppConfig> getApp(String appId, String version); // version may be "latest"
  void upsertApp(AppConfig app);
  List<AppSummary> listApps(AppQuery query);

  // Components by ref
  Optional<EntityConfig> getEntity(String name, String version);
  void upsertEntity(EntityConfig entity);
  Optional<PageConfig> getPage(String name, String version);
  void upsertPage(PageConfig page);
  Optional<WidgetConfig> getWidget(String name, String version);
  void upsertWidget(WidgetConfig widget);
  Optional<ConnectorConfig> getConnector(String id, String version);
  void upsertConnector(ConnectorConfig connector);
  Optional<WorkflowConfig> getWorkflow(String id, String version);
  void upsertWorkflow(WorkflowConfig workflow);
  Optional<ThemeConfig> getTheme(String name, String version);
  void upsertTheme(ThemeConfig theme);
  Optional<PermissionsConfig> getPermissions(String name, String version);
  void upsertPermissions(PermissionsConfig permissions);

  // Releases
  Release createRelease(String appId, ReleaseRequest req); // immutable
  Optional<Release> getRelease(String appId, String releaseId);
  List<Release> listReleases(String appId, ReleasesQuery query);

  // Diffs
  DiffResult diff(ConfigRef fromRef, ConfigRef toRef);

  // Outbox for domain events (app.updated, release.created, etc.)
  void appendOutboxEvent(OutboxEvent event);
  List<OutboxEvent> pollOutboxEvents(int max, Duration lockTtl);
  void ackOutboxEvent(String eventId);
}
```

### VectorStorePort
Used by the doc parser/RAG to store and query embeddings per org/app/collection.

```java
public interface VectorStorePort {
  void createCollection(String scope, String collection, VectorSpec spec);
  void dropCollection(String scope, String collection);

  void upsert(String scope, String collection, List<VectorItem> items);
  QueryResult query(String scope, String collection, float[] queryVector, int topK, Map<String, Object> filters);
  void deleteByIds(String scope, String collection, List<String> ids);
}
```

### AssetStorePort
Stores small assets in v1 (DB-backed), pluggable to S3/GCS later.

```java
public interface AssetStorePort {
  StoredObjectId put(String scope, String path, InputStream content, long length, String contentType);
  AssetStream get(String scope, String path); // stream + metadata
  void delete(String scope, String path);
  SignedUrl signDownload(String scope, String path, Duration ttl);
}
```

### SecretsPort
Scopes: org/app/env. v1 can use file/env; later Vault/KMS.

```java
public interface SecretsPort {
  void put(SecretRef ref, SecretValue value); // value never exposed to clients
  Optional<SecretHandle> get(SecretRef ref);  // handle usable server-side only
  void rotate(SecretRef ref, SecretValue newValue);
  List<SecretRef> list(String orgId, String appId, String env);
}
```

### CachePort
In-memory per instance for v1; later Redis adapter for shared cache/pubsub.

```java
public interface CachePort {
  <T> Optional<T> get(String key, Class<T> type);
  void set(String key, Object value, Duration ttl);
  void invalidate(String key);
  void publish(String channel, String message); // optional for invalidation fanout
  void subscribe(String channel, CacheListener listener);

  interface CacheListener { void onMessage(String channel, String message); }
}
```

### AuditLogPort
Immutable audit events for changes, approvals, deploys.

```java
public interface AuditLogPort {
  void append(AuditEvent event);
  List<AuditEvent> query(AuditQuery query, PageRequest page);
}
```

### WorkflowEnginePort
Abstraction over Kogito (Spring/Quarkus binders).

```java
public interface WorkflowEnginePort {
  DeploymentId deploy(WorkflowArtifact artifact); // BPMN/DMN bundle
  InstanceId startProcess(String processId, Map<String, Object> variables);
  void signal(InstanceId instanceId, String signalName, Object payload);
  Optional<WorkflowInstance> getInstance(InstanceId instanceId);
  List<WorkflowInstance> listInstances(InstancesQuery query);

  // User tasks (form schemas resolved by runtime via PageRef)
  List<UserTask> listUserTasks(TasksQuery query);
  void completeUserTask(String taskId, Map<String, Object> payload);
  void claimTask(String taskId, String userId);
  void releaseTask(String taskId);
}
```

### TaskAdapterPort (Workbench)
Workbench is a black box; integrate via API/bus.

```java
public interface TaskAdapterPort {
  List<ExternalTask> listTasks(TaskFilter filter);
  void transition(String taskId, TaskTransition transition, Map<String, Object> payload);
  Optional<String> deepLink(String taskId); // for cross-UI navigation
}
```

### ConnectorExecutorPort
Executes configured connectors with auth/secrets/policies.

```java
public interface ConnectorExecutorPort {
  ConnectorResponse execute(String connectorId, Map<String, Object> params, ExecutionContext ctx);
  TestResult test(ConnectorConfig configDraft, Map<String, Object> params, ExecutionContext ctx);
}
```

### Notes
- All methods are synchronous in this sketch; adapters may use async/reactive internally.
- IDs/scopes carry org/app/env to enforce isolation.
- Outbox pattern in `MetastorePort` enables DB-agnostic eventing.
*** End Patch

