import { useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function analyzeFile() {
    if (!file) {
      setError('Please select a CSV or Excel file first.')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Could not analyze the file.')
      }

      setResult(data)
    } catch (err) {
      setError(err.message || 'Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">DS</span>
          <span>DataSleuth <small>AI</small></span>
        </div>

        <div
  className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
  onClick={() => setActiveTab("overview")}
>
  ▦ &nbsp; Data Overview
</div>

<div
  className={`nav-item ${activeTab === "analysis" ? "active" : ""}`}
  onClick={() => setActiveTab("analysis")}
>
  ↗ &nbsp; Data Analysis
</div>

<div
  className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
  onClick={() => setActiveTab("reports")}
>
  ◷ &nbsp; Reports
</div>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          API Backend
          <span className="online">Local</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
  <span>
    Workspace / {
      activeTab === "overview"
        ? "Overview"
        : activeTab === "analysis"
        ? "Data Analysis"
        : "Reports"
    }
  </span>
  
          <span className="profile">DS</span>
        </header>

        <section className="welcome">
          <p className="eyebrow">YOUR DATA, MADE CLEARER</p>
          <h1>Discover what your data is telling you.</h1>
          <p className="subtitle">
            Upload a dataset to uncover missing values, duplicate records,
            patterns, and useful insights.
          </p>
        </section>

        <section className="upload-card">
          <div className="upload-icon">↑</div>
          <h2>Upload your dataset</h2>
          <p>Choose a CSV or Excel file to begin your analysis.</p>

          <label className="file-picker">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(event) => {
                setFile(event.target.files?.[0] || null)
                setError('')
                setResult(null)
              }}
            />
            <span>Choose file</span>
            <span className="file-name">
              {file ? file.name : 'No file selected'}
            </span>
          </label>

          <button
            className="analyze-button"
            onClick={analyzeFile}
            disabled={loading}
          >
            {loading ? 'Analyzing dataset...' : 'Analyze my data →'}
          </button>

          {error && <p className="error">{error}</p>}
        </section>

        {result && (
          <section className="results">
            <div className="results-heading">
              <div>
                <p className="eyebrow">ANALYSIS COMPLETE</p>
                <h2>Your data overview</h2>
              </div>
              <span className="success">✓ Analysis successful</span>
            </div>

            <div className="stats">
              <article className="stat-card">
                <p>Missing values</p>
                <h3>
                  {Object.values(result.missing_values || {}).reduce(
                    (sum, value) => sum + Number(value || 0), 0
                  )}
                </h3>
                <span>Empty cells found</span>
              </article>

              <article className="stat-card">
                <p>Duplicate rows</p>
                <h3>{result.duplicate_rows ?? '—'}</h3>
                <span>Repeated records</span>
              </article>

              <article className="stat-card">
                <p>Columns</p>
                <h3>{result.columns?.length ?? '—'}</h3>
                <span>Fields in your dataset</span>
              </article>
            </div>

            <div className="data-card">
              <h3>Missing values by column</h3>
              <div className="missing-list">
                {Object.entries(result.missing_values || {}).map(
                  ([column, count]) => (
                    <div className="missing-row" key={column}>
                      <span>{column}</span>
                      <strong>{count}</strong>
                    </div>
                  )
                )}
              </div>
            </div>

            {result.preview && (
              <div className="data-card">
                <h3>Dataset preview</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(result.preview[0] || {}).map((column) => (
                          <th key={column}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.preview.map((row, index) => (
                        <tr key={index}>
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex}>{String(value ?? '—')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        <footer>DataSleuth AI · Turn raw data into clear insights.</footer>
      </main>
    </div>
  )
}

export default App