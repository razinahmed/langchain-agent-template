<div align="center">

# 🤖 LangChain Autonomous Agent Template

<img src="https://placehold.co/900x250/1e1e2e/eab308.png?text=LangChain+%7C+OpenAI+%7C+Autonomous+AI+Agent" alt="LangChain Agent Banner" />

<br/>

**A production-ready boilerplate for building autonomous AI agents using LangChain, OpenAI, and Python — with built-in memory, tools, and RAG support.**

[![LangChain](https://img.shields.io/badge/LangChain-0.2+-eab308?style=for-the-badge)](https://python.langchain.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-000000?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Store-4A90D9?style=for-the-badge)](https://www.trychroma.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-eab308?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](http://makeapullrequest.com)

[Features](#-features) · [Architecture](#-agent-architecture) · [Quick Start](#-quick-start) · [Examples](#-example-conversations) · [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Agent Architecture](#-agent-architecture)
- [Tool Integrations](#-tool-integrations)
- [Memory Patterns](#-memory-patterns)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Example Conversations](#-example-conversations)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 About

This template provides everything you need to build **autonomous AI agents** powered by **LangChain** and **OpenAI GPT-4**. It implements the ReAct (Reasoning + Acting) pattern, allowing agents to think step-by-step, use tools, and maintain conversation memory. Whether you are building a research assistant, customer support chatbot, or a RAG-powered knowledge base, this template gives you a solid, extensible foundation.

---

## ✨ Features

| Feature | Description |
|---|---|
| **ReAct Agent Framework** | Step-by-step reasoning with tool selection and execution loops |
| **Custom Tool Integration** | Easily define and register custom tools (web search, APIs, calculators) |
| **Conversation Memory** | Persistent memory across sessions using buffer, summary, or vector-based strategies |
| **RAG Pipeline** | Built-in Retrieval-Augmented Generation with ChromaDB or Pinecone |
| **Streaming Responses** | Real-time token streaming for responsive chat interfaces |
| **Prompt Templates** | Modular, reusable prompt templates with variable injection |
| **Multi-Agent Support** | Chain multiple specialized agents for complex workflows |
| **Error Recovery** | Graceful handling of tool failures and LLM rate limits |
| **Async Support** | Full async/await support for high-throughput applications |
| **Logging & Tracing** | LangSmith integration for debugging agent decision chains |

---

## 🏗️ Agent Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      USER INPUT                         │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   AGENT EXECUTOR                        │
│  ┌───────────────────────────────────────────────────┐  │
│  │              LLM (GPT-4 / GPT-4o)                 │  │
│  │         Decides: Think → Act → Observe            │  │
│  └───────────────────┬───────────────────────────────┘  │
│                      │                                  │
│         ┌────────────┼────────────┐                     │
│         ▼            ▼            ▼                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ Web      │ │ RAG      │ │ Custom   │                │
│  │ Search   │ │ Retriever│ │ API Tool │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│                      │                                  │
│                      ▼                                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              MEMORY MANAGER                       │  │
│  │   Buffer Memory │ Summary Memory │ Vector Memory  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   AGENT RESPONSE                        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Tool Integrations

The agent can use any combination of the following built-in tools:

| Tool | Type | Description | API Key Required |
|---|---|---|:-:|
| **SerpAPI Search** | Web Search | Google search results via SerpAPI | ✅ |
| **Wikipedia** | Knowledge | Query Wikipedia articles for factual information | ❌ |
| **Calculator** | Math | Evaluate mathematical expressions accurately | ❌ |
| **RAG Retriever** | Vector Search | Query your own documents via ChromaDB embeddings | ❌ |
| **Weather API** | External API | Current weather data from OpenWeatherMap | ✅ |
| **URL Loader** | Web Scraping | Load and parse content from any URL | ❌ |
| **Python REPL** | Code Execution | Execute Python code for data analysis tasks | ❌ |

### Adding a Custom Tool

```python
from langchain.tools import tool

@tool
def my_custom_tool(query: str) -> str:
    """Description of what this tool does - the agent reads this."""
    result = your_api_call(query)
    return result

# Register it in config/tools.py
AGENT_TOOLS = [search_tool, rag_tool, my_custom_tool]
```

---

## 🧠 Memory Patterns

| Pattern | Best For | Persistence | Token Usage |
|---|---|:-:|---|
| **Buffer Memory** | Short conversations (< 20 turns) | Session only | High (stores all messages) |
| **Summary Memory** | Long conversations | Session only | Low (LLM summarizes history) |
| **Vector Memory** | Cross-session recall | Persistent (ChromaDB) | Medium (similarity search) |
| **Buffer + Summary** | Production chatbots | Configurable | Balanced |

Configure your memory strategy in `config/settings.py`:

```python
MEMORY_TYPE = "buffer_summary"  # Options: buffer, summary, vector, buffer_summary
MEMORY_MAX_TOKENS = 4000
MEMORY_PERSIST_DIR = "./data/memory"
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10 or higher
- An [OpenAI API key](https://platform.openai.com/api-keys)
- (Optional) [SerpAPI key](https://serpapi.com/) for web search

### 1. Clone & Install

```bash
git clone https://github.com/razinahmed/langchain-agent-template.git
cd langchain-agent-template
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

### 3. Run the Agent

```bash
python main.py
```

### 4. Run with Streaming (Chat Mode)

```bash
python main.py --mode chat --stream
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

| Variable | Required | Description |
|---|:-:|---|
| `OPENAI_API_KEY` | ✅ | Your OpenAI API key |
| `OPENAI_MODEL` | ❌ | Model name (default: `gpt-4o`) |
| `SERPAPI_API_KEY` | ❌ | SerpAPI key for web search tool |
| `PINECONE_API_KEY` | ❌ | Pinecone key for cloud vector store |
| `LANGSMITH_API_KEY` | ❌ | LangSmith key for tracing & debugging |
| `CHROMA_PERSIST_DIR` | ❌ | ChromaDB storage path (default: `./data/chroma`) |

```env
OPENAI_API_KEY="sk-..."
SERPAPI_API_KEY="..."
OPENAI_MODEL="gpt-4o"
```

---

## 💬 Example Conversations

### Research Assistant (Default)

```
You: What are the latest advances in quantum computing in 2025?

Agent [Thinking]: I need to search for recent quantum computing developments.
Agent [Action]: Using SerpAPI Search tool...
Agent [Observation]: Found 5 relevant results about quantum computing advances.
Agent [Thinking]: Let me summarize the key findings.

Agent: Based on my research, here are the major quantum computing advances in 2025:
1. IBM unveiled their 1,386-qubit Flamingo processor...
2. Google achieved quantum error correction below threshold...
3. Microsoft announced their topological qubit breakthrough...
```

### RAG-Powered Knowledge Base

```
You: Based on our company docs, what is our refund policy?

Agent [Thinking]: This requires searching our internal knowledge base.
Agent [Action]: Using RAG Retriever tool with query "refund policy"...
Agent [Observation]: Found 3 relevant document chunks.

Agent: According to your company documentation, the refund policy states:
- Full refunds are available within 30 days of purchase...
- Digital products are non-refundable after download...
```

---

## 📁 Project Structure

```
langchain-agent-template/
├── main.py                     # Entry point — run the agent
├── config/
│   ├── settings.py             # Agent configuration (model, memory, etc.)
│   └── tools.py                # Tool registration and setup
├── agent/
│   ├── executor.py             # Agent executor with ReAct loop
│   ├── prompts.py              # System and user prompt templates
│   └── callbacks.py            # Streaming and logging callbacks
├── tools/
│   ├── search.py               # Web search tool wrapper
│   ├── rag.py                  # RAG retriever tool
│   ├── calculator.py           # Math evaluation tool
│   └── custom.py               # Template for custom tools
├── memory/
│   ├── buffer.py               # Buffer memory implementation
│   ├── summary.py              # Summary memory implementation
│   └── vector.py               # Vector-based persistent memory
├── data/
│   ├── chroma/                 # ChromaDB persistent storage
│   └── documents/              # Documents for RAG ingestion
├── tests/                      # Unit and integration tests
├── .env.example                # Environment variable template
├── requirements.txt
├── LICENSE
└── README.md
```

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Agent Framework** | LangChain 0.2+, LangGraph |
| **LLM Provider** | OpenAI (GPT-4, GPT-4o, GPT-3.5-Turbo) |
| **Vector Stores** | ChromaDB (local), Pinecone (cloud) |
| **Embeddings** | OpenAI text-embedding-3-small |
| **Memory** | LangChain Memory modules |
| **Tracing** | LangSmith |
| **Language** | Python 3.10+ |
| **Testing** | pytest, pytest-asyncio |

---

## 🤝 Contributing

Contributions are welcome! Here is how to get started:

1. **Fork** this repository
2. **Create** a feature branch (`git checkout -b feature/new-tool`)
3. **Add** your tool or improvement
4. **Write** tests for new functionality
5. **Submit** a Pull Request

Ideas for contributions:
- New tool integrations (Slack, Gmail, GitHub API)
- Additional memory strategies
- Multi-agent orchestration patterns
- Frontend chat interface

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built by [Razin Ahmed](https://github.com/razinahmed)**

If this template helped you build your AI agent, please give the repo a ⭐

<img src="https://komarev.com/ghpvc/?username=razinahmed&style=flat-square&color=eab308&label=REPO+VIEWS" alt="Repo Views" />

</div>
