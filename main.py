from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil

from ai_service import analyze_meeting
from models import MeetingAnalysis
from rag_pipeline import create_vector_store
from transcriber import transcribe_audio

app = FastAPI()


def _get_cors_origins() -> list[str]:
    origins_env = os.getenv("CORS_ORIGINS", "*").strip()
    if origins_env == "*":
        return ["*"]

    origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]
    return origins or ["*"]


cors_origins = _get_cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/upload-meeting/", response_model=MeetingAnalysis)
async def upload_meeting(file: UploadFile = File(...)):
    os.makedirs("data", exist_ok=True)

    # Protect against path traversal via uploaded filename.
    file_path = os.path.join("data", os.path.basename(file.filename))
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        transcript = transcribe_audio(file_path)
        vectorstore = create_vector_store(transcript)
        result = analyze_meeting(vectorstore)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result
