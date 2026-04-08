# 🤖 LangChain Autonomous Agent Template

<div align="center">

<img src="https://placehold.co/800x200/1e1e2e/eab308.png?text=LangChain+%2B+OpenAI" alt="LangChain Banner" />

**A production-ready boilerplate for building autonomous AI agents using LangChain, OpenAI, and Python.**

[![LangChain](https://img.shields.io/badge/LangChain-1.0-eab308.svg)](https://python.langchain.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT4-000000.svg)](https://openai.com/)

</div>

---

## ⚡ Features

This template gives you everything you need to build advanced LLM-powered applications:
* **Custom Tools Integration:** Easily define custom tools for the agent to use (web search, API calls).
* **Memory Management:** Stateful conversation memory across sessions.
* **Vector Store Ready:** Built-in Pinecone/ChromaDB scaffolding for Retrieval-Augmented Generation (RAG).

## 🚀 Quick Start

1. **Clone & Install:**
```bash
git clone https://github.com/razinahmed/langchain-agent-template.git
cd langchain-agent-template
pip install -r requirements.txt
```

2. **Environment Variables:**
Create a `.env` file and add your keys:
```
OPENAI_API_KEY="sk-..."
SERPAPI_API_KEY="..."
```

3. **Run the Agent:**
```bash
python main.py
```

## 🧠 Example Use Case
By default, the agent is configured as a "Research Assistant". You can ask it to search the web, summarize findings, and write reports autonomously.
