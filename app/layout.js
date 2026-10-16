import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import BackgroundSky from "@/components/BackgroundSky";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata = {
  title: "YT Sentiment Analyzer — YouTube Video Stats & Viewer Sentiment",
  description:
    "Analyze YouTube video viewer sentiments, engagement metrics, and content quality through AI-powered comment analysis.",
  keywords: "YouTube, sentiment analysis, video stats, viewer sentiment, comment analysis",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerifDisplay.variable}`}>
      <head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=block"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white antialiased selection:bg-[#9b8cff] selection:text-black">
        <BackgroundSky />
        {children}
      </body>
    </html>
  );
}


