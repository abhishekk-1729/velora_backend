import openai
import requests
import json
import os
from dotenv import load_dotenv
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from langchain.agents import initialize_agent, Tool, AgentExecutor, create_tool_calling_agent
from langchain.tools import tool
from langchain.prompts import ChatPromptTemplate
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage

# Load environment variables
load_dotenv()

# Initialize the OpenAI model
llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    model="gpt-4",
    temperature=0
)

# Initialize conversation memory
memory = ConversationBufferMemory(memory_key="history", return_messages=True)

# Define the agent's prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Use tools effectively for accurate responses."),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# Function to determine if a lead is qualified
@csrf_exempt
def is_qualified_lead(conversation_history):
    """
    Determine if the user is a qualified lead based on the conversation history.
    """
    prompt = (
        f"Based on the following conversation history, determine if the user is a qualified lead. "
        f"A qualified lead shows intent to buy or asks about product details, pricing, or contact information. "
        f"Conversation History: {conversation_history}"
    )
    response = openai.ChatCompletion.create(
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
    
# ... Existing imports ...

from logger.logger import Logger

# Initialize the logger
logger = Logger(log_level="BOTH")

from pymongo import MongoClient

@tool
def get_user_phone_number(username: str) -> str:
    """
    Retrieve the phone number of a user from the MongoDB database using their username.
    
    # Args:
    #     username (str): The username of the user whose phone number is to be fetched.
        
    # Returns:
    #     str: The phone number of the user if found, or an error message if not found or an issue occurs.
    """
    try:
        # Connect to MongoDB (replace with your actual database connection string)
        client = MongoClient(os.getenv("MONGO_URI"))
        db = client['test']  # Replace with your database name
        collection = db['users']  # Replace with your collection name
        
        # Query the database to find the user by their username
        user = collection.find_one({"name": username})
        
        if user and 'phone_number' in user:
            # Return the phone number if found
            return str(user['phone_number'])
        else:
            logger.warning(f"User with username '{username}' not found or does not have a phone number.")
            return f"User with username '{username}' not found or does not have a phone number."
    
    except Exception as e:
        logger.error(f"Error querying the database for phone number: {e}")
        return "An error occurred while fetching the phone number."
    
# Helper function to convert conversation history to string
def convert_conversation_history_to_string(conversation_history):
    """
    Convert the conversation history into a string format.
    """
    try:
        conversation_str = ""
        for message in conversation_history:
            role = "Human" if isinstance(message, HumanMessage) else "AI"
            conversation_str += f"{role}: {message.content}, "
        logger.debug(f"Converted conversation history: {conversation_str}")
        return conversation_str
    except Exception as e:
        logger.error(f"Error converting conversation history: {e}")
        raise

# Tool: Search in Text
@tool
def search_in_text(query: str) -> str:
    """
    Search for specific information in a given text and answer based on the query.
    """
    try:
        text = "My name is Abhishek"
        prompt = f"Given the following text:\n{text}\nAnswer the question: {query}"
        logger.debug(f"Search in text query: {query}")
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant who checks the prompt carefully and answers the questions. You don't give explanations, you just give final answers.",
                },
                {"role": "user", "content": prompt},
            ],
            max_tokens=100,
        )
        logger.debug(f"Search in text response: {response}")
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error in search_in_text tool: {e}")
        return "An error occurred while processing your request."

# Tool: Fetch Weather
@tool
def fetch_weather(city: str) -> str:
    """
    Fetch the current weather for a given city.
    """
    try:
        logger.debug(f"Fetching weather for city: {city}")
        return f"The weather in {city} is sunny with a temperature of 25°C."
    except Exception as e:
        logger.error(f"Error in fetch_weather tool: {e}")
        return "An error occurred while fetching the weather."

# Tool: API Call and Generate Answer
@tool
def api_call_and_generate_answer(api_url: str) -> str:
    """
    Call an API using the provided URL and generate an insightful response based on the data.
    """
    try:
        logger.debug(f"Calling API: {api_url}")
        response = requests.get(api_url)
        if response.status_code != 200:
            logger.error(f"API call failed with status code {response.status_code}")
            return f"Failed to fetch data from the API. Status code: {response.status_code}"

        data = response.json()
        prompt = f"Based on the following data from the API, provide an insightful response:\n{data}"
        ai_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            max_tokens=150,
        )
        logger.debug(f"API call response: {ai_response}")
        return ai_response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error in api_call_and_generate_answer tool: {e}")
        return "An error occurred while processing the API response."

tools = [search_in_text, fetch_weather, api_call_and_generate_answer, get_user_phone_number]

# Create the tool-using agent
agent = create_tool_calling_agent(llm, tools, prompt)

# Create an agent executor
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

@csrf_exempt
def check_lead(request):
    """
    Analyze the conversation history and determine lead qualification status.
    """
    try:
        conversation_history = memory.load_memory_variables({}).get("history", [])
        lead_status = is_qualified_lead(convert_conversation_history_to_string(conversation_history))
        logger.debug(f"Lead status determined: {lead_status}")
        return JsonResponse({"lead_status": lead_status})
    except Exception as e:
        logger.error(f"Error in check_lead endpoint: {e}")
        return JsonResponse({"error": "An error occurred while checking the lead status."}, status=500)

@csrf_exempt
def chat(request):
    """
    Handle chat messages and return AI-generated responses.
    """
    print(request)
    print(request.method)
    try:
        if request.method == "POST":
            data = json.loads(request.body)
            print(data)
            user_input = data.get("user_input")
            logger.debug(f"User input received: {user_input}")

            # Use the agent executor to generate a response
            response = agent_executor.invoke(
                {
                    "input": user_input,
                    "chat_history": memory.load_memory_variables({}).get("history", [])
                }
            )

            # Update conversation memory
            memory.chat_memory.add_user_message(user_input)
            memory.chat_memory.add_ai_message(response.get("output"))

            logger.debug(f"Chat response generated: {response.get('output')}")
            return JsonResponse({"response": response.get("output")})
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return JsonResponse({"error": "An error occurred during the chat process."}, status=500)
