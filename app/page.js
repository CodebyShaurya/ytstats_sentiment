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
  bottomLeft: "/learner.png",
  bottomCenter: "/Watcher.png",
  bottomRight: "/Creator.png",


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
      if (savedMode === "creator" || savedMode === "watcher" || savedMode === "learner") {
        queueMicrotask(() => setMode(savedMode));
      }
      const q = getAllRemainingQuotas();
      queueMicrotask(() => setQuotas(q));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    try {
      localStorage.setItem("yt_sentiment_user_mode", newMode);
    } catch (e) { }

    // If a video is already loaded, automatically re-analyze with the new mode
    if (activeVideoUrl) {
      handleAnalyze(activeVideoUrl, newMode);
    }
  };

  // Check for URL params from browser extension or query
  useEffect(() => {
    const urlParam = searchParams.get("yturl");
    const modeParam = searchParams.get("mode");
    if (modeParam && ["learner", "watcher", "creator"].includes(modeParam)) {
      queueMicrotask(() => setMode(modeParam));
    }
    if (urlParam) {
      queueMicrotask(() => setYtUrl(urlParam));
      setTimeout(() => handleAnalyze(urlParam, modeParam || mode), 400);
    }
  }, [searchParams]);

  async function handleAnalyze(overrideUrl, overrideMode) {
    const targetMode = overrideMode || mode;
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
      const apiUrl = `${API_BASE}?yturl=${encodeURIComponent(url)}&accuracy=${accuracy}&mode=${encodeURIComponent(targetMode)}`;
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
      if (json.mode && ["learner", "watcher", "creator"].includes(json.mode)) {
        setMode(json.mode);
      }
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

  // Render the search card with mode switcher, input, slider (with quota badge), and analyze button
  const renderSearchCard = (isCompact = false) => (
    <div
      className={`${isCompact ? styles.searchCardCompact : styles.searchCardWrapper}`}
    >
      {/* Row 1: Mode Switcher Tabs inside Input Card */}
      <div className={styles.searchModeRow}>
        <div className={styles.searchModeInfo}>
          <span className={styles.searchModeLabel}>
            Mode:
          </span>
          <span className={styles.searchModeCurrent}>
            {mode} Mode
          </span>
        </div>

        <div className={styles.searchModePillGroup}>
          <button
            type="button"
            onClick={() => handleModeChange("watcher")}
            className={`${styles.searchModeBtn} ${mode === "watcher" ? styles.searchModeBtnActive : ""}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Watcher</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("learner")}
            className={`${styles.searchModeBtn} ${mode === "learner" ? styles.searchModeBtnActive : ""}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            <span>Learner</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("creator")}
            className={`${styles.searchModeBtn} ${mode === "creator" ? styles.searchModeBtnActive : ""}`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Creator</span>
          </button>
        </div>
      </div>

      {/* Row 2: URL Input Box with Generous Padding and Analyze Button */}
      <div className={styles.searchInputRow}>
        <div className={styles.inputFieldWrapper}>
          <svg
            className={styles.searchIcon}
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
                ? "Paste YouTube Video URL to analyze audience response & content ideas..."
                : mode === "learner"
                  ? "Paste educational tutorial or lecture YouTube URL to evaluate learning value..."
                  : "Paste YouTube Video URL to check viewer consensus..."
            }
            className={styles.urlInput}
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

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
              <span>Analyze</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Row 3: Only Keep the Slider + Quota Status Badge */}
      <div className={styles.searchSliderRow}>
        <div className={styles.searchSliderTrackGroup}>
          <span className={styles.searchSliderLabel}>
            Analysis Depth:
          </span>
          <div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative" }}>
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
              className={styles.searchSliderInput}
              aria-label="Analysis depth slider"
            />
          </div>
        </div>

        {/* Quota Badge Indicator next to the slider */}
        <div className={styles.searchQuotaBadge}>
          {sliderVal === 1
            ? `Fast (~50) • ${quotas.fast}/3 remaining today`
            : sliderVal === 2
              ? `Balanced (~200) • ${quotas.balanced}/2 remaining today`
              : `Deep (~500) • ${quotas.deep}/1 remaining today`}
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
                {mode === "creator" ? "Grow" : mode === "learner" ? "Learn" : "Understand"}
              </span>{" "}
              <span className={styles.wordSpacing} />
              <br />
              <span className="animate-word-pop delay-400">
                {mode === "creator" ? "With" : mode === "learner" ? "Smarter" : "The"}
              </span>{" "}
              <span className="animate-word-pop delay-500">
                {mode === "creator" ? "Audience" : mode === "learner" ? "With" : "Video"}
              </span>{" "}
              <span className="animate-word-pop delay-600">
                {mode === "creator" ? "Insights" : mode === "learner" ? "Insights" : "Feel"}
              </span>
            </h1>

            <p className={`${styles.heroSubtitle} animate-fade-up delay-600`}>
              {mode === "creator"
                ? "AI-powered YouTube audience feedback & retention audit. Pinpoint audience pain points, uncover missing topics for your next video, and maximize engagement."
                : mode === "learner"
                  ? "AI-powered educational review & key concept extractor. Assess tutorial quality, study takeaways, and prerequisite gaps before you invest hours watching."
                  : "AI-powered YouTube video sentiment analyzer and viewer emotion breakdown. Explore authentic reviews, feedback, and audience reactions instantly."}
            </p>

            {/* Main Hero Search Card */}
            {renderSearchCard(false)}
          </div>
        )}

        {/* Bottom Mascot Image - Anchored to right of screen, responsive, larger */}
        <div
          className={`absolute bottom-0 right-0 z-10 pointer-events-none flex items-end justify-end transition-all duration-700 ease-out pr-2 sm:pr-6 md:pr-10 lg:pr-16 pb-0 ${hasSearched ? "opacity-20 blur-md scale-95 pointer-events-none" : "opacity-100"
            }`}
        >
          <div className="relative group pointer-events-auto">
            {/* Ambient personality backglow */}
            <div
              className={`absolute -inset-6 rounded-full blur-3xl pointer-events-none transition-all duration-500 opacity-60 ${mode === "creator"
                  ? "bg-amber-500/25"
                  : mode === "learner"
                    ? "bg-emerald-500/25"
                    : "bg-indigo-500/25"
                }`}
            />
            <img
              src={
                mode === "creator"
                  ? ASSETS.bottomRight
                  : mode === "learner"
                    ? ASSETS.bottomLeft
                    : ASSETS.bottomCenter
              }
              alt={
                mode === "creator"
                  ? "Creator Pulse Ambassador"
                  : mode === "learner"
                    ? "Learner Pulse Ambassador"
                    : "Watcher Pulse Ambassador"
              }
              className="relative w-[300px] sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[680px] max-w-[50vw] h-auto max-h-[66vh] object-contain object-bottom drop-shadow-[0_30px_60px_rgba(0,0,0,0.85)] filter contrast-105 hover:scale-[1.02] transition-transform duration-300 select-none animate-photo-reveal"
            />
          </div>
        </div>
      </section>

      {/* Error Notice */}
      {
        error && (
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
        )
      }



      {/* ================= RESULTS: FIXED LEFT SIDEBAR & SCROLLING BREAKDOWN ================= */}
      {
        hasSearched && (
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


                {/* 4 SIDEBAR PLACEHOLDERS: ORDER = Overall Rating -> Sentiment -> Relevance Index -> Audience Volume */}
                <div className={styles.placeholdersGrid}>
                  {/* 1. Overall Rating (First) */}
                  {mascot && (
                    <div className={styles.mascotSidebarCard}>
                      <div
                        className={styles.mascotSidebarBadge}
                        style={{
                          background: mascot.bgColor,
                          color: mascot.themeColor,
                          border: `solid ${mascot.borderColor}`,
                        }}
                      >

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
                        {mode === "creator"
                          ? mascot.creatorFeedback
                          : mode === "learner"
                            ? (mascot.learnerFeedback || mascot.watcherFeedback)
                            : mascot.watcherFeedback}
                      </p>
                    </div>
                  )}

                  {/* 2. Viewer Sentiment / Sentiment Bias (Second) */}
                  <div className={styles.placeholderCard}>
                    <div className={styles.placeholderHeader}>
                      <span className={styles.placeholderTitle}>
                        {mode === "creator"
                          ? "Audience Sentiment"
                          : mode === "learner"
                            ? "Learner Reception"
                            : "Viewer Sentiment"}
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
                        : mode === "learner"
                          ? "Student satisfaction & feedback polarity"
                          : "Dominant audience feedback polarity"}
                    </div>
                  </div>

                  {/* 3. Relevance Index (Third) */}
                  <div className={styles.placeholderCard}>
                    <div className={styles.placeholderHeader}>
                      <span className={styles.placeholderTitle}>
                        {mode === "creator"
                          ? "Expectation Delivery"
                          : mode === "learner"
                            ? "Curriculum Match"
                            : "Relevance Index"}
                      </span>
                      <span className={styles.placeholderOrderBadge}>3 of 4</span>
                    </div>
                    <div className={styles.placeholderValue}>
                      {analysis ? `${analysis.title_match?.score ?? (typeof analysis.title_match === "number" ? analysis.title_match : 0)} / 10` : "—"}
                    </div>
                    <div className={styles.placeholderDesc}>
                      {mode === "creator"
                        ? "Title promise delivery vs viewer expectations"
                        : mode === "learner"
                          ? "Topic coverage vs title and claims"
                          : "Title claim accuracy vs actual viewer feedback"}
                    </div>
                  </div>

                  {/* 4. Audience Volume (Fourth) */}

                </div>
              </aside>

              {/* RIGHT COLUMN: Detailed Sentiment & Content Breakdown (Scrolls Freely) */}
              <main className={styles.breakdownContainer}>
                {/* Loading Box */}
                {
                  loading && (
                    <div className={styles.loadingBox}>
                      <div className={styles.loadingSpinnerLarge} />
                      <h2 className={styles.loadingHeading}>Analyzing Audience Sentiment</h2>
                      <p className={styles.loadingSub}>
                        Scraping comments and extracting emotions, match scores & key themes...
                      </p>
                    </div>
                  )
                }
                {analysis && !loading && (
                  <>
                    {/* Header Title with Mode Perspective */}
                    <div className={styles.resultsHeader}>
                      <div>
                        <h2 className={styles.resultsTitle}>
                          {mode === "creator"
                            ? "Audience Feedback Diagnostics"
                            : mode === "learner"
                              ? "Educational Breakdown & Takeaways"
                              : "Detailed Viewer Breakdown"}
                        </h2>
                        <span style={{ fontSize: "13px", color: "#556e55", fontWeight: 600 }}>
                          {mode === "creator"
                            ? "Creator Mode: Metrics tailored for retention, topic expansion, and content optimization"
                            : mode === "learner"
                              ? "Learner Mode: Evaluates instructional clarity, key concepts, and actionable takeaways"
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                          <h3 className={styles.cardTitle}>
                            {mode === "creator" ? "Audience Retention Score" : "Overall Rating"}
                          </h3>
                        </div>

                        {/* Mascot Photo Showcase Expressing the Emotion */}
                        {mascot && (
                          <div className={styles.ratingMascotHero}>
                            <div className={styles.ratingMascotImgWrap}>
                              <img
                                src={mascot.src}
                                alt={`${mascot.name} - ${mascot.title}`}
                                className={styles.ratingMascotImg}
                                onError={(e) => {
                                  if (mascot.fallbackUrl && e.currentTarget.src !== mascot.fallbackUrl) {
                                    e.currentTarget.src = mascot.fallbackUrl;
                                  }
                                }}
                              />
                            </div>
                            <div className={styles.ratingMascotInfo}>
                              <span
                                className={styles.ratingMascotBadge}
                                style={{
                                  background: mascot.bgColor,
                                  color: mascot.themeColor,
                                  border: `1px solid ${mascot.borderColor}`,
                                }}
                              >
                                {mascot.badge}
                              </span>
                              <div className={styles.ratingMascotName}>{mascot.name}</div>
                              <div className={styles.ratingMascotTitle}>{mascot.title}</div>
                            </div>
                          </div>
                        )}

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

                    {/* Analysis Limitations & Confidence */}
                    {analysis.limitations && (
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
                    )}

                    {/* Common Analysis Field: Actionable Guidance (Always Displayed) */}
                    {analysis.guidance && (
                      <div className={`${styles.card} ${styles.guidanceCard}`}>
                        <h3 className={styles.cardTitle}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                          </svg>
                          Actionable Guidance & Best Practices
                        </h3>
                        {renderGuidanceContent(analysis.guidance)}
                      </div>
                    )}

                    {/* ================= MODE-SPECIFIC OUTPUT (analysis.mode_output) ================= */}
                    {/* 1. LEARNER MODE OUTPUT */}
                    {mode === "learner" && (
                      <div className={styles.modeOutputWrapper}>
                        <div className={styles.modeOutputHeader}>
                          <span className={styles.modeOutputTag}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                              <path d="M6 12v5c3 3 9 3 12 0v-5" />
                            </svg>
                            Learner Intelligence
                          </span>
                          <span className={styles.modeOutputSub}>
                            Instructional quality evaluation, key concepts & study takeaways
                          </span>
                        </div>

                        {/* good_for_learning: Show as learning score / status */}
                        {analysis.mode_output?.good_for_learning !== undefined &&
                          analysis.mode_output?.good_for_learning !== null && (
                            <div className={styles.learnerHeroCard}>
                              <div className={styles.learningScoreRow}>
                                <div className={styles.learningScoreMeta}>
                                  <span className={styles.learningScoreLabel}>Educational Value Assessment</span>
                                  <div className={styles.learningStatusHeading}>
                                    {getLearningAssessment(analysis.mode_output.good_for_learning).statusText}
                                  </div>
                                  {getLearningAssessment(analysis.mode_output.good_for_learning).reason && (
                                    <p className={styles.cardText} style={{ margin: "4px 0 0 0" }}>
                                      {getLearningAssessment(analysis.mode_output.good_for_learning).reason}
                                    </p>
                                  )}
                                </div>
                                <div
                                  className={`${styles.learningScoreBadge} ${styles[getLearningAssessment(analysis.mode_output.good_for_learning).badgeClass] ||
                                    styles.learningBadgePositive
                                    }`}
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                                  </svg>
                                  <span>{getLearningAssessment(analysis.mode_output.good_for_learning).scoreText}</span>
                                </div>
                              </div>
                            </div>
                          )}

                        {/* important_topics */}
                        {Array.isArray(analysis.mode_output?.important_topics) &&
                          analysis.mode_output.important_topics.length > 0 && (
                            <div className={styles.card}>
                              <h3 className={styles.cardTitle}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                </svg>
                                Important Concepts & Core Topics Covered
                              </h3>
                              <div className={styles.importantTopicsGrid}>
                                {analysis.mode_output.important_topics.map((t, idx) => {
                                  const topicName =
                                    typeof t === "string"
                                      ? t
                                      : t.topic || t.name || t.title || JSON.stringify(t);
                                  const topicDesc =
                                    typeof t === "object" ? t.description || t.detail || t.reason : null;
                                  return (
                                    <div key={idx} className={styles.importantTopicCard}>
                                      <div className={styles.importantTopicHeader}>
                                        <div className={styles.importantTopicIcon}>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                        </div>
                                        <span>{topicName}</span>
                                      </div>
                                      {topicDesc && (
                                        <div className={styles.importantTopicDesc}>{topicDesc}</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        {/* learner_takeaways */}
                        {Array.isArray(analysis.mode_output?.learner_takeaways) &&
                          analysis.mode_output.learner_takeaways.length > 0 && (
                            <div className={styles.card}>
                              <h3 className={styles.cardTitle}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                Core Learner Takeaways & Practical Insights
                              </h3>
                              <div className={styles.takeawaysList}>
                                {analysis.mode_output.learner_takeaways.map((item, idx) => (
                                  <div key={idx} className={styles.takeawayItem}>
                                    <span className={styles.takeawayNum}>{idx + 1}</span>
                                    <div>
                                      {typeof item === "string"
                                        ? item
                                        : item.takeaway || item.text || item.summary || JSON.stringify(item)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    {/* 2. CREATOR MODE OUTPUT */}
                    {mode === "creator" && (
                      <div className={styles.modeOutputWrapper}>
                        <div className={styles.modeOutputHeader}>
                          <span className={styles.modeOutputTag}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M23 7l-7 5 7 5V7z" />
                              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                            Creator Diagnostics
                          </span>
                          <span className={styles.modeOutputSub}>
                            Audience feedback, sentiment drivers & reusable content ideas
                          </span>
                        </div>

                        {/* liked_by_users and disliked_by_users */}
                        {((Array.isArray(analysis.mode_output?.liked_by_users) &&
                          analysis.mode_output.liked_by_users.length > 0) ||
                          (Array.isArray(analysis.mode_output?.disliked_by_users) &&
                            analysis.mode_output.disliked_by_users.length > 0)) && (
                            <div className={styles.creatorTwoCol}>
                              {/* What Viewers Liked */}
                              {Array.isArray(analysis.mode_output?.liked_by_users) &&
                                analysis.mode_output.liked_by_users.length > 0 && (
                                  <div className={`${styles.card} ${styles.likedCard}`}>
                                    <h3 className={styles.cardTitle} style={{ color: "#166534" }}>
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                      </svg>
                                      What Viewers Loved Most
                                    </h3>
                                    <div className={styles.creatorFeedbackList}>
                                      {analysis.mode_output.liked_by_users.map((item, idx) => (
                                        <div key={idx} className={styles.likedItem}>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: "2px" }}>
                                            <polyline points="20 6 9 17 4 12" />
                                          </svg>
                                          <span>
                                            {typeof item === "string"
                                              ? item
                                              : item.point || item.topic || item.text || JSON.stringify(item)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                              {/* What Viewers Disliked / Pain Points */}
                              {Array.isArray(analysis.mode_output?.disliked_by_users) &&
                                analysis.mode_output.disliked_by_users.length > 0 && (
                                  <div className={`${styles.card} ${styles.dislikedCard}`}>
                                    <h3 className={styles.cardTitle} style={{ color: "#991b1b" }}>
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                                      </svg>
                                      Audience Pain Points & Critiques
                                    </h3>
                                    <div className={styles.creatorFeedbackList}>
                                      {analysis.mode_output.disliked_by_users.map((item, idx) => (
                                        <div key={idx} className={styles.dislikedItem}>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: "2px" }}>
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                          </svg>
                                          <span>
                                            {typeof item === "string"
                                              ? item
                                              : item.point || item.topic || item.critique || item.text || JSON.stringify(item)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                            </div>
                          )}

                        {/* trending_topics: Mark topics with can_be_used_for_content=true as reusable content ideas */}
                        {Array.isArray(analysis.mode_output?.trending_topics) &&
                          analysis.mode_output.trending_topics.length > 0 && (
                            <div className={styles.card}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                                <h3 className={styles.cardTitle}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                    <polyline points="17 6 23 6 23 12" />
                                  </svg>
                                  Trending Discussion Topics
                                </h3>
                                <span style={{ fontSize: "12px", color: "#6a7c6a", fontWeight: 600 }}>
                                  💡 Marked topics are prime reusable content ideas
                                </span>
                              </div>

                              <div className={styles.trendingList}>
                                {analysis.mode_output.trending_topics.map((t, idx) => {
                                  const isContentIdea =
                                    typeof t === "object" &&
                                    (t.can_be_used_for_content === true || t.is_content_idea === true);
                                  const topicName =
                                    typeof t === "string"
                                      ? t
                                      : t.topic || t.name || t.title || JSON.stringify(t);
                                  const mentions =
                                    typeof t === "object" ? t.mentions || t.count || t.frequency : null;
                                  const explanation =
                                    typeof t === "object" ? t.explanation || t.reason || t.description : null;

                                  return (
                                    <div
                                      key={idx}
                                      className={`${styles.trendingItem} ${isContentIdea ? styles.trendingItemContentIdea : ""
                                        }`}
                                    >
                                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <div className={styles.trendingTopicMain}>
                                          <svg className={styles.trendingTopicIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                            <polyline points="17 6 23 6 23 12" />
                                          </svg>
                                          <span>{topicName}</span>
                                          {mentions && (
                                            <span className={styles.trendingTopicMentions}>
                                              ({mentions} mentions)
                                            </span>
                                          )}
                                        </div>
                                        {explanation && (
                                          <p className={styles.cardText} style={{ margin: "2px 0 0 26px", fontSize: "13px" }}>
                                            {explanation}
                                          </p>
                                        )}
                                      </div>

                                      {isContentIdea && (
                                        <span className={styles.contentIdeaBadge}>
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                          </svg>
                                          Reusable Content Idea
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        {/* source_content_suggestions: Future video opportunities */}
                        {Array.isArray(analysis.mode_output?.source_content_suggestions) &&
                          analysis.mode_output.source_content_suggestions.length > 0 && (
                            <div className={styles.card}>
                              <h3 className={styles.cardTitle}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                                  <polyline points="2 17 12 22 22 17" />
                                  <polyline points="2 12 12 17 22 12" />
                                </svg>
                                Source Content Suggestions for Next Video
                              </h3>
                              <p className={styles.cardText}>
                                Fresh video concepts and expansion topics inspired directly by audience demand in the comments.
                              </p>
                              <div className={styles.sourceSuggestionsGrid}>
                                {analysis.mode_output.source_content_suggestions.map((item, idx) => {
                                  const isContentIdea =
                                    typeof item === "object" &&
                                    (item.can_be_used_for_content === true || item.is_content_idea === true);
                                  const title =
                                    typeof item === "string"
                                      ? item
                                      : item.title || item.suggestion || item.idea || item.topic || JSON.stringify(item);
                                  const desc =
                                    typeof item === "object" ? item.description || item.reason || item.detail : null;

                                  return (
                                    <div key={idx} className={styles.sourceSuggestionCard}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                                        <div className={styles.sourceSuggestionTitle}>{title}</div>
                                        {isContentIdea && (
                                          <span className={styles.contentIdeaBadge}>
                                            Reusable Idea
                                          </span>
                                        )}
                                      </div>
                                      {desc && (
                                        <div className={styles.sourceSuggestionDesc}>{desc}</div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    {/* 3. WATCHER MODE: Show the common analysis fields as the main viewer summary */}
                    {mode === "watcher" && (
                      <div className={styles.watcherSummaryCard}>
                        <span className={styles.watcherSummaryPill}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          Main Viewer Verdict & Summary
                        </span>
                        <h3 style={{ fontFamily: "var(--font-serif-display)", fontSize: "20px", color: "#000000", margin: "6px 0 10px 0", fontWeight: 800, lineHeight: 1.25 }}>
                          {analysis.overall_rating >= 7
                            ? "Worth Your Time • Recommended Watch"
                            : analysis.overall_rating >= 4.8
                              ? "Moderate Quality • Review Content Gaps Before Watching"
                              : "Proceed With Caution • Significant Viewer Complaints"}
                        </h3>
                        <p className={styles.cardText} style={{ margin: 0, color: "rgba(0,0,0,0.72)" }}>
                          {analysis.general_consensus}
                        </p>
                      </div>
                    )}

                    {/* Lacking Topics & Gap Fill Videos - Clickable YouTube Links */}
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
                              : mode === "learner"
                                ? "Prerequisite & Uncovered Topics (Gap Fill Videos)"
                                : "Identified Content Gaps & Companion Videos"}
                          </h3>
                          <p className={styles.cardText}>
                            {mode === "creator"
                              ? "Topics your viewers asked for or felt were missing in this video — prime opportunities for your next upload!"
                              : mode === "learner"
                                ? "Concepts viewers felt were omitted or insufficiently explained, with companion YouTube tutorials to bridge the gap."
                                : "Topics viewers felt were missing, incomplete, or unexplained, along with recommended companion videos to fill the gap."}
                          </p>

                          <div className={styles.topicList}>
                            {lackingTopicVideos && lackingTopicVideos.length > 0 ? (
                              lackingTopicVideos.map((item, idx) => {
                                const ytLink = getYouTubeLink(item);
                                return (
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
                                        {mode === "creator"
                                          ? "Viewer Demand"
                                          : mode === "learner"
                                            ? "Concept Gap"
                                            : "Missing Detail"}
                                      </span>
                                    </div>
                                    <p className={styles.topicReason}>{item.reason}</p>
                                    <div className={styles.topicVideoRecommendation}>
                                      <div className={styles.recommendationLabel}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                                          <polyline points="17 2 12 7 7 2" />
                                        </svg>
                                        <span>
                                          Suggested: <strong>{item.video?.title || item.suggestion || "Companion Video"}</strong>
                                        </span>
                                      </div>
                                      <a
                                        href={ytLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.videoPillLink}
                                        title="Open recommended video on YouTube"
                                      >
                                        <span>Watch on YouTube</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                          <line x1="7" y1="17" x2="17" y2="7" />
                                          <polyline points="7 7 17 7 17 17" />
                                        </svg>
                                      </a>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              analysis.lacking_topics?.map((item, idx) => {
                                const ytSearchLink = getYouTubeLink(item);
                                return (
                                  <div key={idx} className={styles.topicCard}>
                                    <div className={styles.topicHeader}>
                                      <div className={styles.topicTitleBadge}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                          <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        <span>{typeof item === "string" ? item : item.topic}</span>
                                      </div>
                                      <span className={styles.topicTag}>Topic Gap</span>
                                    </div>
                                    {typeof item === "object" && item.reason && (
                                      <p className={styles.topicReason}>{item.reason}</p>
                                    )}
                                    <div className={styles.topicVideoRecommendation}>
                                      <div className={styles.recommendationLabel}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        <span>Search gap fill tutorials on YouTube:</span>
                                      </div>
                                      <a
                                        href={ytSearchLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.videoPillLink}
                                      >
                                        <span>Search YouTube</span>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                          <line x1="7" y1="17" x2="17" y2="7" />
                                          <polyline points="7 7 17 7 17 17" />
                                        </svg>
                                      </a>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}

                    {/* Related Videos - Clickable YouTube Links */}
                    {relatedVideos && relatedVideos.length > 0 && (
                      <div className={`${styles.card} ${styles.lackingTopicsSection}`}>
                        <h3 className={styles.cardTitle}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          {mode === "creator"
                            ? "Competitor & Related Content Benchmarks"
                            : mode === "learner"
                              ? "Recommended Learning Resources & Alternatives"
                              : "Related Videos to Explore"}
                        </h3>
                        <p className={styles.cardText}>
                          {mode === "creator"
                            ? "Videos covering similar topics or adjacent themes in this niche."
                            : mode === "learner"
                              ? "High-relevance companion tutorials and alternative explanations on YouTube."
                              : "Videos exploring similar subjects or alternative perspectives on this topic."}
                        </p>

                        <div className={styles.relatedVideosGrid}>
                          {relatedVideos.map((video, idx) => {
                            const ytLink = getYouTubeLink(video);
                            return (
                              <a
                                key={idx}
                                href={ytLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.relatedVideoCard}
                                title={`Watch "${video.title}" on YouTube`}
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
                                    <span>Watch on YouTube</span>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <line x1="7" y1="17" x2="17" y2="7" />
                                      <polyline points="7 7 17 7 17 17" />
                                    </svg>
                                  </span>
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </main>
            </div>
          </section>
        )
      }

      {/* Reusable Footer */}
      <Footer />
    </div >
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", backgroundColor: "#EFFDF0" }} />}>
      <SentimentDashboardInner />
    </Suspense>
  );
}

// ===== Helper Functions =====
function getYouTubeLink(item) {
  if (!item) return "https://www.youtube.com";
  if (typeof item === "string" && (item.startsWith("http://") || item.startsWith("https://"))) {
    return item;
  }
  if (item.url && typeof item.url === "string") return item.url;
  if (item.link && typeof item.link === "string") return item.link;
  if (item.video?.url && typeof item.video.url === "string") return item.video.url;
  if (item.video?.link && typeof item.video.link === "string") return item.video.link;
  if (item.videoId) return `https://www.youtube.com/watch?v=${item.videoId}`;
  if (item.video?.videoId) return `https://www.youtube.com/watch?v=${item.video.videoId}`;

  const query = item.video?.title || item.title || item.suggestion || item.topic || "YouTube";
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function renderGuidanceContent(guidance) {
  if (!guidance) return null;
  if (typeof guidance === "string") {
    return <p className={styles.cardText}>{guidance}</p>;
  }
  if (Array.isArray(guidance)) {
    return (
      <ul className={styles.guidanceList}>
        {guidance.map((item, idx) => {
          const text =
            typeof item === "string"
              ? item
              : item.guidance || item.tip || item.text || item.advice || JSON.stringify(item);
          return (
            <li key={idx} className={styles.guidanceItem}>
              <svg className={styles.guidanceItemIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 14 14" />
              </svg>
              <span>{text}</span>
            </li>
          );
        })}
      </ul>
    );
  }
  if (typeof guidance === "object") {
    return (
      <div className={styles.guidanceObj}>
        {Object.entries(guidance).map(([k, v], idx) => (
          <div key={idx} className={styles.guidanceSubItem}>
            <strong style={{ textTransform: "capitalize" }}>{k.replace(/_/g, " ")}: </strong>
            <span>{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
          </div>
        ))}
      </div>
    );
  }
  return <p className={styles.cardText}>{String(guidance)}</p>;
}

function getLearningAssessment(val) {
  if (typeof val === "boolean") {
    return {
      statusText: val ? "Recommended for Learning" : "Limited Educational Value",
      badgeClass: val ? "learningBadgePositive" : "learningBadgeNegative",
      scoreText: val ? "High Quality" : "Needs Supplement",
      isPositive: val,
    };
  }
  if (typeof val === "number") {
    const isGood = val >= 7;
    const isMid = val >= 4.8;
    return {
      statusText: isGood
        ? "Highly Recommended for Learning"
        : isMid
          ? "Moderate Educational Value"
          : "Not Recommended for Learning",
      badgeClass: isGood
        ? "learningBadgePositive"
        : isMid
          ? "learningBadgeNeutral"
          : "learningBadgeNegative",
      scoreText: `${val} / 10`,
      isPositive: isGood,
    };
  }
  if (typeof val === "string") {
    const lower = val.toLowerCase();
    const isBad =
      lower.includes("not") || lower.includes("poor") || lower.includes("bad") || lower.includes("low");
    const isGood =
      lower.includes("yes") || lower.includes("high") || lower.includes("great") || lower.includes("recommend");
    return {
      statusText: val,
      badgeClass: isGood
        ? "learningBadgePositive"
        : isBad
          ? "learningBadgeNegative"
          : "learningBadgeNeutral",
      scoreText: val,
      isPositive: !isBad,
    };
  }
  if (typeof val === "object" && val !== null) {
    const isGood = val.recommended === true || (val.score && val.score >= 6);
    return {
      statusText: val.status || val.recommendation || (val.score ? `Score: ${val.score}/10` : "Assessed"),
      badgeClass: isGood ? "learningBadgePositive" : "learningBadgeNeutral",
      scoreText: val.score ? `${val.score} / 10` : val.status || "Assessed",
      reason: val.reason || val.explanation,
      isPositive: isGood,
    };
  }
  return {
    statusText: "Learning Assessed",
    badgeClass: "learningBadgePositive",
    scoreText: "Available",
    isPositive: true,
  };
}

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

