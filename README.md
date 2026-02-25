# AI Meeting Intelligence

FastAPI backend + React/Vite frontend for meeting transcription and AI analysis.

## Project Structure

```text
.
|-- ai_service.py
|-- main.py
|-- models.py
|-- rag_pipeline.py
|-- transcriber.py
|-- requirements.txt
|-- render.yaml
|-- .python-version
`-- frontend/
    |-- src/
    |-- package.json
    |-- vite.config.ts
    `-- ...
```

## Environment Variables

Backend:

- `GOOGLE_API_KEY` (required)
- `CORS_ORIGINS` (optional, default `*`)

Frontend:

- `VITE_API_BASE_URL` (set automatically in `render.yaml` for Render deploys)

## Local Development

Backend:

```powershell
.\venv\Scripts\python.exe -m uvicorn main:app --reload
```

Frontend:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

## Deploy on Render (Recommended)

This repo includes a `render.yaml` Blueprint that creates:

1. `meetmind-api` (Python web service)
2. `meetmind-web` (static frontend service)

Steps:

1. Push this project to GitHub/GitLab.
2. In Render, create a **Blueprint** and select the repo.
3. Set `GOOGLE_API_KEY` in the `meetmind-api` service.
4. Deploy.

The frontend service gets `VITE_API_BASE_URL` from the backend service URL automatically.
