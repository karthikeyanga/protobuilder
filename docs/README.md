## ProtoBuilder Documentation

Welcome to the ProtoBuilder docs. Start here to explore product requirements, architecture, and config schemas.

- Product
  - `product/requirements.md`
- Architecture
  - `architecture/architecture.md`
- Schemas
  - `schemas/app.md`
  - `schemas/entity.md`
  - `schemas/page.md`
  - `schemas/widget.md`
  - `schemas/connector.md`
  - `schemas/workflow.md`
  - `schemas/theme.md`
  - `schemas/permissions.md`

Notes:
- Backend supports Spring Boot 3 and Quarkus 3 (pom-only profile switch).
- v1 storage baseline: Postgres (incl. pgvector) + in-memory cache; adapters pluggable later.


