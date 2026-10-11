import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandRow}>
          <div className={styles.brandInfo}>
            <div className={styles.brandLogo}>
              <img src="/logo.png" alt="YT Sentiment" className={styles.logoImg} />
              <span className={styles.brandName}>YT Sentiment Analyzer</span>
            </div>
            <p className={styles.brandDesc}>
              AI-driven viewer emotion breakdown, clickbait auditing, and content intelligence for
              modern YouTube viewers and creators.
            </p>
          </div>

          <div className={styles.linksCol}>
            <span className={styles.colHeading}>Explore</span>
            <Link href="/" className={styles.link}>
              Analyzer
            </Link>
            <Link href="/how-it-works" className={styles.link}>
              How It Works
            </Link>
            <Link href="/about" className={styles.link}>
              About & Ambassadors
            </Link>
          </div>

          <div className={styles.ambassadorCol}>
            <span className={styles.colHeading}>Brand Ambassadors</span>
            <div className={styles.ambassadorPill}>
              <img
                src="/images/dogs/happy-dog.png"
                alt="Buddy"
                className={styles.miniPup}
              />
              <div>
                <strong>Buddy</strong>
                <span>Positive Praise</span>
              </div>
            </div>
            <div className={styles.ambassadorPill}>
              <img
                src="/images/dogs/neutral-dog.png"
                alt="Sammy"
                className={styles.miniPup}
              />
              <div>
                <strong>Sammy</strong>
                <span>Balanced Pulse</span>
              </div>
            </div>
            <div className={styles.ambassadorPill}>
              <img
                src="/images/dogs/sad-dog.png"
                alt="Barnaby"
                className={styles.miniPup}
              />
              <div>
                <strong>Barnaby</strong>
                <span>Critical Quality</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            <span>YT Sentiment Analyzer © 2026</span>
            <span className={styles.bullet}>•</span>
            <span>All rights reserved</span>
          </div>

          <div className={styles.devCredits}>
            <span>Developed By</span>
            <a
              href="https://github.com/CodeByShaurya"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.devLink}
            >
              CodeByShaurya
            </a>
            <span>and</span>
            <a
              href="https://github.com/Khushi14404"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.devLink}
            >
              Khushi
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
