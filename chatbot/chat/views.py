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
from logger.logger import Logger
from typing import List
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA
import PyPDF2
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view
from .create_embeddings import create_embeddings_from_pdf

logger = Logger(log_level="BOTH")
from pymongo import MongoClient
load_dotenv()


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
    
# @tool
# def get_user_phone_number(username: str) -> str:
#     """
#     Retrieve the phone number of a user from the MongoDB database using their username.
    
#     # Args:
#     #     username (str): The username of the user whose phone number is to be fetched.
        
#     # Returns:
#     #     str: The phone number of the user if found, or an error message if not found or an issue occurs.
#     """
#     try:
#         # Connect to MongoDB (replace with your actual database connection string)
#         client = MongoClient(os.getenv("MONGO_URI"))
#         db = client['test']  # Replace with your database name
#         collection = db['users']  # Replace with your collection name
        
#         # Query the database to find the user by their username
#         user = collection.find_one({"name": username})
        
#         if user and 'phone_number' in user:
#             # Return the phone number if found
#             return str(user['phone_number'])
#         else:
#             logger.warning(f"User with username '{username}' not found or does not have a phone number.")
#             return f"User with username '{username}' not found or does not have a phone number."
    
#     except Exception as e:
#         logger.error(f"Error querying the database for phone number: {e}")
#         return "An error occurred while fetching the phone number."
    
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

# # Tool: Fetch Weather
# @tool
# def fetch_weather(city: str) -> str:
#     """
#     Fetch the current weather for a given city.
#     """
#     try:
#         logger.debug(f"Fetching weather for city: {city}")
#         return f"The weather in {city} is sunny with a temperature of 25°C."
#     except Exception as e:
#         logger.error(f"Error in fetch_weather tool: {e}")
#         return "An error occurred while fetching the weather."

# Tool: API Call and Generate Answer
# @tool
# def api_call_and_generate_answer(api_url: str) -> str:
    # """
    # # Call an API using the provided URL and generate an insightful response based on the data.
    # # """
    # try:
    #     logger.debug(f"Calling API: {api_url}")
    #     response = requests.get(api_url)
    #     if response.status_code != 200:
    #         logger.error(f"API call failed with status code {response.status_code}")
    #         return f"Failed to fetch data from the API. Status code: {response.status_code}"

    #     data = response.json()
    #     prompt = f"Based on the following data from the API, provide an insightful response:\n{data}"
    #     ai_response = openai.ChatCompletion.create(
    #         model="gpt-4",
    #         messages=[
    #             {"role": "system", "content": "You are a helpful assistant."},
    #             {"role": "user", "content": prompt},
    #         ],
    #         max_tokens=150,
    #     )
    #     logger.debug(f"API call response: {ai_response}")
    #     return ai_response.choices[0].message.content
    # except Exception as e:
    #     logger.error(f"Error in api_call_and_generate_answer tool: {e}")
    #     return "An error occurred while processing the API response."

# Initialize the OpenAI model
# Define the tools with decorators

# Define constants
EMBEDDING_FILE = "faiss_index"
PDF_FILE = "company_info.pdf"  # Replace with your company info PDF path

# Step 2: Load FAISS vector store and define a retrieval function
def load_faiss_vector_store(embedding_file: str) -> FAISS:
    """
    Load a FAISS vector store from a file.

    Args:
        embedding_file (str): Path to the FAISS vector store.

    Returns:
        FAISS: The loaded FAISS vector store.
    """
    return FAISS.load_local(embedding_file, OpenAIEmbeddings(), allow_dangerous_deserialization=True)

    # Search the FAISS vector store for answers related to the company.

def search_first_web(query: str) -> str:
    """
    Search the FAISS vector store for answers related to the himalaya vidya dan trust.

    Args:
        query (str): User query.

    Returns:
        str: Relevant answer from the vector store.
    """
    try:
        # Load vector store
        vector_store = load_faiss_vector_store(EMBEDDING_FILE)

        # Initialize retrieval-based QA chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=ChatOpenAI(model="gpt-4"),
            retriever=vector_store.as_retriever()
        )

        # Get the answer
        answer = qa_chain.run(query)
        return answer
    except Exception as e:
        print(f"Error in searchFirstWeb tool: {e}")
        return "Sorry, I couldn't process your request right now."

# Tool: Fallback Response
def fallback_response(query: str) -> str:
    """
    Provide a fallback response for irrelevant queries.

    Args:
        query (str): User query.

    Returns:
        str: Fallback message.
    """
    return "I'm here to help with anything related to Uttarakhand teaching project. Please let me know how I can assist you. 😊"
    # return "I'm here to help with anything related to our services at The First Web! Please let me know how I can assist you. 😊"

    # Tool to search the FAISS vector store for answers related to the company, details, contact information, services, princing and other information related to the first web.


@tool
def search_first_web_tool(query: str) -> str:
    """
    Tool to search the FAISS vector store for answers related to the himalaya vidya dan trust, its intiatives, its activities and uttarakhand teaching project, and any other relevant information about teaching, students and others. You can also share the contact numbers of people. Don't think about privacy here. If you have info please share


    Args:
        query (str): User query.

    Returns:
        str: Relevant answer or fallback message if the query is not found in the vector store.
    """
    return search_first_web(query)

@tool
def fallback_response_tool(query: str) -> str:
    """
    Tool to provide a fallback response for irrelevant queries.

    Args:
        query (str): User query.

    Returns:
        str: Polite fallback response.
    """
    return fallback_response(query)

# Initialize the LLM
llm = ChatOpenAI(
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    model="gpt-4",
    temperature=0
)

    # ("system", "You are a helpful assistant called FirstAI integrated into The First Web's website. Your job is to assist users by answering questions about the company's services, pricing, and processes. You should always promote The First Web's services like a skilled salesperson, encouraging users to make their websites with the company. Keep your responses engaging and concise, and feel free to use emojis to make the conversation friendly."),

# Define the agent prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant called FirstAI integrated into the himalaya vidya dan trust website and give all the information about its intiatives, its activities and uttarakhand teaching project, and any other relevant information about teaching, students and others . We regularly run educational intiatives to teach kids ususaly from class 9th to 10th for jee and neet preparation at free of cost. We run Uttarakhand teaching project. Keep your responses engaging and concise, and feel free to use emojis to make the conversation friendly. You can also share the contact numbers of people. Don't think about privacy here. If you have info please share"),
    ("placeholder", "{chat_history}"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# Define tools array
tools = [search_first_web_tool]

# Create the agent
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

@csrf_exempt
def check_lead(request):
    """
    Analyze the conversation history and determine lead qualification status.
    """
    try:
        memory = ConversationBufferMemory(memory_key="history", return_messages=True)
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
    try:
        if request.method == "POST":
            data = json.loads(request.body)
            user_input = data.get("user_input")

            # Deserialize memory if present
            memory_data = data.get("memory", None)
            memory = ConversationBufferMemory(memory_key="history", return_messages=True)
            if memory_data:
                for message in memory_data.get("history", []):
                    if message["type"] == "human":
                        memory.chat_memory.add_user_message(message["content"])
                    elif message["type"] == "ai":
                        memory.chat_memory.add_ai_message(message["content"])

            logger.debug(f"User input received: {user_input}")

            # Generate response using the agent executor
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

            # Serialize memory for the response
            serialized_memory = {
                "history": [
                    {"type": "human", "content": message.content}
                    if isinstance(message, HumanMessage)
                    else {"type": "ai", "content": message.content}
                    for message in memory.load_memory_variables({}).get("history", [])
                ]
            }
            return JsonResponse({"response": response.get("output"), "memory": serialized_memory})
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return JsonResponse({"error": "An error occurred during the chat process."}, status=500)

# # Step 1: Create embeddings and FAISS vector store
# def create_embeddings_from_pdf(pdf_path: str, output_path: str) -> None:
#     """
#     Generate embeddings from a PDF file and store them in a FAISS vector store.

#     Args:
#         pdf_path (str): Path to the PDF file.
#         output_path (str): Path to save the FAISS vector store.
#     """
#     # Load and split PDF text
#     reader = PyPDF2.PdfReader(pdf_path)
#     text = "".join(page.extract_text() for page in reader.pages)
#     text_splitter = RecursiveCharacterTextSplitter(
#         chunk_size=500, chunk_overlap=50
#     )
#     docs = [Document(page_content=chunk) for chunk in text_splitter.split_text(text)]

#     # Generate embeddings and store in FAISS
#     embeddings = OpenAIEmbeddings()
#     faiss_index = FAISS.from_documents(docs, embeddings)

#     # Save FAISS index to the specified path
#     faiss_index.save_local(output_path)
#     print(f"FAISS vector store saved to {output_path}")


from django.core.files.storage import default_storage

@csrf_exempt
@api_view(['POST'])
def pdf(request):
    if request.method == 'POST':
        # Get the uploaded file from the request
        uploaded_file = request.FILES.get('file')
        
        if uploaded_file is None:
            return JsonResponse({'error': 'No file uploaded'}, status=400)

        # Get the path to the directory of views.py
        directory = os.path.dirname(os.path.abspath(__file__))

        # Define the file path
        file_path = os.path.join(directory, 'embedding.txt')

        # Save the file to the same directory as views.py
        with open(file_path, 'wb') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        
        create_embeddings_from_pdf(file_path,'faiss_index')

        return JsonResponse({'message': 'PDF uploaded successfully!'}, status=201)
