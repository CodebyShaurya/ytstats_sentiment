"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";

const API_BASE = "/api/youtube";

// External Assets specified in Prompt
const ASSETS = {
  logo: "/logo.png",
  avatar: "https://polo-pecan-73837341.figma.site/_assets/v11/e62173d41f91350a59628e8a9a55ae078a886fb9.png?w=128",
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
  const [data, setData] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [animateResults, setAnimateResults] = useState(false);
  const resultsRef = useRef(null);

  // Map slider value (1, 2, 3) to accuracy string
  const accuracyLevels = ["low", "medium", "high"];
  const accuracy = accuracyLevels[sliderVal - 1] || "medium";

  // Check for URL params from extension
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

    setLoading(true);
    setError(null);
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

  // Render the search card with input, slider, and analyze button
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
          placeholder="Paste YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
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
          disabled={loading || !ytUrl.trim()}
        >
          {loading ? (
            <>
              <div className={styles.spinnerSmall} />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Analyze</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* Row 2: Analysis Accuracy Slider */}
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
              onChange={(e) => setSliderVal(parseInt(e.target.value, 10))}
              className={styles.sliderInput}
              aria-label="Analysis depth slider"
            />
          </div>
          <span className={styles.sliderBadge}>
            {sliderVal === 1 ? " Fast (~50)" : sliderVal === 2 ? " Balanced (~200)" : " Deep (~500)"}
          </span>
        </div>

        {/* Quick Segmented Switch */}
        <div className={styles.accuracySegmented}>
          <button
            type="button"
            className={`${styles.segmentBtn} ${sliderVal === 1 ? styles.segmentBtnActive : ""}`}
            onClick={() => setSliderVal(1)}
          >
            Fast
          </button>
          <button
            type="button"
            className={`${styles.segmentBtn} ${sliderVal === 2 ? styles.segmentBtnActive : ""}`}
            onClick={() => setSliderVal(2)}
          >
            Balanced
          </button>
          <button
            type="button"
            className={`${styles.segmentBtn} ${sliderVal === 3 ? styles.segmentBtnActive : ""}`}
            onClick={() => setSliderVal(3)}
          >
            Deep
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* ================= HEADER ================= */}
      <header className={`${styles.header} ${hasSearched ? styles.headerSearched : ""}`}>
        {/* Left Brand Logo */}
        <div
          className={styles.logoContainer}
          onClick={() => {
            if (hasSearched) {
              setHasSearched(false);
              setData(null);
            }
          }}
          title="Reset to home"
        >
          <img
            src={ASSETS.logo}
            alt="Logo"
            className={styles.logoImg}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className={styles.logoText}>YT Sentiment</span>
        </div>

        {/* Sticky Search Bar when user has performed a search */}
        {hasSearched && (
          <div className={styles.topHeaderSearchWrapper}>
            {renderSearchCard(true)}
          </div>
        )}

        {/* Right Action Icons & Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={ASSETS.avatar} alt="User Avatar" style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid white" }} />
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className={`${styles.heroSection} ${hasSearched ? styles.heroSectionSearched : ""}`}>
        {/* Center Text Layer: REMOVED when searched, as requested */}
        {!hasSearched && (
          <div className={styles.heroCenterText}>
            <h1 className={styles.heroHeading}>
              <span className="animate-word-pop delay-200">Everything</span>{" "}
              <span className={styles.wordSpacing} />
              <br />
              <span className="animate-word-pop delay-400">Your</span>{" "}
              <span className="animate-word-pop delay-500">Users</span>{" "}
              <span className="animate-word-pop delay-600">Feel</span>
            </h1>

            <p className={`${styles.heroSubtitle} animate-fade-up delay-600`}>
              AI-powered YouTube video sentiment analyzer and viewer emotion breakdown.
              Explore authentic reviews, feedback, and audience reactions instantly.
            </p>

            {/* Main Hero Search Card with Slider */}
            {renderSearchCard(false)}
          </div>
        )}

        {/* Bottom 3 Images Section: BLURRED when searched, as requested */}
        <div
          className={`${styles.bottomImagesContainer} ${hasSearched ? styles.bottomImagesBlurred : ""
            }`}
        >
          {/* Left Column Image */}
          <div className={`${styles.bottomImgCol} ${styles.bottomLeftCol} animate-photo-reveal delay-700`}>
            <img src={ASSETS.bottomLeft} alt="Pet item left" className={styles.heroBottomImg} />
            {!hasSearched && (
              <div className={`${styles.overlayBottomLeft} animate-fade-up delay-1000`}>
                <span className={styles.statLarge}>98K+</span>
                <div className={styles.avatarStack}>
                  <img src={ASSETS.avatar} alt="User" className={styles.stackedAvatar} />
                  <div className={styles.plusCircle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center Column Image (Tallest) */}
          <div className={`${styles.bottomImgCol} ${styles.bottomCenterCol} animate-photo-reveal delay-600`}>
            <img src={ASSETS.bottomCenter} alt="Pet item center" className={styles.heroBottomImg} />
            {!hasSearched && (
              <div className={`${styles.overlayBottomCenter} animate-fade-up delay-1100`}>
                <div className={styles.bottomCenterText}>Best Products for Your Pet</div>
              </div>
            )}
          </div>

          {/* Right Column Image */}
          <div className={`${styles.bottomImgCol} ${styles.bottomRightCol} animate-photo-reveal delay-800`}>
            <img src={ASSETS.bottomRight} alt="Pet item right" className={styles.heroBottomImg} />
            {!hasSearched && (
              <div className={`${styles.overlayBottomRight} animate-fade-up delay-1200`}>
                <span className={styles.ratingLarge}>4.6</span>
                <svg width="20" height="20" viewBox="0 0 24 24" className={styles.starFilled}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
            )}
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
          <button className={styles.errorDismiss} onClick={() => setError(null)}>✕</button>
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

      {/* ================= RESULTS: SIDEBAR (VIDEO + 4 PLACEHOLDERS) & RIGHT BREAKDOWN ================= */}
      {hasSearched && (
        <section className={styles.resultsSectionFull} ref={resultsRef}>
          <div className={styles.dashboardLayout}>
            {/* LEFT SIDEBAR: Embedded YouTube Video + 4 Placeholders */}
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

              {/* 4 Placeholders in Sidebar */}
              <div className='flex flex-col gap-y-3'>

                {/* Placeholder 1: Audience Engagement */}
                <div className={styles.placeholderCard}>
                  {/* <span className={styles.placeholderIcon}>💬</span> */}
                  <div className={styles.placeholderTitle}>Audience Volume</div>
                  <div className={styles.placeholderValue}>
                    {analysis ? `${analysis.comments_analyzed || data?.comments_analyzed || 0}` : "—"}
                  </div>
                  <div className={styles.placeholderDesc}>Comments sampled across thread</div>
                </div>

                {/* Placeholder 2: Sentiment Polarity */}
                <div className={styles.placeholderCard}>
                  {/* <span className={styles.placeholderIcon}>🔥</span> */}
                  <div className={styles.placeholderTitle}>Sentiment Bias</div>
                  <div className={styles.placeholderValue}>
                    {analysis ? `${getSentimentEmoji(analysis.sentiment)} ${analysis.sentiment}` : "—"}
                  </div>
                  <div className={styles.placeholderDesc}>Dominant audience sentiment</div>
                </div>

                {/* Placeholder 3: Title Relevance */}
                <div className={styles.placeholderCard}>
                  {/* <span className={styles.placeholderIcon}>🎯</span> */}
                  <div className={styles.placeholderTitle}>Relevance Index</div>
                  <div className={styles.placeholderValue}>
                    {analysis ? `${analysis.title_match?.score || 0}/10` : "—"}
                  </div>
                  <div className={styles.placeholderDesc}>Title claim vs viewer opinion</div>
                </div>

                {/* Placeholder 4: Trust Score */}
                <div className={styles.placeholderCard}>
                  {/* <span className={styles.placeholderIcon}>⭐</span> */}
                  <div className={styles.placeholderTitle}>Overall Rating</div>
                  <div className={styles.placeholderValue}>
                    {analysis ? `${analysis.overall_rating}/10` : "—"}
                  </div>
                  <div className={styles.placeholderDesc}>Aggregated quality score</div>
                </div>
              </div>
            </aside>

            {/* RIGHT COLUMN: Detailed Sentiment & Content Breakdown */}
            <main className={styles.breakdownContainer}>
              {analysis && !loading && (
                <>
                  {/* Quick Metrics Ribbon */}

                  {/* Header Title */}
                  <div className={styles.resultsHeader}>
                    <h2 className={styles.resultsTitle}>Detailed Breakdown</h2>
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
                      <h3 className={styles.cardTitle}>Overall Rating</h3>
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
                      <h3 className={styles.cardTitle}>Viewer Sentiment</h3>
                      <div className={`${styles.sentimentPill} ${styles[`sentiment_${analysis.sentiment}`]}`}>
                        <span>{getSentimentEmoji(analysis.sentiment)}</span>
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
                      Content Match Scores
                    </h3>

                    <div className={styles.scoresGrid}>
                      {/* Title Match */}
                      <div className={styles.scoreItem}>
                        <div className={styles.scoreHeader}>
                          <div className={styles.scoreInfo}>
                            <span>📝</span>
                            <span>Title Match</span>
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
                            <span>📄</span>
                            <span>Description Match</span>
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
                        Engagement Assessment
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
                        General Consensus
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
                      Analysis Limitations
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
                        Identified Content Gaps & Recommended Fillers
                      </h3>
                      <p className={styles.cardText}>
                        Topics viewers felt were missing, incomplete, or unexplained in this video, along with recommended resources to fill the gap.
                      </p>

                      <div className={styles.topicList}>
                        {/* If lacking_topic_videos is provided, render each with its linked video */}
                        {lackingTopicVideos && lackingTopicVideos.length > 0 ? (
                          lackingTopicVideos.map((item, idx) => (
                            <div key={idx} className={styles.topicCard}>
                              <div className={styles.topicHeader}>
                                <div className={styles.topicTitleBadge}>
                                  <span>📌</span>
                                  <span>{item.topic}</span>
                                </div>
                                <span className={styles.topicTag}>Missing Detail</span>
                              </div>
                              <p className={styles.topicReason}>{item.reason}</p>
                              {(item.video?.url || item.link) && (
                                <div className={styles.topicVideoRecommendation}>
                                  <div className={styles.recommendationLabel}>
                                    <span>📺</span>
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
                          // Fallback to analysis.lacking_topics if lacking_topic_videos is not present
                          analysis.lacking_topics?.map((item, idx) => (
                            <div key={idx} className={styles.topicCard}>
                              <div className={styles.topicHeader}>
                                <div className={styles.topicTitleBadge}>
                                  <span>📌</span>
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
                        Related Videos to Explore
                      </h3>
                      <p className={styles.cardText}>
                        Videos exploring similar subjects or alternative perspectives on this topic.
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

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>YT Sentiment Analyzer © 2026</span>
          <span className={styles.footerDot}>•</span>
          <span>AI-Powered Viewer Sentiment & Video Insights</span>
        </div>
      </footer>
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

// ===== Helpers =====
function getSentimentEmoji(sentiment) {
  const map = { positive: "😊", negative: "😞", neutral: "😐", mixed: "🤔" };
  return map[sentiment] || "📊";
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
