## Backend (skeleton)

### Prereqs
- Java 21
- Maven 3.9+

### Layout
- Parent: `backend/pom.xml` (packaging `pom`, profiles `-Pquarkus` / `-Pspring`)
- Modules:
  - `runtime-core` (framework-agnostic core)
  - `runtime-quarkus` (adapter)
  - `runtime-spring` (adapter)
  - `workflow-kogito-core`
  - `workflow-kogito-quarkus`
  - `workflow-kogito-spring`
  - `plugin-spi`
  - `plugin-samples`
  - `conformance-tests`

### Build (no code yet)
```bash
cd backend
mvn clean verify -Pquarkus   # Quarkus flavor
mvn clean verify -Pspring    # Spring Boot flavor
```

### Notes
- Only scaffolding poms are present; runtime code to be added later.
- Profiles are mutually exclusive; runtime modules for the other flavor are inactive per profile.

### Single-process (builder + runtime) hosting
- Build the frontends once: `cd ../frontend && npm install && npm run build -ws`
- Run the Spring runtime: `cd backend && mvn spring-boot:run -pl runtime-spring`
- The runtime will serve:
  - Builder SPA at `/builder/*`
  - Generated app/runtime SPA at `/app/*` and `/`
  - APIs at `/api/**`
- Static asset locations can be overridden via env vars:
  - `FRONTEND_BUILDER_DIST` (default `../frontend/apps/builder/dist`)
  - `FRONTEND_RUNTIME_DIST` (default `../frontend/apps/runtime/dist`)

