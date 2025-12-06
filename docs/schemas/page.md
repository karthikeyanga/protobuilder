## Page Schema (v1 skeleton)

```json
{
  "type": "object",
  "required": ["name", "route", "layout", "components"],
  "properties": {
    "name": { "type": "string" },
    "route": { "type": "string" },
    "layout": { "type": "string" },
    "components": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "widgetRef"],
        "properties": {
          "id": { "type": "string" },
          "widgetRef": { "type": "string" },
          "props": { "type": "object", "additionalProperties": true },
          "bindings": { "type": "object", "additionalProperties": { "type": "string" } },
          "events": {
            "type": "object",
            "additionalProperties": {
              "type": "array",
              "items": { "type": "object", "properties": { "type": { "type": "string" }, "params": { "type": "object" } } }
            }
          },
          "access": { "type": "object", "properties": { "roles": { "type": "array", "items": { "type": "string" } } } }
        }
      }
    }
  }
}
```


