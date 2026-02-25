from faster_whisper import WhisperModel

# Load model once at startup
model = WhisperModel(
    "base",              # tiny, base, small, medium
    device="cpu",        # change to "cuda" if GPU
    compute_type="int8"  # optimized for CPU
)

def transcribe_audio(file_path: str) -> str:
    segments, info = model.transcribe(file_path)

    transcript = ""
    for segment in segments:
        transcript += segment.text + " "

    return transcript.strip()