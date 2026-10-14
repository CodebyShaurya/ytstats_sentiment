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


          <h1 className={styles.heroHeading}>
            Revealing True Audience Sentiment on YouTube
          </h1>

          <p className={styles.heroSubtitle}>
            YT Sentiment Analyzer is an AI intelligence engine engineered to uncover how real
            audiences react to YouTube videos. We bridge the gap between viewer expectations
            and creator storytelling with transparent, unbiased comment analysis.
          </p>
        </section>

        {/* ================= MEET THE DEVELOPERS (FIRST SECTION) ================= */}
        <section className={styles.developersSection}>
          <div className={styles.sectionHeader}>

            <h2 className={styles.sectionTitle}>Meet The Developers</h2>
            <p className={styles.sectionDesc}>
              The engineering minds behind YT Sentiment Analyzer — building transparent AI tools to bridge the gap between content creators and authentic viewer communities.
            </p>
          </div>

          <div className={styles.developersGrid}>
            {/* Developer 1: Shaurya Gupta */}
            <div className={styles.devCard}>
              <div className={styles.devAvatarWrap}>
                <img
                  src="https://avatars.githubusercontent.com/u/123228383?v=4"
                  alt="Shaurya Gupta"
                  className={styles.devAvatar}
                />
              </div>
              <h3 className={styles.devName}>Shaurya Gupta</h3>
              <div className={styles.devHandle}>@CodebyShaurya</div>
              <span className={styles.devRoleBadge}>Lead Developer</span>
              <p className={styles.devBio}>
                Full-stack developer and AI enthusiast. Passionate about AI integrations, natural language processing, scalable backend architectures, and modern web applications.
              </p>

              <a
                href="https://github.com/CodebyShaurya"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubBtn}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub Profile</span>
              </a>
            </div>

            {/* Developer 2: Khushi Sharma */}
            <div className={styles.devCard}>
              <div className={styles.devAvatarWrap}>
                <img
                  src="https://avatars.githubusercontent.com/u/114425377?v=4"
                  alt="Khushi Sharma"
                  className={styles.devAvatar}
                />
              </div>
              <h3 className={styles.devName}>Khushi Sharma</h3>
              <div className={styles.devHandle}>@Khushi14404</div>
              <span className={styles.devRoleBadge}>AI Architect</span>
              <p className={styles.devBio}>
                Passionate and detail-oriented developer who enjoys building full-stack applications with a focus on responsive web design, modern UI aesthetics, interactive data visualization, and intuitive user experiences.
              </p>

              <a
                href="https://github.com/Khushi14404"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.githubBtn}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub Profile</span>
              </a>
            </div>
          </div>
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
