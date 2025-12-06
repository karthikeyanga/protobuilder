## ProtoBuilder

Low-code service to model entities, build UIs, wire connectors, and orchestrate workflows with AI assistance. Hosts apps and supports export with a shared config-driven backend runtime (Spring Boot or Quarkus).

- Start with docs: [docs/README.md](docs/README.md)
- Product requirements: [docs/product/requirements.md](docs/product/requirements.md)
- Architecture: [docs/architecture/architecture.md](docs/architecture/architecture.md)
- Config schemas: [docs/schemas/](docs/schemas/)

Key decisions (v1):
- Java 21; Spring Boot 3 and Quarkus 3 (pom-only profile switch; default Quarkus)
- Postgres baseline (JSONB + pgvector), in-memory cache; adapters are pluggable
- Workbench integration treated as a black box (API or bus)


