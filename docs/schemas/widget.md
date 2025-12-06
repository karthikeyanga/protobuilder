## Widget Schema (v1 skeleton)

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


