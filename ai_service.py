import json
import os
from typing import Any, Dict

from dotenv import load_dotenv
from langchain_classic.chains import RetrievalQA
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()


def _extract_json(text: str) -> Dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        cleaned = cleaned.replace("json", "", 1).strip()
    return json.loads(cleaned)


def analyze_meeting(vectorstore):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return {
            "error": "GOOGLE_API_KEY is not set. Add it to environment or .env file."
        }

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.2)

    structured_prompt = """
Analyze the meeting transcript and return STRICT JSON in this format:
{
  "summary": "5-8 line simple summary",
  "important_points": ["point1", "point2"],
  "priority_list": {
      "high": ["task"],
      "medium": ["task"],
      "low": ["task"]
  }
}
Only return JSON.
"""

    qa = RetrievalQA.from_chain_type(llm=llm, retriever=vectorstore.as_retriever())
    result = qa.invoke({"query": structured_prompt})

    try:
        return _extract_json(result["result"])
    except Exception as exc:
        return {"error": f"Model did not return valid JSON: {exc}"}
