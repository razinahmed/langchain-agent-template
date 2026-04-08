# System Architecture -- LangChain Agent Template

## Overview
A configurable AI agent built on LangChain that accepts natural language prompts, reasons about which tools to invoke, and returns grounded answers. The system supports conversational memory, streaming output, and runtime tool registration.

## Components

### 1. API Server (Node.js / Express)
- Exposes REST endpoints for agent execution, tool management, and session history.
- Supports both synchronous (`/run`) and streaming (`/stream`) execution modes.
- Validates API keys and rate-limits requests per key.

### 2. Agent Core (LangChain)
- Uses the ReAct (Reason + Act) prompting pattern.
- On each iteration the LLM decides whether to call a tool or produce a final answer.
- Supports configurable `maxIterations` to cap reasoning depth and prevent runaway loops.
- The agent prompt is constructed dynamically to include descriptions of all enabled tools.

### 3. Tool Registry
- Tools are registered at startup from a config file or at runtime via the API.
- Each tool implements a `run(input: string) -> string` interface.
- Built-in tools: `web_search` (SerpAPI), `calculator` (mathjs), `code_interpreter` (sandboxed Python).
- Custom tools can point to any HTTP endpoint; the agent sends the LLM-generated input and expects a text response.

### 4. Conversation Memory
- Maintains per-session message history in an in-memory store (or Redis for production).
- Sliding window strategy: only the most recent N messages are included in the prompt to stay within token limits.
- Sessions are isolated; no cross-session data leakage.

### 5. LLM Provider
- Defaults to OpenAI GPT-4 but supports any LangChain-compatible model (Anthropic Claude, local Ollama, etc.).
- Configured via environment variables (`LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY`).

## Execution Flow
```
Client --> POST /api/agent/run
              |
         [API Server]
              |
         [Agent Core]
           |       |
     [LLM call]   [Tool Registry]
           |            |
     <decision>    [Tool Execution]
           |            |
     (iterate or   (return result)
      final answer)
              |
         <-- Response { result, toolCalls }
```

1. The API server receives a prompt and optional tool list.
2. The Agent Core builds a ReAct prompt with conversation history and tool descriptions.
3. The LLM returns a thought and an action (tool call) or a final answer.
4. If a tool call is returned, the Tool Registry dispatches it and feeds the result back.
5. Steps 3-4 repeat until the LLM produces a final answer or `maxIterations` is reached.
6. The full trace (thoughts, tool calls, answer) is returned to the client.

## Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `openai` | LLM provider name |
| `LLM_MODEL` | `gpt-4` | Model identifier |
| `LLM_API_KEY` | (required) | API key for the LLM provider |
| `MAX_ITERATIONS` | `10` | Default max agent reasoning steps |
| `MEMORY_MAX_MESSAGES` | `20` | Sliding window size per session |
| `REDIS_URL` | (none) | Optional Redis URL for persistent memory |

## Error Handling
- Tool execution errors are caught and fed back to the LLM as observation text, allowing it to recover or try a different tool.
- If the LLM produces unparseable output, the agent retries the last step once before returning a fallback message.
- Rate limit errors from the LLM provider trigger exponential backoff with up to 3 retries.
