"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./how-it-works.module.css";

export default function HowItWorksPage() {
  const [mode, setMode] = useState("watcher");

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("yt_sentiment_user_mode");
      if (savedMode === "creator" || savedMode === "watcher" || savedMode === "learner") {
        setMode(savedMode);
      }
    } catch (e) { }
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    try {
      localStorage.setItem("yt_sentiment_user_mode", newMode);
    } catch (e) { }
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar mode={mode} onModeChange={handleModeChange} />

      <main className={styles.mainContent}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          {/* <div className={styles.heroTag}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <span>Under The Hood</span>
          </div> */}

          <h1 className={styles.heroHeading}>
            How YT Sentiment Analyzer Works
          </h1>

          <p className={styles.heroSubtitle}>
            From raw YouTube comment thread ingestion to semantic Natural Language Processing and
            our Brand Ambassador dog emotion diagnosis — here is our transparent 5-step analysis pipeline.
          </p>
        </section>

        {/* Step-by-Step Pipeline */}
        <section className={styles.pipelineSection}>
          <div className={styles.pipelineList}>
            {/* Step 1 */}
            <div className={styles.stepCard}>
              <div className={styles.stepBadge}>
                <span className={styles.stepNum}>01</span>
                <span className={styles.stepLabel}>Ingestion</span>
              </div>
              <div className={styles.stepBody}>
                <h2 className={styles.stepTitle}>URL Parsing & Depth Sampling Selection</h2>
                <p className={styles.stepText}>
                  When you submit a YouTube link, the video ID is extracted and authenticated. You
                  select your preferred sampling accuracy: Fast (~50 comments), Balanced (~200 comments),
                  or Deep (~500 comments). Daily limits (3 Fast, 2 Balanced, 1 Deep) protect your browser
                  allocation and server capacity.
                </p>
                <div className={styles.stepHighlights}>
                  <span className={styles.highlightPill}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Fast: ~50 comments (3/day)
                  </span>
                  <span className={styles.highlightPill}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Balanced: ~200 comments (2/day)
                  </span>
                  <span className={styles.highlightPill}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Deep: ~500 comments (1/day)
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className={styles.stepCard}>
              <div className={styles.stepBadge}>
                <span className={styles.stepNum}>02</span>
                <span className={styles.stepLabel}>Cleansing</span>
              </div>
              <div className={styles.stepBody}>
                <h2 className={styles.stepTitle}>Comment Thread Scraping & Quality Sanitization</h2>
                <p className={styles.stepText}>
                  We pull authentic comment threads directly from YouTube. Automated spam filters
                  strip out bot repetitions, self-promotional affiliate spam, timestamp-only comments,
                  and generic emoji floods so that only genuine human opinions and detailed feedback
                  reach the AI model.
                </p>
                <div className={styles.stepHighlights}>
                  <span className={styles.highlightPill}>Spam Bot Stripping</span>
                  <span className={styles.highlightPill}>Timestamp Cleansing</span>
                  <span className={styles.highlightPill}>Authentic Opinion Retention</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className={styles.stepCard}>
              <div className={styles.stepBadge}>
                <span className={styles.stepNum}>03</span>
                <span className={styles.stepLabel}>AI Analysis</span>
              </div>
              <div className={styles.stepBody}>
                <h2 className={styles.stepTitle}>Semantic Sentiment & Emotional Nuance Parsing</h2>
                <p className={styles.stepText}>
                  Our LLM processing pipeline analyzes the collective voice of the commenters. It
                  measures contextual sentiment polarity (positive, neutral, negative, or mixed)
                  while discerning sarcasm, constructive criticism, and authentic viewer praise.
                </p>
                <div className={styles.stepHighlights}>
                  <span className={styles.highlightPill}>Sarcasm Detection</span>
                  <span className={styles.highlightPill}>Constructive Feedback Synthesis</span>
                  <span className={styles.highlightPill}>Polarity Distribution</span>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className={styles.stepCard}>
              <div className={styles.stepBadge}>
                <span className={styles.stepNum}>04</span>
                <span className={styles.stepLabel}>Alignment</span>
              </div>
              <div className={styles.stepBody}>
                <h2 className={styles.stepTitle}>Title & Description Truthfulness Alignment</h2>
                <p className={styles.stepText}>
                  Does the video fulfill what it promises? The AI evaluates the video title and description
                  against the actual feedback in the comments, assigning a Title Match score (1-10) and
                  Description Match score (1-10). If viewers felt misled, the Relevance Index immediately reflects it.
                </p>
                <div className={styles.stepHighlights}>
                  <span className={styles.highlightPill}>Clickbait Auditing</span>
                  <span className={styles.highlightPill}>Promise Delivery Rating</span>
                  <span className={styles.highlightPill}>Relevance Index</span>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className={styles.stepCard}>
              <div className={styles.stepBadge}>
                <span className={styles.stepNum}>05</span>
                <span className={styles.stepLabel}>Mascots</span>
              </div>
              <div className={styles.stepBody}>
                <h2 className={styles.stepTitle}>Overall Rating & Dog Ambassador Mascot Verdict</h2>
                <p className={styles.stepText}>
                  Finally, the overall rating (0 to 10) is calculated and assigned to our Brand Ambassador
                  dog mascot to visually communicate the audience reaction in a vibrant, unforgettable way:
                </p>

                <div className={styles.mascotStepGrid}>
                  <div className={styles.mascotStepCard}>
                    <img src="/images/dogs/happy-dog.png" alt="Happy Pup" className={styles.mascotStepImg} />
                    <div className={styles.mascotStepInfo}>
                      <span className={styles.mascotStepTitle}>Buddy (Happy Dog)</span>
                      <span className={styles.mascotStepRange}>Score 7.0 - 10.0 (Positive)</span>
                    </div>
                  </div>

                  <div className={styles.mascotStepCard}>
                    <img src="/images/dogs/neutral-dog.png" alt="Neutral Dog" className={styles.mascotStepImg} />
                    <div className={styles.mascotStepInfo}>
                      <span className={styles.mascotStepTitle}>Sammy (Neutral Dog)</span>
                      <span className={styles.mascotStepRange}>Score 4.8 - 6.9 (Balanced)</span>
                    </div>
                  </div>

                  <div className={styles.mascotStepCard}>
                    <img src="/images/dogs/sad-dog.png" alt="Sad Dog" className={styles.mascotStepImg} />
                    <div className={styles.mascotStepInfo}>
                      <span className={styles.mascotStepTitle}>Barnaby (Sad Dog)</span>
                      <span className={styles.mascotStepRange}>Score 0.0 - 4.7 (Critical)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection}>
          <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>How does the daily search limit work?</span>
              </h3>
              <p className={styles.faqAnswer}>
                Each user gets 1 Deep search (~500 comments), 2 Balanced searches (~200 comments), and
                3 Fast searches (~50 comments) per 24-hour cycle. Quotas are saved locally in your browser
                and reset automatically at midnight.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>What is the difference between Watcher and Creator mode?</span>
              </h3>
              <p className={styles.faqAnswer}>
                Watcher mode frames the analysis around your time: &quot;Is this video worth watching? Does
                it have clickbait?&quot; Creator mode frames metrics around audience retention, title
                alignment, and topic gaps to help you plan your next upload.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>How are the dog brand ambassadors chosen?</span>
              </h3>
              <p className={styles.faqAnswer}>
                The overall rating mathematically selects the mascot: Buddy (Happy) for high praise,
                Sammy (Neutral) for balanced discussions, and Barnaby (Sad) for critical feedback or
                unfulfilled video claims.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <span>Can I analyze live streams or Shorts?</span>
              </h3>
              <p className={styles.faqAnswer}>
                Yes, as long as the YouTube video or Short has an active, accessible public comment thread,
                our scraper can extract and process viewer sentiment.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaHeading}>See It In Action</h2>
          <p className={styles.ctaSubtitle}>
            Paste any YouTube video link to experience authentic audience insights right now.
          </p>
          <Link href="/" className={styles.ctaBtn}>
            <span>Test a Video</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
