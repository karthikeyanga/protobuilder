## Widget Schema (v1 skeleton)

Back to docs: [../README.md](../README.md) • Related: Product [../product/requirements.md](../product/requirements.md), Architecture [../architecture/architecture.md](../architecture/architecture.md)

```json
{
  "type": "object",
  "required": ["name", "version"],
  "properties": {
    "name": { "type": "string" },
    "version": { "type": "string" },
    "inputs": { "type": "object", "additionalProperties": { "type": "string" } },
    "outputs": { "type": "object", "additionalProperties": { "type": "string" } },
    "state": { "type": "object", "additionalProperties": true },
    "composition": {
      "type": "array",
      "items": { "type": "object", "properties": { "control": { "type": "string" }, "props": { "type": "object" } } }
    },
    "actions": { "type": "array", "items": { "type": "string" } }
  }
}
```


