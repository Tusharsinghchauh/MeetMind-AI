import os

from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()


def create_vector_store(transcript: str):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set. Add it to environment or .env file.")

    if not transcript or not transcript.strip():
        raise ValueError("No speech detected in audio. Please upload a clearer meeting recording.")

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = splitter.create_documents([transcript.strip()])
    docs = [doc for doc in docs if doc.page_content and doc.page_content.strip()]
    if not docs:
        raise ValueError("Transcript is empty after processing. Please upload a different recording.")

    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    return FAISS.from_documents(docs, embeddings)
