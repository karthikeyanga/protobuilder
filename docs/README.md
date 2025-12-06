## ProtoBuilder Documentation

Welcome to the ProtoBuilder docs. Start here to explore product requirements, architecture, and config schemas.

- Product
  - [product/requirements.md](product/requirements.md)
- Architecture
  - [architecture/architecture.md](architecture/architecture.md)
  - [architecture/ports.md](architecture/ports.md)
  - [architecture/data-contracts.md](architecture/data-contracts.md)
- Schemas
  - [schemas/app.md](schemas/app.md)
  - [schemas/entity.md](schemas/entity.md)
  - [schemas/page.md](schemas/page.md)
  - [schemas/widget.md](schemas/widget.md)
  - [schemas/connector.md](schemas/connector.md)
  - [schemas/workflow.md](schemas/workflow.md)
  - [schemas/theme.md](schemas/theme.md)
  - [schemas/permissions.md](schemas/permissions.md)
- Frontend workspace: see [../frontend/README.md](../frontend/README.md)
- Backend scaffold: see [../backend/README.md](../backend/README.md)

Notes:
- Backend supports Spring Boot 3 and Quarkus 3 (pom-only profile switch).
- v1 storage baseline: Postgres (incl. pgvector) + in-memory cache; adapters pluggable later.


