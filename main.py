import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import initialize_agent, AgentType
from langchain.tools import Tool
from langchain.memory import ConversationBufferMemory

# Load Env
load_dotenv()

def custom_search_tool(query: str):
    """Simulates a web search."""
    print(f"[*] Searching the web for: {query}")
    return "Dummy search results..."

def main():
    print("🤖 Initializing Autonomous LangChain Agent...")
    
    # Needs valid OPENAI_API_KEY in .env, otherwise it will fail in production
    llm = ChatOpenAI(temperature=0.7, model="gpt-4-turbo-preview")
    
    tools = [
        Tool(
            name="WebSearch",
            func=custom_search_tool,
            description="Useful for when you need to answer questions about current events."
        )
    ]
    
    memory = ConversationBufferMemory(memory_key="chat_history")
    
    agent = initialize_agent(
        tools, 
        llm, 
        agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION, 
        memory=memory,
        verbose=True
    )
    
    # Interaction loop
    print("\nReady! Type 'exit' to quit.")
    while True:
        user_input = input("You: ")
        if user_input.lower() == 'exit':
            break
        
        try:
            response = agent.run(user_input)
            print(f"Agent: {response}")
        except Exception as e:
            print(f"Error (Check API Key): {e}")

if __name__ == "__main__":
    main()
