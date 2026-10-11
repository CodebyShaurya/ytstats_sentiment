"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDogMascot } from "@/lib/mascot";
import {
  getAllRemainingQuotas,
  canSearch,
  recordSearchUsage,
  DAILY_LIMITS,
} from "@/lib/quota";
import styles from "./page.module.css";

const API_BASE = "/api/youtube";

// Brand Ambassador Assets
const ASSETS = {
  logo: "/logo.png",
  // avatar: "https://polo-pecan-73837341.figma.site/_assets/v11/e62173d41f91350a59628e8a9a55ae078a886fb9.png?w=128",
  bottomLeft: "https://polo-pecan-73837341.figma.site/_assets/v11/8d44b25186ef45a5789c74668fb781cea4e1ff49.png",
  bottomCenter: "https://polo-pecan-73837341.figma.site/_assets/v11/96745c4e72ad5c5208e53a885df797fd82cd854a.png?h=1024",
  bottomRight: "https://polo-pecan-73837341.figma.site/_assets/v11/81bd2e7a66b58f3d8f3ad78fd1ebf01af8dfdee1.png",


};

// Helper: Extract YouTube Video ID for iframe embedding
function extractYouTubeVideoId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function SentimentDashboardInner() {
  const searchParams = useSearchParams();
  const [ytUrl, setYtUrl] = useState("");
  const [activeVideoUrl, setActiveVideoUrl] = useState("");
  // Slider for analysis depth (1 = Fast ~50, 2 = Balanced ~200, 3 = Deep ~500)
  const [sliderVal, setSliderVal] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quotaAlert, setQuotaAlert] = useState(null);
  const [data, setData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [animateResults, setAnimateResults] = useState(false);
  const [mode, setMode] = useState("watcher"); // "watcher" or "creator"
  const [quotas, setQuotas] = useState({ fast: 3, balanced: 2, deep: 1 });
  const resultsRef = useRef(null);

  // Map slider value (1, 2, 3) to accuracy string and quota key
  const accuracyLevels = ["low", "medium", "high"];
  const accuracy = accuracyLevels[sliderVal - 1] || "medium";
  const currentModeKey = sliderVal === 1 ? "fast" : sliderVal === 2 ? "balanced" : "deep";

  // Load saved mode and daily quotas from localStorage on client mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("yt_sentiment_user_mode");
      if (savedMode === "creator" || savedMode === "watcher") {
        setMode(savedMode);
      }
      setQuotas(getAllRemainingQuotas());
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    try {
      localStorage.setItem("yt_sentiment_user_mode", newMode);
    } catch (e) { }
  };

  // Check for URL params from browser extension or query
  useEffect(() => {
    const urlParam = searchParams.get("yturl");
    if (urlParam) {
      setYtUrl(urlParam);
      setTimeout(() => handleAnalyze(urlParam), 400);
    }
  }, [searchParams]);

  async function handleAnalyze(overrideUrl) {
    const url = (overrideUrl || ytUrl).trim();
    if (!url) return;

    // Check daily search quota for the selected depth
    if (!canSearch(currentModeKey)) {
      const modeName = currentModeKey.charAt(0).toUpperCase() + currentModeKey.slice(1);
      const limit = DAILY_LIMITS[currentModeKey];
      setQuotaAlert(
        `Daily limit reached for ${modeName} search (${limit}/${limit} used today). Quotas reset at midnight. You have ${quotas[currentModeKey === "fast" ? "balanced" : "fast"]
        } searches available in other modes.`
      );
      return;
    }

    setLoading(true);
    setError(null);
    setQuotaAlert(null);
    setAnimateResults(false);
    setHasSearched(true);
    setActiveVideoUrl(url);

    try {
      const apiUrl = `${API_BASE}?yturl=${encodeURIComponent(url)}&accuracy=${accuracy}`;
      const res = await fetch(apiUrl);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(json?.error || json?.message || `Server error: ${res.status}`);
      }
      if (!json?.analysis) throw new Error("Invalid response from server");

      // Record successful search in localStorage
      const updatedQuotas = recordSearchUsage(currentModeKey);
      if (updatedQuotas) setQuotas(updatedQuotas);

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
  const relatedVideos = data?.related_videos;
  const lackingTopicVideos = data?.lacking_topic_videos;
  const embedVideoId = extractYouTubeVideoId(activeVideoUrl || ytUrl);

  // Compute Brand Ambassador Dog Mascot based on overall rating and sentiment
  const mascot = analysis ? getDogMascot(analysis.overall_rating, analysis.sentiment) : null;

  // Render the search card with input, slider, accuracy quotas, and analyze button
  const renderSearchCard = (isCompact = false) => (
    <div className={`${styles.searchCardWrapper} ${isCompact ? styles.searchCardCompact : ""}`}>
      {/* Row 1: URL Input and Analyze Button */}
      <div className={styles.searchInputRow}>
        <svg
          className={styles.searchIcon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          placeholder={
            mode === "creator"
              ? "Paste your YouTube Video URL to analyze audience response..."
              : "Paste YouTube Video URL to check viewer consensus..."
          }
          className={styles.searchInput}
          value={ytUrl}
          onChange={(e) => setYtUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
        />

        {ytUrl && (
          <button
            type="button"
            className={styles.clearInputBtn}
            onClick={() => setYtUrl("")}
            title="Clear URL"
            aria-label="Clear URL"
          >
            ✕
          </button>
        )}

        <button
          className={styles.analyzeBtn}
          onClick={() => handleAnalyze()}
          disabled={loading || !ytUrl.trim() || !canSearch(currentModeKey)}
          title={!canSearch(currentModeKey) ? "Daily quota exhausted for this mode" : "Analyze video"}
        >
          {loading ? (
            <>
              <div className={styles.spinnerSmall} />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span className="text-md md:text-xl">Analyze</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Row 2: Analysis Accuracy Slider & Daily Quota Badges */}
      <div className={styles.searchControlsRow}>
        <div className={styles.sliderGroup}>
          <span className={styles.sliderLabel}>Analysis Depth:</span>
          <div className={styles.sliderTrackWrapper}>
            <input
              type="range"
              min="1"
              max="3"
              step="1"
              value={sliderVal}
              onChange={(e) => {
                setSliderVal(parseInt(e.target.value, 10));
                setQuotaAlert(null);
              }}
              className={styles.sliderInput}
              aria-label="Analysis depth slider"
            />
          </div>
          <span className={`md:block hidden ` + styles.sliderBadge}>
            {sliderVal === 1
              ? `Fast (~50) • ${quotas.fast}/3 today`
              : sliderVal === 2
                ? `Balanced (~200) • ${quotas.balanced}/2 today`
                : `Deep (~500) • ${quotas.deep}/1 today`}
          </span>
        </div>

        {/* Segmented Depth Switch with Quota Counters */}
        <div className={styles.accuracySegmented}>
          <button
            type="button"
            className={`${styles.segmentBtn} ${sliderVal === 1 ? styles.segmentBtnActive : ""}`}
            onClick={() => {
              setSliderVal(1);
              setQuotaAlert(null);
            }}
          >
            <span>Fast</span>
            <span
              className={`${styles.quotaPillBadge} ${quotas.fast === 0 ? styles.quotaPillExhausted : ""}`}
              title={`${quotas.fast} of 3 fast searches left today`}
            >
              {quotas.fast}/3
            </span>
          </button>
          <button
            type="button"
            className={`${styles.segmentBtn} ${sliderVal === 2 ? styles.segmentBtnActive : ""}`}
            onClick={() => {
              setSliderVal(2);
              setQuotaAlert(null);
            }}
          >
            <span>Balanced</span>
            <span
              className={`${styles.quotaPillBadge} ${quotas.balanced === 0 ? styles.quotaPillExhausted : ""}`}
              title={`${quotas.balanced} of 2 balanced searches left today`}
            >
              {quotas.balanced}/2
            </span>
          </button>
          <button
            type="button"
            className={`${styles.segmentBtn} ${sliderVal === 3 ? styles.segmentBtnActive : ""}`}
            onClick={() => {
              setSliderVal(3);
              setQuotaAlert(null);
            }}
          >
            <span>Deep</span>
            <span
              className={`${styles.quotaPillBadge} ${quotas.deep === 0 ? styles.quotaPillExhausted : ""}`}
              title={`${quotas.deep} of 1 deep search left today`}
            >
              {quotas.deep}/1
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* ================= REUSABLE NAVIGATION ================= */}
      <Navbar
        mode={mode}
        onModeChange={handleModeChange}
        hasSearched={hasSearched}
        onResetSearch={() => {
          setHasSearched(false);
          setData(null);
          setError(null);
          setQuotaAlert(null);
        }}
        renderSearchCompact={() => renderSearchCard(true)}
      />

      {/* Quota Limit Notice */}
      {quotaAlert && (
        <div className={styles.quotaBanner}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{quotaAlert}</span>
          </div>
          <button className={styles.errorDismiss} onClick={() => setQuotaAlert(null)}>
            ✕
          </button>
        </div>
      )}

      {/* ================= HERO SECTION ================= */}
      <section className={`${styles.heroSection} ${hasSearched ? styles.heroSectionSearched : ""}`}>
        {!hasSearched && (
          <div className={styles.heroCenterText}>
            <h1 className={styles.heroHeading}>
              <span className="animate-word-pop delay-200">
                {mode === "creator" ? "Grow" : "Everything"}
              </span>{" "}
              <span className={styles.wordSpacing} />
              <br />
              <span className="animate-word-pop delay-400">
                {mode === "creator" ? "With" : "Your"}
              </span>{" "}
              <span className="animate-word-pop delay-500">
                {mode === "creator" ? "Audience" : "Users"}
              </span>{" "}
              <span className="animate-word-pop delay-600">
                {mode === "creator" ? "Insights" : "Feel"}
              </span>
            </h1>

            <p className={`${styles.heroSubtitle} animate-fade-up delay-600`}>
              {mode === "creator"
                ? "AI-powered YouTube audience feedback & retention audit. Pinpoint audience pain points, uncover missing topics for your next video, and maximize engagement."
                : "AI-powered YouTube video sentiment analyzer and viewer emotion breakdown. Explore authentic reviews, feedback, and audience reactions instantly."}
            </p>

            {/* Main Hero Search Card */}
            {renderSearchCard(false)}
          </div>
        )}

        {/* Bottom 3 Images Section */}
        <div className={`${styles.bottomImagesContainer} ${hasSearched ? styles.bottomImagesBlurred : ""}`}>
          <div className={`${styles.bottomImgCol} ${styles.bottomLeftCol} animate-photo-reveal delay-700`}>
            <img src={ASSETS.bottomLeft} alt="Pet item left" className={styles.heroBottomImg} />
          </div>

          <div className={`${styles.bottomImgCol} ${styles.bottomCenterCol} animate-photo-reveal delay-600`}>
            <img src={ASSETS.bottomCenter} alt="Pet item center" className={styles.heroBottomImg} />
          </div>

          <div className={`${styles.bottomImgCol} ${styles.bottomRightCol} animate-photo-reveal delay-800`}>
            <img src={ASSETS.bottomRight} alt="Pet item right" className={styles.heroBottomImg} />
          </div>
        </div>
      </section>

      {/* Error Notice */}
      {error && (
        <div className={styles.errorBanner}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>{error}</span>
          </div>
          <button className={styles.errorDismiss} onClick={() => setError(null)}>
            ✕
          </button>
        </div>
      )}

      {/* Loading Box */}
      {loading && (
        <div className={styles.loadingBox}>
          <div className={styles.loadingSpinnerLarge} />
          <h2 className={styles.loadingHeading}>Analyzing Audience Sentiment</h2>
          <p className={styles.loadingSub}>
            Scraping comments and extracting emotions, match scores & key themes...
          </p>
        </div>
      )}

      {/* ================= RESULTS: FIXED LEFT SIDEBAR & SCROLLING BREAKDOWN ================= */}
      {hasSearched && (
        <section className={styles.resultsSectionFull} ref={resultsRef}>
          <div className={styles.dashboardLayout}>
            {/* LEFT SIDEBAR: Embedded Video + Big Dog Brand Ambassador + 4 Re-ordered Metrics */}
            <aside className={styles.sidebarSticky}>
              {/* YouTube Video Embedded */}
              {embedVideoId && (
                <div className={styles.sidebarVideoCard}>
                  <div className={styles.sidebarVideoHeader}>
                    <div className={styles.sidebarVideoTitle}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#E86A10">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      <span>Active Video</span>
                    </div>
                    <a
                      href={activeVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.videoLinkBadge}
                      title="Open on YouTube"
                    >
                      <span>YouTube</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="7 7 17 7 17 17" />
                      </svg>
                    </a>
                  </div>

                  <div className={styles.videoIframeWrapper}>
                    <iframe
                      className={styles.videoIframe}
                      src={`https://www.youtube-nocookie.com/embed/${embedVideoId}`}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* BRAND AMBASSADOR DOG MASCOT CARD (BIG SIZE PHOTO EXPRESSING EMOTION) */}
              {mascot && (
                <div className={styles.mascotSidebarCard}>
                  <div
                    className={styles.mascotSidebarBadge}
                    style={{
                      background: mascot.bgColor,
                      color: mascot.themeColor,
                      border: `1px solid ${mascot.borderColor}`,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span>{mascot.badge}</span>
                  </div>

                  <div className={styles.mascotSidebarImgWrapper}>
                    <img
                      src={mascot.src}
                      alt={`${mascot.name} - ${mascot.title}`}
                      className={styles.mascotSidebarImg}
                      onError={(e) => {
                        if (mascot.fallbackUrl && e.currentTarget.src !== mascot.fallbackUrl) {
                          e.currentTarget.src = mascot.fallbackUrl;
                        }
                      }}
                    />
                  </div>

                  <h3 className={styles.mascotSidebarTitle}>{mascot.name}</h3>
                  <div className={styles.mascotSidebarSubtitle}>{mascot.title}</div>

                  <p className={styles.mascotSidebarFeedback}>
                    {mode === "creator" ? mascot.creatorFeedback : mascot.watcherFeedback}
                  </p>
                </div>
              )}

              {/* 4 SIDEBAR PLACEHOLDERS: ORDER = Overall Rating -> Sentiment -> Relevance Index -> Audience Volume */}
              <div className={styles.placeholdersGrid}>
                {/* 1. Overall Rating (First) */}
                <div className={styles.placeholderCard}>
                  <div className={styles.placeholderHeader}>
                    <span className={styles.placeholderTitle}>
                      {mode === "creator" ? "Content Quality Rating" : "Overall Rating"}
                    </span>
                    <span className={styles.placeholderOrderBadge}>1 of 4</span>
                  </div>
                  <div
                    className={styles.placeholderValue}
                    style={{ color: mascot?.themeColor || "var(--accent-orange)" }}
                  >
                    {analysis ? `${analysis.overall_rating} / 10` : "—"}
                  </div>
                  <div className={styles.placeholderDesc}>
                    {mode === "creator"
                      ? "Aggregated audience satisfaction score"
                      : "Aggregated quality score from viewers"}
                  </div>
                </div>

                {/* 2. Viewer Sentiment / Sentiment Bias (Second) */}
                <div className={styles.placeholderCard}>
                  <div className={styles.placeholderHeader}>
                    <span className={styles.placeholderTitle}>
                      {mode === "creator" ? "Audience Sentiment" : "Viewer Sentiment"}
                    </span>
                    <span className={styles.placeholderOrderBadge}>2 of 4</span>
                  </div>
                  <div
                    className={styles.placeholderValue}
                    style={{ color: mascot?.themeColor || "var(--accent-orange)" }}
                  >
                    {analysis ? analysis.sentiment?.toUpperCase() : "—"}
                  </div>
                  <div className={styles.placeholderDesc}>
                    {mode === "creator"
                      ? "Dominant emotional mood in comments"
                      : "Dominant audience feedback polarity"}
                  </div>
                </div>

                {/* 3. Relevance Index (Third) */}
                <div className={styles.placeholderCard}>
                  <div className={styles.placeholderHeader}>
                    <span className={styles.placeholderTitle}>
                      {mode === "creator" ? "Expectation Delivery" : "Relevance Index"}
                    </span>
                    <span className={styles.placeholderOrderBadge}>3 of 4</span>
                  </div>
                  <div className={styles.placeholderValue}>
                    {analysis ? `${analysis.title_match?.score || 0} / 10` : "—"}
                  </div>
                  <div className={styles.placeholderDesc}>
                    {mode === "creator"
                      ? "Title promise delivery vs viewer expectations"
                      : "Title claim accuracy vs actual viewer feedback"}
                  </div>
                </div>

                {/* 4. Audience Volume (Fourth) */}
                <div className={styles.placeholderCard}>
                  <div className={styles.placeholderHeader}>
                    <span className={styles.placeholderTitle}>
                      {mode === "creator" ? "Audience Sample" : "Audience Volume"}
                    </span>
                    <span className={styles.placeholderOrderBadge}>4 of 4</span>
                  </div>
                  <div className={styles.placeholderValue}>
                    {analysis ? `${analysis.comments_analyzed || data?.comments_analyzed || 0}` : "—"}
                  </div>
                  <div className={styles.placeholderDesc}>
                    {mode === "creator"
                      ? "Total viewer comments processed in sample"
                      : "Comments sampled across thread"}
                  </div>
                </div>
              </div>
            </aside>

            {/* RIGHT COLUMN: Detailed Sentiment & Content Breakdown (Scrolls Freely) */}
            <main className={styles.breakdownContainer}>
              {analysis && !loading && (
                <>
                  {/* Header Title with Mode Perspective */}
                  <div className={styles.resultsHeader}>
                    <div>
                      <h2 className={styles.resultsTitle}>
                        {mode === "creator" ? "Audience Feedback Diagnostics" : "Detailed Breakdown"}
                      </h2>
                      <span style={{ fontSize: "13px", color: "#556e55", fontWeight: 600 }}>
                        {mode === "creator"
                          ? "Creator Mode: Metrics tailored for retention, topic expansion, and content optimization"
                          : "Watcher Mode: Metrics tailored for time-saving, clickbait detection, and quality validation"}
                      </span>
                    </div>

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
                        {accuracy} mode
                      </span>
                    </div>
                  </div>

                  {/* Top Row: Overall Rating & Viewer Sentiment */}
                  <div className={styles.topRow}>
                    {/* Overall Rating Card */}
                    <div className={styles.card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 className={styles.cardTitle}>
                          {mode === "creator" ? "Audience Retention Score" : "Overall Rating"}
                        </h3>
                        {mascot && (
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: mascot.themeColor,
                              background: mascot.bgColor,
                              padding: "3px 10px",
                              borderRadius: "9999px",
                              border: `1px solid ${mascot.borderColor}`,
                            }}
                          >
                            Ambassador: {mascot.name}
                          </span>
                        )}
                      </div>

                      <div className={styles.ratingCardInner}>
                        <div className={styles.ratingRingWrapper}>
                          <svg className={styles.ratingRingSvg} viewBox="0 0 120 120">
                            <circle className={styles.ratingRingTrack} cx="60" cy="60" r="50" />
                            <circle
                              className={styles.ratingRingProgress}
                              cx="60"
                              cy="60"
                              r="50"
                              style={{
                                strokeDasharray: 314,
                                strokeDashoffset: animateResults
                                  ? 314 - (analysis.overall_rating / 10) * 314
                                  : 314,
                              }}
                            />
                          </svg>
                          <div className={styles.ratingCenterContent}>
                            <div className={styles.ratingNumBig}>{analysis.overall_rating}</div>
                            <div className={styles.ratingOutOfText}>/ 10</div>
                          </div>
                        </div>
                        <p className={styles.ratingExplanation}>{analysis.rating_explanation}</p>
                      </div>
                    </div>

                    {/* Viewer Sentiment Card */}
                    <div className={styles.card}>
                      <h3 className={styles.cardTitle}>
                        {mode === "creator" ? "Emotional Breakdown" : "Viewer Sentiment"}
                      </h3>
                      <div className={`${styles.sentimentPill} ${styles[`sentiment_${analysis.sentiment}`]}`}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{analysis.sentiment?.toUpperCase()}</span>
                      </div>

                      <div className={styles.meterContainer}>
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
                        </div>
                      </div>

                      <div className={styles.commentsCountPill}>
                        <span className={styles.commentsCountLabel}>Total Sample Analyzed</span>
                        <span className={styles.commentsCountNum}>
                          {analysis.comments_analyzed || data.comments_analyzed} comments
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content Match Scores */}
                  <div className={`${styles.card} ${styles.scoresCard}`}>
                    <h3 className={styles.cardTitle}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                      {mode === "creator" ? "Expectation & Packaging Alignment" : "Content Match Scores"}
                    </h3>

                    <div className={styles.scoresGrid}>
                      {/* Title Match */}
                      <div className={styles.scoreItem}>
                        <div className={styles.scoreHeader}>
                          <div className={styles.scoreInfo}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            <span>
                              {mode === "creator" ? "Title Promise Fulfillment" : "Title Match (Clickbait Check)"}
                            </span>
                          </div>
                          <span className={styles.scoreValue}>{analysis.title_match.score} / 10</span>
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="8" y1="6" x2="21" y2="6" />
                              <line x1="8" y1="12" x2="21" y2="12" />
                              <line x1="8" y1="18" x2="21" y2="18" />
                              <line x1="3" y1="6" x2="3.01" y2="6" />
                              <line x1="3" y1="12" x2="3.01" y2="12" />
                              <line x1="3" y1="18" x2="3.01" y2="18" />
                            </svg>
                            <span>
                              {mode === "creator" ? "Description Alignment" : "Description Truthfulness"}
                            </span>
                          </div>
                          <span className={styles.scoreValue}>{analysis.description_match.score} / 10</span>
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

                  {/* Bottom Row: Engagement Assessment & General Consensus */}
                  <div className={styles.bottomRow}>
                    {/* Engagement Assessment */}
                    <div className={styles.card}>
                      <h3 className={styles.cardTitle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                        </svg>
                        {mode === "creator" ? "Audience Engagement Health" : "Viewer Discussion Vibe"}
                      </h3>
                      <p className={styles.cardText}>{analysis.engagement_assessment}</p>
                    </div>

                    {/* General Consensus */}
                    <div className={styles.card}>
                      <h3 className={styles.cardTitle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {mode === "creator" ? "Core Audience Takeaways" : "General Community Consensus"}
                      </h3>
                      <p className={styles.cardText}>{analysis.general_consensus}</p>
                    </div>
                  </div>

                  {/* Analysis Limitations */}
                  <div className={`${styles.card} ${styles.limitationsCard}`}>
                    <h3 className={styles.cardTitle}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      Analysis Limitations & Confidence
                    </h3>
                    <p className={styles.cardText}>{analysis.limitations}</p>
                  </div>

                  {/* Lacking Topics & Gap Fill Videos */}
                  {((analysis.lacking_topics && analysis.lacking_topics.length > 0) ||
                    (lackingTopicVideos && lackingTopicVideos.length > 0)) && (
                      <div className={`${styles.card} ${styles.lackingTopicsSection}`}>
                        <h3 className={styles.cardTitle}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          {mode === "creator"
                            ? "Content Opportunities For Your Next Video"
                            : "Identified Content Gaps & Companion Videos"}
                        </h3>
                        <p className={styles.cardText}>
                          {mode === "creator"
                            ? "Topics your viewers asked for or felt were missing in this video — prime opportunities for your next upload!"
                            : "Topics viewers felt were missing, incomplete, or unexplained, along with recommended companion videos to fill the gap."}
                        </p>

                        <div className={styles.topicList}>
                          {lackingTopicVideos && lackingTopicVideos.length > 0 ? (
                            lackingTopicVideos.map((item, idx) => (
                              <div key={idx} className={styles.topicCard}>
                                <div className={styles.topicHeader}>
                                  <div className={styles.topicTitleBadge}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                      <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <span>{item.topic}</span>
                                  </div>
                                  <span className={styles.topicTag}>
                                    {mode === "creator" ? "Viewer Demand" : "Missing Detail"}
                                  </span>
                                </div>
                                <p className={styles.topicReason}>{item.reason}</p>
                                {(item.video?.url || item.link) && (
                                  <div className={styles.topicVideoRecommendation}>
                                    <div className={styles.recommendationLabel}>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                                        <polyline points="17 2 12 7 7 2" />
                                      </svg>
                                      <span>
                                        Suggested: <strong>{item.video?.title || item.suggestion || "Video Resource"}</strong>
                                      </span>
                                    </div>
                                    <a
                                      href={item.video?.url || item.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={styles.videoPillLink}
                                    >
                                      <span>Watch Video</span>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="7" y1="17" x2="17" y2="7" />
                                        <polyline points="7 7 17 7 17 17" />
                                      </svg>
                                    </a>
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            analysis.lacking_topics?.map((item, idx) => (
                              <div key={idx} className={styles.topicCard}>
                                <div className={styles.topicHeader}>
                                  <div className={styles.topicTitleBadge}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                      <circle cx="12" cy="10" r="3" />
                                    </svg>
                                    <span>{item.topic}</span>
                                  </div>
                                  <span className={styles.topicTag}>Topic Gap</span>
                                </div>
                                <p className={styles.topicReason}>{item.reason}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                  {/* Related Videos */}
                  {relatedVideos && relatedVideos.length > 0 && (
                    <div className={`${styles.card} ${styles.lackingTopicsSection}`}>
                      <h3 className={styles.cardTitle}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                        {mode === "creator"
                          ? "Competitor & Related Content Benchmarks"
                          : "Related Videos to Explore"}
                      </h3>
                      <p className={styles.cardText}>
                        {mode === "creator"
                          ? "Videos covering similar topics or adjacent themes in this niche."
                          : "Videos exploring similar subjects or alternative perspectives on this topic."}
                      </p>

                      <div className={styles.relatedVideosGrid}>
                        {relatedVideos.map((video, idx) => (
                          <a
                            key={idx}
                            href={video.url || video.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.relatedVideoCard}
                          >
                            <div className={styles.relatedVideoHeader}>
                              <div className={styles.relatedVideoIcon}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <polygon points="5 3 19 12 5 21 5 3" />
                                </svg>
                              </div>
                              <div className={styles.relatedVideoTitle}>{video.title}</div>
                            </div>
                            <div className={styles.relatedVideoFooter}>
                              <span className={styles.relatedVideoChannel}>
                                {video.channel || "YouTube"}
                              </span>
                              <span className={styles.relatedVideoWatch}>
                                <span>Watch</span>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <line x1="7" y1="17" x2="17" y2="7" />
                                  <polyline points="7 7 17 7 17 17" />
                                </svg>
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </section>
      )}

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#EFFDF0" }} />}>
      <SentimentDashboardInner />
    </Suspense>
  );
}

// ===== Helpers (No Emojis, Pure Math / Color Coordinates) =====
function getSentimentPosition(sentiment) {
  const map = { negative: 18, mixed: 45, neutral: 50, positive: 88 };
  return map[sentiment] || 50;
}

function getSentimentGradient(sentiment) {
  const map = {
    negative: "linear-gradient(90deg, #d93829, #f87171)",
    positive: "linear-gradient(90deg, #1b8a36, #4ade80)",
    neutral: "linear-gradient(90deg, #d97706, #fbbf24)",
    mixed: "linear-gradient(90deg, #7c3aed, #a78bfa)",
  };
  return map[sentiment] || map.neutral;
}

function getScoreGradient(score) {
  if (score <= 3) return "linear-gradient(90deg, #d93829, #f87171)";
  if (score <= 5) return "linear-gradient(90deg, #d97706, #fbbf24)";
  if (score <= 7) return "linear-gradient(90deg, #eab308, #facc15)";
  return "linear-gradient(90deg, #1b8a36, #4ade80)";
}
