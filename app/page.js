"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";

const API_BASE = "/api/youtube";

function SentimentDashboardInner() {
  const searchParams = useSearchParams();
  const [ytUrl, setYtUrl] = useState("");
  const [accuracy, setAccuracy] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [animateResults, setAnimateResults] = useState(false);
  const resultsRef = useRef(null);

  // Check for URL params from extension
  useEffect(() => {
    const urlParam = searchParams.get("yturl");
    if (urlParam) {
      setYtUrl(urlParam);
      // Auto-analyze if coming from extension
      setTimeout(() => handleAnalyze(urlParam), 500);
    }
  }, [searchParams]);

  async function handleAnalyze(overrideUrl) {
    const url = overrideUrl || ytUrl;
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setAnimateResults(false);

    try {
      const apiUrl = `${API_BASE}?yturl=${encodeURIComponent(url)}&accuracy=${accuracy}`;
      const res = await fetch(apiUrl);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || json?.message || `Server error: ${res.status}`);
      }
      if (!json?.analysis) throw new Error("Invalid response from server");
      setData(json);
      setTimeout(() => {
        setAnimateResults(true);
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err.message || "Failed to analyze video");
    } finally {
      setLoading(false);
    }
  }

  const analysis = data?.analysis;

  return (
    <div className={styles.page}>
      {/* Ambient background effects */}
      <div className={styles.ambientOrb1} />
      <div className={styles.ambientOrb2} />

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <div className={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="6" fill="url(#navGrad)" />
                <path d="M10 8l6 4-6 4V8z" fill="white" />
                <defs>
                  <linearGradient id="navGrad" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className={styles.navTitle}>YT Sentiment</span>
          </div>
          <div className={styles.navLinks}>
            <span className={styles.navLink}>Analyzer</span>
            <a
              className={styles.navBadge}
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              v1.0
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot} />
            AI-Powered Analysis
          </div>
          <h1 className={styles.heroTitle}>
            YouTube Video
            <br />
            <span className={styles.heroGradient}>Sentiment Analyzer</span>
          </h1>
          <p className={styles.heroDesc}>
            Discover what viewers truly think. Analyze comments, measure engagement, and uncover
            audience sentiment for any YouTube video in seconds.
          </p>
        </div>

        {/* Search Card */}
        <div className={styles.searchCard}>
          <div className={styles.searchCardGlow} />
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>YouTube Video URL</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <input
                className={styles.input}
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Analysis Accuracy</label>
            <div className={styles.accuracyGroup}>
              {["low", "medium", "high"].map((level) => (
                <button
                  key={level}
                  className={`${styles.accuracyBtn} ${accuracy === level ? styles.accuracyActive : ""}`}
                  onClick={() => setAccuracy(level)}
                >
                  <span className={styles.accuracyIcon}>
                    {level === "low" ? "⚡" : level === "medium" ? "⚖️" : "🎯"}
                  </span>
                  <span className={styles.accuracyLabel}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                  <span className={styles.accuracyDesc}>
                    {level === "low" ? "~50 comments" : level === "medium" ? "~200 comments" : "~500 comments"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            className={styles.analyzeBtn}
            onClick={() => handleAnalyze()}
            disabled={loading || !ytUrl.trim()}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <span>Analyze Video Sentiment</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className={styles.errorBanner}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{error}</span>
          <button className={styles.errorDismiss} onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <section className={styles.loadingSection}>
          <div className={styles.loadingPulse}>
            <div className={styles.loadingOrb} />
            <h3>Analyzing Comments & Sentiment</h3>
            <p>Processing viewer reactions and generating insights...</p>
            <div className={styles.loadingBars}>
              <div className={styles.loadingBar} style={{ animationDelay: "0s" }} />
              <div className={styles.loadingBar} style={{ animationDelay: "0.2s" }} />
              <div className={styles.loadingBar} style={{ animationDelay: "0.4s" }} />
              <div className={styles.loadingBar} style={{ animationDelay: "0.6s" }} />
              <div className={styles.loadingBar} style={{ animationDelay: "0.8s" }} />
            </div>
          </div>
        </section>
      )}

      {/* Results Dashboard */}
      {analysis && !loading && (
        <section className={`${styles.results} ${animateResults ? styles.resultsVisible : ""}`} ref={resultsRef}>
          {/* Results Header */}
          <div className={styles.resultsHeader}>
            <h2 className={styles.resultsTitle}>Analysis Results</h2>
            <div className={styles.resultsMeta}>
              <span className={styles.metaBadge}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {analysis.comments_analyzed || data.comments_analyzed} comments
              </span>
              <span className={styles.metaBadge}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                {accuracy} accuracy
              </span>
            </div>
          </div>

          {/* Top Row: Rating + Sentiment */}
          <div className={styles.topRow}>
            {/* Overall Rating Card */}
            <div className={`${styles.card} ${styles.ratingCard}`}>
              <div className={styles.ratingVisual}>
                <svg className={styles.ratingCircle} viewBox="0 0 160 160">
                  <defs>
                    <linearGradient id="ratingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={getRatingColor(analysis.overall_rating)} />
                      <stop offset="100%" stopColor={getRatingColorEnd(analysis.overall_rating)} />
                    </linearGradient>
                  </defs>
                  <circle className={styles.ratingTrack} cx="80" cy="80" r="65" />
                  <circle
                    className={styles.ratingProgress}
                    cx="80"
                    cy="80"
                    r="65"
                    style={{
                      strokeDasharray: 408.4,
                      strokeDashoffset: animateResults ? 408.4 - (analysis.overall_rating / 10) * 408.4 : 408.4,
                    }}
                  />
                </svg>
                <div className={styles.ratingCenter}>
                  <span className={styles.ratingNumber}>{analysis.overall_rating}</span>
                  <span className={styles.ratingOutOf}>/10</span>
                </div>
              </div>
              <h3 className={styles.cardTitle}>Overall Rating</h3>
              <p className={styles.ratingDesc}>{analysis.rating_explanation}</p>
            </div>

            {/* Sentiment Card */}
            <div className={`${styles.card} ${styles.sentimentCard}`}>
              <div className={`${styles.sentimentBadge} ${styles[`sentiment_${analysis.sentiment}`]}`}>
                <span className={styles.sentimentEmoji}>{getSentimentEmoji(analysis.sentiment)}</span>
                <span className={styles.sentimentText}>{analysis.sentiment?.toUpperCase()}</span>
              </div>
              <h3 className={styles.cardTitle}>Viewer Sentiment</h3>

              <div className={styles.sentimentMeter}>
                <div className={styles.meterLabels}>
                  <span>Negative</span>
                  <span>Neutral</span>
                  <span>Positive</span>
                </div>
                <div className={styles.meterTrack}>
                  <div
                    className={styles.meterFill}
                    style={{
                      width: animateResults ? `${getSentimentPosition(analysis.sentiment)}%` : "0%",
                      background: getSentimentGradient(analysis.sentiment),
                    }}
                  />
                  <div
                    className={styles.meterIndicator}
                    style={{
                      left: animateResults ? `${getSentimentPosition(analysis.sentiment)}%` : "0%",
                    }}
                  />
                </div>
              </div>

              <div className={styles.commentsCount}>
                <div className={styles.countNumber}>{analysis.comments_analyzed || data.comments_analyzed}</div>
                <div className={styles.countLabel}>Comments Analyzed</div>
              </div>
            </div>
          </div>

          {/* Content Match Scores */}
          <div className={`${styles.card} ${styles.scoresCard}`}>
            <h3 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Content Match Scores
            </h3>
            <div className={styles.scoresGrid}>
              {/* Title Match */}
              <div className={styles.scoreItem}>
                <div className={styles.scoreHeader}>
                  <div className={styles.scoreInfo}>
                    <span className={styles.scoreIcon}>📝</span>
                    <span className={styles.scoreName}>Title Match</span>
                  </div>
                  <span className={styles.scoreValue}>{analysis.title_match.score}/10</span>
                </div>
                <div className={styles.scoreBarTrack}>
                  <div
                    className={styles.scoreBarFill}
                    style={{
                      width: animateResults ? `${analysis.title_match.score * 10}%` : "0%",
                      background: getScoreGradient(analysis.title_match.score),
                    }}
                  />
                </div>
                <p className={styles.scoreExplanation}>{analysis.title_match.explanation}</p>
              </div>

              {/* Description Match */}
              <div className={styles.scoreItem}>
                <div className={styles.scoreHeader}>
                  <div className={styles.scoreInfo}>
                    <span className={styles.scoreIcon}>📄</span>
                    <span className={styles.scoreName}>Description Match</span>
                  </div>
                  <span className={styles.scoreValue}>{analysis.description_match.score}/10</span>
                </div>
                <div className={styles.scoreBarTrack}>
                  <div
                    className={styles.scoreBarFill}
                    style={{
                      width: animateResults ? `${analysis.description_match.score * 10}%` : "0%",
                      background: getScoreGradient(analysis.description_match.score),
                    }}
                  />
                </div>
                <p className={styles.scoreExplanation}>{analysis.description_match.explanation}</p>
              </div>
            </div>
          </div>

          {/* Bottom Row: Engagement + Consensus */}
          <div className={styles.bottomRow}>
            {/* Engagement Assessment */}
            <div className={`${styles.card} ${styles.engagementCard}`}>
              <h3 className={styles.cardTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                Engagement Assessment
              </h3>
              <p className={styles.cardText}>{analysis.engagement_assessment}</p>
            </div>

            {/* General Consensus */}
            <div className={`${styles.card} ${styles.consensusCard}`}>
              <h3 className={styles.cardTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                General Consensus
              </h3>
              <p className={styles.cardText}>{analysis.general_consensus}</p>
            </div>
          </div>

          {/* Limitations */}
          <div className={`${styles.card} ${styles.limitationsCard}`}>
            <h3 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Analysis Limitations
            </h3>
            <p className={styles.cardText}>{analysis.limitations}</p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>YT Sentiment Analyzer © 2026</span>
          <span className={styles.footerDot}>•</span>
          <span>AI-Powered Video Analysis</span>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07070d' }} />}>
      <SentimentDashboardInner />
    </Suspense>
  );
}

// ===== Helpers =====
function getSentimentEmoji(sentiment) {
  const map = { positive: "😊", negative: "😞", neutral: "😐", mixed: "🤔" };
  return map[sentiment] || "📊";
}

function getSentimentPosition(sentiment) {
  const map = { negative: 15, mixed: 40, neutral: 50, positive: 85 };
  return map[sentiment] || 50;
}

function getSentimentGradient(sentiment) {
  const map = {
    negative: "linear-gradient(90deg, #ef4444, #f87171)",
    positive: "linear-gradient(90deg, #22c55e, #4ade80)",
    neutral: "linear-gradient(90deg, #f59e0b, #fbbf24)",
    mixed: "linear-gradient(90deg, #8b5cf6, #a78bfa)",
  };
  return map[sentiment] || map.neutral;
}

function getRatingColor(rating) {
  if (rating <= 3) return "#ef4444";
  if (rating <= 5) return "#f59e0b";
  if (rating <= 7) return "#eab308";
  return "#22c55e";
}

function getRatingColorEnd(rating) {
  if (rating <= 3) return "#f87171";
  if (rating <= 5) return "#fbbf24";
  if (rating <= 7) return "#facc15";
  return "#4ade80";
}

function getScoreGradient(score) {
  if (score <= 3) return "linear-gradient(90deg, #ef4444, #f87171)";
  if (score <= 5) return "linear-gradient(90deg, #f59e0b, #fbbf24)";
  if (score <= 7) return "linear-gradient(90deg, #eab308, #facc15)";
  return "linear-gradient(90deg, #22c55e, #4ade80)";
}
