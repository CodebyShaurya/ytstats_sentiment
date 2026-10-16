"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar({
  mode = "watcher",
  onModeChange,
  hasSearched = false,
  onResetSearch,
  renderSearchCompact = null,
}) {
  const pathname = usePathname();

  return (
    <header className={`${styles.header} ${hasSearched ? styles.headerSearched : ""}`}>
      {/* Left: Brand Logo & Title */}
      <div className={styles.leftGroup}>
        <Link
          href="/"
          className={styles.logoLink}
          onClick={() => {
            if (onResetSearch) onResetSearch();
          }}
          title="YT Sentiment Analyzer"
        >
          <div className={styles.orbitSvgBadge}>
            <svg
              viewBox="0 0 26.9 16.6"
              style={{ width: "26px", height: "16px", overflow: "visible" }}
              fill="none"
              aria-hidden="true"
            >
              <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="currentColor" strokeWidth="1.25"/>
              <circle cx="13.25" cy="8.4" r="8.8" fill="#000"/>
              <circle cx="13.25" cy="8.4" r="8.1" fill="currentColor"/>
              <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="#000" strokeWidth="0.9" strokeDasharray="28.2 28.2"/>
              <ellipse cx="13.25" cy="8.4" rx="13.2" ry="2.9" transform="rotate(-25 13.25 8.4)" stroke="currentColor" strokeWidth="1.25" strokeDasharray="28.2 28.2"/>
            </svg>
          </div>
          <div className={styles.logoTextGroup}>
            <span className={styles.logoTitle}>YT Sentiment</span>
          </div>
        </Link>
      </div>

      {/* Middle: Compact Search Bar if searched, or Main Navigation */}
      {hasSearched && renderSearchCompact ? (
        <div className={styles.centerSearchWrapper}>{renderSearchCompact()}</div>
      ) : (
        <nav className={styles.navLinks} aria-label="Main Navigation">
          <Link
            href="/"
            className={`${styles.navLink} ${pathname === "/" ? styles.navLinkActive : ""}`}
          >
            Home
          </Link>
          <Link
            href="/how-it-works"
            className={`${styles.navLink} ${pathname === "/how-it-works" ? styles.navLinkActive : ""}`}
          >
            How It Works
          </Link>
          <Link
            href="/about"
            className={`${styles.navLink} ${pathname === "/about" ? styles.navLinkActive : ""}`}
          >
            About
          </Link>
        </nav>
      )}

      {/* Right: Compact nav links only when searched, modes live in input bar */}
      <div className={styles.rightGroup}>
        {hasSearched && (
          <div className={styles.compactNavRow}>
            <Link href="/how-it-works" className={styles.compactNavLink} title="How It Works">
              Help
            </Link>
            <Link href="/about" className={styles.compactNavLink} title="About">
              About
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
