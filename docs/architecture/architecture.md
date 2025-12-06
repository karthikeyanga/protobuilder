## ProtoBuilder v1 - Architecture (Agreed Decisions)

### Technology baselines
- Java 21; Spring Boot 3.x (LTS); Quarkus 3.x (Java 21 compatible)
- Node.js LTS (20/22); React 18/19

### Dual-runtime flavors (pom-only switch)
- Default flavor: Quarkus (hosted defaults to Quarkus)
- Export: user chooses Spring or Quarkus by Maven profile only
- Parent pom profiles: `-Pquarkus` and `-Pspring` (mutually exclusive)
- Unified config format and identical behavior across flavors

### Backend runtime module boundaries
- `runtime-core`: pure Java core (config loader, auth/exposure, connector manager, policy/validation, theme resolver, event/state bus)
- `runtime-spring`: Spring adapter (DI/web/security/actuator) binding to core
- `runtime-quarkus`: Quarkus adapter (CDI/web/security/native-friendly) binding to core
- `workflow-kogito-core`: shared workflow abstractions
- `workflow-kogito-spring`: Spring Boot Kogito binder
- `workflow-kogito-quarkus`: Quarkus Kogito binder
- `plugin-spi`: Java SPI for actions/validators/connectors (framework-agnostic)
- `plugin-samples`: example plugins used in conformance tests
- `conformance-tests`: same suite executed under both profiles to ensure parity

### Workflow engine
- Kogito supported on both Spring Boot and Quarkus

### Workbench integration
- Treated as a black box; integration via API or bus, abstracted behind a Task Adapter

### Storage baseline (v1) and pluggability
- Default v1: Postgres for metastore (JSONB), audit log, and assets (bytea or chunked with size caps); pgvector in Postgres for embeddings; in-memory cache (per-instance)
- Pre-signed downloads: HMAC-tokened endpoints (no object-store pre-sign in v1)
- Adapters pluggable for later: Redis (cache/pubsub), S3/GCS (assets), MongoDB (metastore), OpenSearch/Atlas Vector (vector)
- Outbox pattern from metastore for events; idempotent consumers; eventual consistency where needed

### Export and hosting
- Hosted runs Quarkus by default (Spring flavor available)
- Export bundles include the same config plus a thin bootstrap pom where the profile selects Spring or Quarkus


