## Permissions Schema (v1 skeleton)

Back to docs: [../README.md](../README.md) • Related: Product [../product/requirements.md](../product/requirements.md), Architecture [../architecture/architecture.md](../architecture/architecture.md)

```json
{
  "type": "object",
  "required": ["roles", "grants"],
  "properties": {
    "roles": { "type": "array", "items": { "type": "string" } },
    "grants": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["role", "resource", "action"],
        "properties": {
          "role": { "type": "string" },
          "resource": { "type": "string" },
          "action": { "type": "string" },
          "condition": { "type": "string" }
        }
      }
    }
  }
}
```


