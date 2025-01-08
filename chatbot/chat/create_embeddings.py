from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA
import PyPDF2
from dotenv import load_dotenv
load_dotenv()

EMBEDDING_FILE = "chatbot/chat/faiss_index"
PDF_FILE = "company_info.pdf"  # Replace with your company info PDF path

# Step 1: Create embeddings and FAISS vector store
def create_embeddings_from_pdf(pdf_path: str, output_path: str) -> None:
    """
    Generate embeddings from a PDF file and store them in a FAISS vector store.

    Args:
        pdf_path (str): Path to the PDF file.
        output_path (str): Path to save the FAISS vector store.
    """
    # Load and split PDF text
    reader = PyPDF2.PdfReader(pdf_path)
    text = "".join(page.extract_text() for page in reader.pages)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500, chunk_overlap=50
    )
    docs = [Document(page_content=chunk) for chunk in text_splitter.split_text(text)]

    # Generate embeddings and store in FAISS
    embeddings = OpenAIEmbeddings()
    faiss_index = FAISS.from_documents(docs, embeddings)

    # Save FAISS index to the specified path
    faiss_index.save_local(output_path)
    print(f"FAISS vector store saved to {output_path}")

if __name__ == "__main__":
    create_embeddings_from_pdf(PDF_FILE, EMBEDDING_FILE)