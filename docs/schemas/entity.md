## Entity Schema (v1 skeleton)

```json
{
  "type": "object",
  "required": ["name", "version", "fields"],
  "properties": {
    "name": { "type": "string" },
    "version": { "type": "string" },
    "fields": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "kind"],
        "properties": {
          "name": { "type": "string" },
          "kind": { "enum": ["primitive", "object", "array", "reference"] },
          "type": { "enum": ["string", "number", "boolean", "date", "datetime"] },
          "ref": { "type": "string", "description": "Target entity name when kind=reference" },
          "cardinality": { "enum": ["one", "list"], "description": "For kind=reference; default one" },
          "constraints": {
            "type": "object",
            "properties": {
              "required": { "type": "boolean" },
              "min": { "type": "number" },
              "max": { "type": "number" },
              "minLength": { "type": "integer" },
              "maxLength": { "type": "integer" },
              "pattern": { "type": "string" },
              "enum": { "type": "array", "items": { "type": "string" } },
              "unique": { "type": "boolean" },
              "default": {}
            }
          },
          "fields": { "$ref": "#/properties/fields" },
          "items": { "$ref": "#/properties/fields/items" },
          "display": {
            "type": "object",
            "properties": { "label": { "type": "string" }, "help": { "type": "string" }, "mask": { "type": "string" } }
          },
          "derived": { "type": "object", "properties": { "expression": { "type": "string" } } }
        }
      }
    }
  }
}
```

Nested reference example (Entity A; Entity B with list_of_A referencing A):

```json
[
  {
    "name": "A",
    "version": "1.0.0",
    "fields": [
      { "name": "id", "kind": "primitive", "type": "string", "constraints": { "required": true } },
      { "name": "label", "kind": "primitive", "type": "string" }
    ]
  },
  {
    "name": "B",
    "version": "1.0.0",
    "fields": [
      { "name": "name", "kind": "primitive", "type": "string", "constraints": { "required": true } },
      { "name": "list_of_A", "kind": "reference", "ref": "A", "cardinality": "list" }
    ]
  }
]
```


