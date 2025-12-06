## App Schema (v1 skeleton)

Back to docs: [../README.md](../README.md) • Related: Product [../product/requirements.md](../product/requirements.md), Architecture [../architecture/architecture.md](../architecture/architecture.md)

```json
{
  "type": "object",
  "required": ["appId", "version", "entities", "pages"],
  "properties": {
    "appId": { "type": "string" },
    "version": { "type": "string" },
    "entities": { "type": "array", "items": { "type": "string" } },
    "connectors": { "type": "array", "items": { "type": "string" } },
    "pages": { "type": "array", "items": { "type": "string" } },
    "widgets": { "type": "array", "items": { "type": "string" } },
    "workflows": { "type": "array", "items": { "type": "string" } },
    "themeRef": { "type": "string" },
    "permissionsRef": { "type": "string" },
    "exposure": {
      "type": "object",
      "properties": {
        "routes": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["path", "auth"],
            "properties": {
              "path": { "type": "string" },
              "auth": { "enum": ["public", "protected"] }
            }
          }
        }
      }
    },
    "environmentOverrides": { "type": "object", "additionalProperties": true }
  }
}
```


