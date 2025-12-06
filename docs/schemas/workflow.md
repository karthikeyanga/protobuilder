## Workflow Schema (v1 skeleton)

```json
{
  "type": "object",
  "required": ["id", "version", "bpmnRef"],
  "properties": {
    "id": { "type": "string" },
    "version": { "type": "string" },
    "bpmnRef": { "type": "string" },
    "signals": { "type": "array", "items": { "type": "string" } },
    "variables": { "type": "object", "additionalProperties": true },
    "userTasks": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["taskId", "pageRef"],
        "properties": {
          "taskId": { "type": "string" },
          "pageRef": { "type": "string" },
          "payloadSchema": { "type": "object", "additionalProperties": true }
        }
      }
    }
  }
}
```


