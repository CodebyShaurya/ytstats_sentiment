"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./about.module.css";

export default function AboutPage() {
  const [mode, setMode] = useState("watcher");

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("yt_sentiment_user_mode");
      if (savedMode === "creator" || savedMode === "watcher") {
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


          <h1 className={styles.heroHeading}>
            Revealing True Audience Sentiment on YouTube
          </h1>

          <p className={styles.heroSubtitle}>
            YT Sentiment Analyzer is an AI intelligence engine engineered to uncover how real
            audiences react to YouTube videos. We bridge the gap between viewer expectations
            and creator storytelling with transparent, unbiased comment analysis.
          </p>
        </section>

        {/* Mascot Ambassador Showcase */}
        <section className={styles.ambassadorSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Meet Our Audience Pulse Ambassadors</h2>
            <p className={styles.sectionDesc}>
              Rather than generic star ratings or lifeless emojis, our three canine brand
              ambassadors bring visual warmth and human relatability to video sentiment.
            </p>
          </div>

          <div className={styles.ambassadorGrid}>
            {/* Card 1: Buddy (Happy Dog) */}
            <div className={styles.ambassadorCard}>
              <div className={styles.ambassadorImgWrapper}>
                <img
                  src="/images/dogs/happy-dog.png"
                  alt="Buddy - Positive Audience Ambassador"
                  className={styles.ambassadorImg}
                />
              </div>
              <h3 className={styles.ambassadorName}>Buddy</h3>
              <span className={`${styles.ambassadorRoleBadge} ${styles.badgeHappy}`}>
                Pawsitive Praise • Score 7.0 - 10.0
              </span>
              <p className={styles.ambassadorDesc}>
                Buddy celebrates videos that genuinely deliver on their promises, delight viewers,
                and maintain high audience satisfaction. When Buddy appears, you know the video is
                worth watching and creator engagement is rock-solid.
              </p>
            </div>

            {/* Card 2: Sammy (Neutral Dog) */}
            <div className={styles.ambassadorCard}>
              <div className={styles.ambassadorImgWrapper}>
                <img
                  src="/images/dogs/neutral-dog.png"
                  alt="Sammy - Balanced Audience Ambassador"
                  className={styles.ambassadorImg}
                />
              </div>
              <h3 className={styles.ambassadorName}>Sammy</h3>
              <span className={`${styles.ambassadorRoleBadge} ${styles.badgeNeutral}`}>
                Even Temper • Score 4.8 - 6.9
              </span>
              <p className={styles.ambassadorDesc}>
                Sammy represents videos with nuanced discussions, split community opinions, or
                mixed feedback. Sammy pinpoints when a video has strong core content but might
                benefit from clearer pacing or balanced perspectives.
              </p>
            </div>

            {/* Card 3: Barnaby (Sad Dog) */}
            <div className={styles.ambassadorCard}>
              <div className={styles.ambassadorImgWrapper}>
                <img
                  src="/images/dogs/sad-dog.png"
                  alt="Barnaby - Critical Audience Ambassador"
                  className={styles.ambassadorImg}
                />
              </div>
              <h3 className={styles.ambassadorName}>Barnaby</h3>
              <span className={`${styles.ambassadorRoleBadge} ${styles.badgeSad}`}>
                Ruff Reception • Score 0.0 - 4.7
              </span>
              <p className={styles.ambassadorDesc}>
                Barnaby acts as our quality auditor. When viewers feel misled by clickbait,
                frustrated by missing explanations, or disappointed by content delivery, Barnaby
                flags critical areas so creators can fix them and viewers can save time.
              </p>
            </div>
          </div>
        </section>

        {/* Dual Mode Architecture */}
        <section className='space-y-2'>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tailored For Both Viewers and Creators</h2>
            <p className={styles.sectionDesc}>
              Switch seamlessly between two dedicated modes using the toggle at the top of any page.
            </p>
          </div>

          <div className={styles.modesGrid}>
            {/* Watcher Mode Box */}
            <div className={styles.modeBox}>
              <h3 className={styles.modeBoxTitle}>
                <div className={styles.modeIconWrap}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <span>For Video Watchers</span>
              </h3>
              <ul className={styles.modeList}>
                <li className={styles.modeItem}>
                  <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span><strong>Time-Saving Verdict:</strong> Instantly learn if a 30-minute tutorial or review actually answers what you need.</span>
                </li>
                <li className={styles.modeItem}>
                  <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span><strong>Clickbait Shield:</strong> Check Title Relevance scores to ensure the video delivers on its headline claim.</span>
                </li>
                <li className={styles.modeItem}>
                  <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span><strong>Alternative Watch Suggestions:</strong> Discovers high-ranking gap-filler videos if the active video leaves questions unanswered.</span>
                </li>
              </ul>
            </div>

            {/* Creator Mode Box */}
            <div className={styles.modeBox}>
              <h3 className={styles.modeBoxTitle}>
                <div className={styles.modeIconWrap}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </div>
                <span>For Content Creators</span>
              </h3>
              <ul className={styles.modeList}>
                <li className={styles.modeItem}>
                  <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span><strong>Audience Retention Diagnostics:</strong> Understand the psychological friction points causing viewer drop-off or critiques.</span>
                </li>
                <li className={styles.modeItem}>
                  <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span><strong>Next-Video Topic Inspiration:</strong> Automatically mines questions and gaps your viewers requested in comment threads.</span>
                </li>
                <li className={styles.modeItem}>
                  <svg className={styles.checkIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span><strong>Packaging & Framing Audit:</strong> Correlates your Title & Description promises with actual viewer satisfaction.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Daily Quota Policy */}
        <section className={styles.quotaSection}>
          <div>
            <h2 className={styles.quotaHeading}>Daily Search Allocation</h2>
            <p className={styles.quotaText}>
              To guarantee fast turnaround and deep NLP compute power for all users, each browser
              receives a daily quota saved securely in your local browser storage:
            </p>
          </div>
          <div className={styles.quotaBadges}>
            <div className={styles.quotaPill}>
              <span className={styles.quotaPillTitle}>Deep Search <span className='md:block hidden' >(~500 comments sampled)</span></span>
              <span className={styles.quotaPillCount}>1 per day</span>
            </div>
            <div className={styles.quotaPill}>
              <span className={styles.quotaPillTitle}>Balanced Search <span className='md:block hidden' > (~200 comments sampled)</span></span>
              <span className={styles.quotaPillCount}>2 per day</span>
            </div>
            <div className={styles.quotaPill}>
              <span className={styles.quotaPillTitle}>Fast Search <span className='md:block hidden' >(~50 comments sampled)</span></span>
              <span className={styles.quotaPillCount}>3 per day</span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaHeading}>Ready to Analyze a Video?</h2>
          <p className={styles.ctaSubtitle}>
            Paste any YouTube URL and let our AI engine and mascot ambassadors evaluate audience
            reception in seconds.
          </p>
          <Link href="/" className={styles.ctaBtn}>
            <span>Launch Analyzer</span>
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
