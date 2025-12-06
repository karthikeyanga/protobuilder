## Theme Schema (v1 skeleton)

```json
{
  "type": "object",
  "required": ["name", "version", "tokens"],
  "properties": {
    "name": { "type": "string" },
    "version": { "type": "string" },
    "tokens": {
      "type": "object",
      "properties": {
        "color": { "type": "object", "additionalProperties": { "type": "string" } },
        "typography": { "type": "object", "additionalProperties": true },
        "spacing": { "type": "object", "additionalProperties": true },
        "radius": { "type": "object", "additionalProperties": true },
        "shadows": { "type": "object", "additionalProperties": true },
        "motion": { "type": "object", "additionalProperties": true }
      }
    },
    "modes": { "type": "object", "additionalProperties": { "$ref": "#/properties/tokens" } }
  }
}
```


