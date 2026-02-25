import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import axios from "axios";

type PriorityList = {
  high: string[];
  medium: string[];
  low: string[];
};

type MeetingAnalysis = {
  summary: string;
  important_points: string[];
  priority_list: PriorityList;
};

const loadingStages = [
  "Uploading audio",
  "Transcribing speech",
  "Extracting key points",
  "Generating action priorities",
];

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<MeetingAnalysis | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  const endpoint = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL?.trim();
    return base ? `${base.replace(/\/$/, "")}/upload-meeting/` : "/upload-meeting/";
  }, []);

  const onFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setError("");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Choose an audio file before analyzing.");
      return;
    }

    setIsLoading(true);
    setError("");
    setAnalysis(null);
    setStageIndex(0);

    const ticker = window.setInterval(() => {
      setStageIndex((current) => (current + 1) % loadingStages.length);
    }, 1700);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post<MeetingAnalysis>(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setAnalysis(response.data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail =
          (err.response?.data as { detail?: string } | undefined)?.detail ??
          err.message;
        setError(detail);
      } else {
        setError("Something went wrong while analyzing the meeting.");
      }
    } finally {
      window.clearInterval(ticker);
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell font-sans">
      <div className="ambient-bg" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="grid-overlay" />
      </div>

      <main className="content-wrap">
        <section className="hero reveal">
          <p className="eyebrow">Meeting Intelligence</p>
          <h1>Turn meeting audio into a clear plan in minutes.</h1>
          <p className="subtitle">
            Upload your recording and get an instant summary, important points,
            and prioritized follow-ups.
          </p>
        </section>

        <section className="panel-grid">
          <article className="glass-card reveal" style={{ animationDelay: "120ms" }}>
            <h2>Upload Recording</h2>
            <p className="card-copy">
              Supported formats: WAV, MP3, M4A, MP4, and most standard audio files.
            </p>

            <form className="upload-form" onSubmit={onSubmit}>
              <label className="upload-zone" htmlFor="meetingFile">
                <input
                  id="meetingFile"
                  type="file"
                  accept="audio/*,video/mp4,.mp4"
                  onChange={onFileSelect}
                />
                <span className="upload-title">
                  {file ? file.name : "Drop audio here or click to browse"}
                </span>
                <span className="upload-subtext">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Single file upload"}
                </span>
              </label>

              <button className="primary-btn" type="submit" disabled={isLoading}>
                {isLoading ? "Analyzing..." : "Analyze Meeting"}
              </button>
            </form>

            {isLoading && (
              <div className="loading-card" role="status" aria-live="polite">
                <p>{loadingStages[stageIndex]}</p>
                <div className="loading-track">
                  <span className="loading-bar" />
                </div>
              </div>
            )}

            {error && <p className="error-text">{error}</p>}
          </article>

          <article className="glass-card info-card reveal" style={{ animationDelay: "220ms" }}>
            <h2>What You Get</h2>
            <ul>
              <li>A short summary for quick alignment</li>
              <li>Key discussion points worth revisiting</li>
              <li>Priority buckets for immediate follow-up</li>
            </ul>
            <div className="note-box">
              Tip: clearer audio and one speaker at a time improves transcript quality.
            </div>
          </article>
        </section>

        {analysis && (
          <section className="result-grid reveal">
            <article className="glass-card result-span">
              <h2>Summary</h2>
              <p className="summary-text">{analysis.summary}</p>
            </article>

            <article className="glass-card">
              <h2>Important Points</h2>
              <ul className="chip-list">
                {analysis.important_points.map((point, idx) => (
                  <li key={`${point}-${idx}`}>{point}</li>
                ))}
              </ul>
            </article>

            <article className="glass-card">
              <h2>Priority List</h2>
              <div className="priority-stack">
                <div>
                  <p className="priority-label high">High</p>
                  <ul>
                    {analysis.priority_list.high.map((task, idx) => (
                      <li key={`high-${idx}`}>{task}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="priority-label medium">Medium</p>
                  <ul>
                    {analysis.priority_list.medium.map((task, idx) => (
                      <li key={`medium-${idx}`}>{task}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="priority-label low">Low</p>
                  <ul>
                    {analysis.priority_list.low.map((task, idx) => (
                      <li key={`low-${idx}`}>{task}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
