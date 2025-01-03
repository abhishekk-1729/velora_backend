# chat/views.py

import openai
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from langchain.agents import initialize_agent, Tool
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.agents import AgentType
from langchain.schema import HumanMessage, AIMessage
import json

# Initialize the memory (for storing conversation context)
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)


# Define tools - Search in File, Weather API, and API Call Tool
def search_in_text(query):
    text = "My name is Abhishek"
    prompt = f"Given the following text:\n{text}\nAnswer the question: {query}"
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant. Who checks the prompt carefully and answers the questions. You don't give explanations, you just give final answers",
            },
            {"role": "user", "content": prompt},
        ],
        max_tokens=100,
    )
    return response.choices[0].message.content


def fetch_weather(city):
    # Placeholder for a real weather API call
    return f"The weather in {city} is sunny with a temperature of 25°C."


def api_call_and_generate_answer():
    # Make an API request
    api_url = ""
    response = requests.get(api_url)
    data = response.json()

    # Now, generate an AI response based on the API response
    prompt = f"Based on the following data from the API, provide an insightful response:\n{data}"

    ai_response = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        max_tokens=150,
    )

    return ai_response.choices[0].message


tools = [
    Tool(
        name="Search In Text",
        func=search_in_text,
        description="Can tell answers to the question like 'What is your name?'",
    ),
    Tool(
        name="Weather API",
        func=fetch_weather,
        description="Fetches weather information for a given city.",
    ),
    Tool(
        name="API Call and AI Answer",
        func=api_call_and_generate_answer,
        description="Calls an API, processes the JSON response, and uses AI to generate an insightful answer.",
    ),
]

# Initialize OpenAI model
llm = ChatOpenAI(openai_api_key="your_api_key_here", model="gpt-4", temperature=0)

# Initialize the agent using 'conversational-react-description' with memory and tools
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent_type=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
    memory=memory,
    verbose=True,
)


def is_qualified_lead(conversation_history):
    """
    Function to determine if the user is a qualified lead based on conversation history.
    """
    prompt = f"Based on the following conversation history, determine if the user is a qualified lead. A qualified lead is someone who shows intent to buy or asks about product details, pricing, or contact information. Conversation History: {conversation_history}"
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant that determines if a lead is qualified based on conversation history.",
            },
            {"role": "user", "content": prompt},
        ],
        max_tokens=100,
    )

    return response.choices[0].message.content


def convert_conversation_history_to_string(conversation_history):
    # Initialize an empty string to store the conversation
    conversation_str = ""
    
    # Iterate through each message in the conversation history
    for message in conversation_history:
        # Extract the role (either 'Human' or 'AI') and content of the message
        role = "Human" if isinstance(message, HumanMessage) else "AI"
        content = message.content
        
        # Append the role and content to the conversation string
        conversation_str += f"{role}: {content}, "
    
    return conversation_str


# Check if the lead is qualified
@csrf_exempt
def check_lead(request):
    # Example of a simulated conversation history for the GET request
    conversation_history = memory.load_memory_variables({})["chat_history"]

    # Call the function to analyze if the lead is qualified
    lead_status = is_qualified_lead(convert_conversation_history_to_string(conversation_history))

    return JsonResponse({"lead_status": lead_status})


# Chat with the AI
@csrf_exempt
def chat(request):
    if request.method == "POST":
        data = json.loads(request.body)
        user_input = data.get("user_input")

        # Use the agent to run and get the response based on user input and available tools
        response = agent.run(user_input)

        return JsonResponse({"response": response})
