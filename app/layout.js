import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "YT Sentiment Analyzer — YouTube Video Stats & Viewer Sentiment",
  description:
    "Analyze YouTube video viewer sentiments, engagement metrics, and content quality through AI-powered comment analysis.",
  keywords: "YouTube, sentiment analysis, video stats, viewer sentiment, comment analysis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
