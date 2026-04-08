# LangChain Agent Template API

## Agent Execution

### `POST /api/agent/run`
Execute the agent with a given prompt and optional tool set.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | yes | The user's natural language query |
| `tools` | string[] | no | List of tool names to enable (default: all registered tools) |
| `sessionId` | string | no | Session ID for conversation memory continuity |
| `maxIterations` | number | no | Max reasoning steps before stopping (default: 10) |

**Response 200:**
```json
{
  "result": "The population of Tokyo is approximately 14 million.",
  "toolCalls": [
    { "tool": "web_search", "input": "population of Tokyo", "output": "14 million (2024)" }
  ],
  "tokensUsed": 842,
  "duration": 2340
}
```

### `POST /api/agent/stream`
Same as `/run` but returns a Server-Sent Events stream. Each event is a JSON object with `type` (`thought`, `tool_call`, `tool_result`, `answer`).

## Tool Management

### `GET /api/tools`
List all registered tools.

**Response 200:**
```json
{
  "tools": [
    { "name": "web_search", "description": "Search the web using a query string" },
    { "name": "calculator", "description": "Evaluate a mathematical expression" },
    { "name": "code_interpreter", "description": "Execute Python code in a sandbox" }
  ]
}
```

### `POST /api/tools/register`
Register a custom tool at runtime.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Unique tool identifier |
| `description` | string | yes | What the tool does (used in LLM prompt) |
| `endpoint` | string | yes | URL the agent calls to execute the tool |

## Memory / Session

### `GET /api/sessions/:sessionId/history`
Retrieve the conversation history for a session.

**Response 200:** `{ "messages": [{ "role": "user", "content": "..." }, ...] }`

### `DELETE /api/sessions/:sessionId`
Clear conversation memory for a session.

## Health

### `GET /api/health`
Returns `{ "status": "ok", "model": "gpt-4", "toolCount": 3 }`.

## Authentication
All endpoints require an API key via the `X-API-Key` header. Session endpoints additionally validate that the caller owns the session.
