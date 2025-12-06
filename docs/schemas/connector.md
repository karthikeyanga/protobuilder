## Connector Schema (v1 skeleton)

Back to docs: [../README.md](../README.md) • Related: Product [../product/requirements.md](../product/requirements.md), Architecture [../architecture/architecture.md](../architecture/architecture.md)

```json
{
  "type": "object",
  "required": ["id", "kind"],
  "properties": {
    "id": { "type": "string" },
    "kind": { "enum": ["REST", "GraphQL", "DB", "Storage"] },
    "authProfileRef": { "type": "string" },
    "request": {
      "type": "object",
      "properties": {
        "method": { "type": "string" },
        "url": { "type": "string" },
        "headers": { "type": "object", "additionalProperties": { "type": "string" } },
        "query": { "type": "object", "additionalProperties": true },
        "body": { "type": "object", "additionalProperties": true }
      }
    },
    "response": {
      "type": "object",
      "properties": {
        "transform": { "type": "string" },
        "map": { "type": "object", "additionalProperties": true }
      }
    },
    "retry": { "type": "object", "properties": { "maxAttempts": { "type": "integer" }, "backoffMs": { "type": "integer" } } },
    "cache": { "type": "object", "properties": { "ttlMs": { "type": "integer" }, "key": { "type": "string" } } },
    "mock": { "type": "object", "additionalProperties": true },
    "policy": { "type": "object", "additionalProperties": true }
  }
}
```


